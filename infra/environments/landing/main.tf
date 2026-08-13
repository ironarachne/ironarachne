/**
 * The landing page at www.ironarachne.com, plus the apex redirect that feeds it.
 *
 * This is not an environment of the app — it is a separate one-page static site,
 * built from `landing/` in this repository. It reuses `modules/static_site`
 * because the shape is identical: a public bucket behind a Bunny pull zone.
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

  region = var.region
}

# Read-only, exactly as the module does. The zone predates this code and carries
# records it must not touch; only the two below are ever declared here.
data "bunnynet_dns_zone" "site" {
  domain = "ironarachne.com"
}

/**
 * The apex. A CNAME cannot exist at a zone apex, but Bunny is authoritative for
 * this zone and offers a Redirect record, which needs no origin and no bucket of
 * its own — Bunny issues the certificate and answers the request. `name = ""` is
 * the provider's documented spelling for the apex.
 *
 * PHASE TWO ONLY. Both this record and the module's `www` record collide with
 * records that already exist and are not managed here:
 *
 *     www.ironarachne.com.  IN  CNAME  ironarachne.com.
 *     ironarachne.com.      IN  A      66.241.125.222   (Fly)
 *
 * A third record has to go at the same time even though nothing here collides
 * with it, and nothing will complain if it is forgotten:
 *
 *     ironarachne.com.      IN  AAAA   2a09:8280:1::87:402:0   (Fly, IPv6)
 *
 * Leave it and the apex still answers from Fly over IPv6 after a cutover that
 * otherwise looks clean.
 *
 * They have to be removed or imported first, and until `www` resolves to the pull
 * zone Bunny will not issue the managed certificate for it either. So the first
 * apply targets the bucket and pull zone only; this record and the module's
 * hostname and record land in the cutover. infra/README.md has the commands.
 */
resource "bunnynet_dns_record" "apex_redirect" {
  zone = data.bunnynet_dns_zone.site.id

  name  = ""
  type  = "Redirect"
  value = "https://www.ironarachne.com"
  ttl   = 300

  comment = "Apex redirect to www. Managed by OpenTofu in infra/."
}
