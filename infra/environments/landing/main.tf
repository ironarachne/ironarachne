/**
 * The studio website at www.ironarachne.com, plus the apex redirect that feeds it.
 *
 * The studio-website repository publishes to the existing Bunny storage zone
 * iron-arachne-web. The old Scaleway bucket is retained for rollback.
 *
 * Applying this is two phases, and the split is not optional. See the comment on
 * the apex record below, and "The DNS cutover" in docs/landing-page.md.
 */

provider "scaleway" {
  region          = var.region
  project_id      = var.scaleway_project_id
  organization_id = var.scaleway_organization_id
}

provider "bunnynet" {
  # API key comes from BUNNYNET_API_KEY.
}

module "site" {
  source = "../../modules/static_site"

  environment = "landing"
  subdomain   = "www"

  bucket_name    = "ironarachne-web-landing"
  pull_zone_name = "ironarachne-landing"

  bunny_storage_zone_id = 2047456

  region = var.region
}

# Read-only, exactly as the module does. The zone predates this code and carries
# records it must not touch — including the apex TXT and MX records that carry
# live email. Only the apex record below is ever declared here.
data "bunnynet_dns_zone" "site" {
  domain = "ironarachne.com"
}

/**
 * The apex, which redirects to www.
 *
 * This was a Bunny `Redirect` record, which was the design's first choice
 * because it needs no origin and no bucket of its own. **It does not work, and
 * the reason is not visible from the configuration.** Bunny builds the target
 * as `value + "/" + requestPath` while the request path keeps its own leading
 * slash, so every apex request is redirected to a doubled slash:
 *
 *     https://ironarachne.com/     ->  https://www.ironarachne.com//
 *     https://ironarachne.com/foo  ->  https://www.ironarachne.com//foo
 *
 * `//` is not `/` to the bucket website origin, so the front door answered 404
 * while `www` answered 200. Setting `value` to a trailing-slash form was tried
 * against the live record and doubles it just the same; the behaviour is not
 * documented, and there is no field on the record that changes it.
 *
 * So the apex is a second hostname on the landing pull zone instead, and the
 * redirect is an edge rule, which is the fallback docs/landing-page.md named
 * when it recorded this as unverified. Three resources rather than one, and
 * every hop is one we control.
 */

# Bunny is authoritative for this zone, so the apex can be linked straight to a
# pull zone — the provider's own record type for it, rather than hardcoding the
# anycast addresses an A/AAAA pair would need. `name = ""` is the documented
# spelling for the apex, and `pullzone_id` is required for this type.
#
# `value` is the pull zone **name**, not its `.b-cdn.net` hostname. The provider
# requires the attribute to be non-empty but Bunny overwrites whatever is sent
# with the name, so a hostname here fails the apply with "Provider produced
# inconsistent result after apply" — after the record has already been created.
# That is a confusing failure to meet at an apex that is mid-cutover, because it
# reads as a provider bug and is really a value that cannot be chosen.
resource "bunnynet_dns_record" "apex" {
  zone = data.bunnynet_dns_zone.site.id

  name        = ""
  type        = "PullZone"
  value       = module.site.pull_zone_name
  pullzone_id = module.site.pull_zone_id
  ttl         = 300

  comment = "Apex, served by the landing pull zone. Managed by OpenTofu in infra/."
}

# The certificate cannot be issued until the apex resolves to the pull zone, the
# same ordering the module documents for `www`. Expect this to be the step that
# needs a second apply.
resource "bunnynet_pullzone_hostname" "apex" {
  pullzone = module.site.pull_zone_id
  name     = "ironarachne.com"

  tls_enabled = true
  force_ssl   = true

  depends_on = [bunnynet_dns_record.apex]
}

/**
 * The redirect itself.
 *
 * The pull zone now answers for both names, so this has to fire on the apex
 * only. The rule sends apex requests to the www homepage. The studio site uses
 * www in its canonical URLs and links so visitors can reach its deep links.
 */
resource "bunnynet_pullzone_edgerule" "apex_redirect" {
  enabled     = true
  pullzone    = module.site.pull_zone_id
  description = "Redirect the apex to www."
  match_type  = "MatchAny"

  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns   = ["https://ironarachne.com/*"]
      parameter1 = null
      parameter2 = null
    }
  ]

  actions = [
    {
      type       = "Redirect"
      parameter1 = "https://www.ironarachne.com/"
      parameter2 = "301"
      parameter3 = null
    }
  ]
}
