/**
 * One environment's static site: a public Object Storage bucket serving the
 * built SvelteKit output, fronted by a Bunny pull zone that terminates TLS for
 * the environment's own subdomain.
 *
 * Deployments are deliberately not modelled here — nothing in this module
 * uploads objects. See docs/infrastructure.md.
 */

locals {
  fqdn = "${var.subdomain}.${var.dns_zone_domain}"

  # Scaleway serves bucket websites from a per-region endpoint distinct from the
  # bucket's S3 API endpoint. This is what the pull zone fetches from.
  bucket_website_host = "${var.bucket_name}.s3-website.${var.region}.scw.cloud"

  # Every pull zone answers on <name>.b-cdn.net. Deriving the CNAME target from
  # the name rather than a server-assigned ID keeps the whole DNS graph
  # resolvable at plan time.
  cdn_hostname = "${var.pull_zone_name}.b-cdn.net"
}

# Read-only: the zone already exists and carries records unrelated to this code.
data "bunnynet_dns_zone" "site" {
  domain = var.dns_zone_domain
}

resource "scaleway_object_bucket" "site" {
  name   = var.bucket_name
  region = var.region

  tags = {
    environment = var.environment
    managed_by  = "opentofu"
  }
}

/**
 * Enabling the bucket website applies a default policy that makes every object
 * public. Declaring the policy explicitly means the access rule is visible in
 * code and reviewable, rather than an implicit side effect.
 */
resource "scaleway_object_bucket_policy" "public_read" {
  bucket = scaleway_object_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "${var.bucket_name}-public-read"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = ["${var.bucket_name}/*"]
      },
    ]
  })
}

resource "scaleway_object_bucket_website_configuration" "site" {
  bucket = scaleway_object_bucket.site.id

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }
}

resource "bunnynet_pullzone" "site" {
  name = var.pull_zone_name

  # The provider defaults this to false. Left off, every request would reach the
  # bucket and the CDN would buy nothing but TLS.
  cache_enabled         = true
  cache_expiration_time = var.cache_expiration_time

  origin {
    type = "OriginUrl"
    url  = "https://${local.bucket_website_host}"

    # Must stay false. Forwarding the visitor's Host would send
    # "dev.ironarachne.com" to Object Storage, whose bucket-website router has
    # no bucket under that name and cannot serve the request.
    forward_host_header = false
    verify_ssl          = true
  }

  routing {
    tier  = var.pull_zone_tier
    zones = var.pull_zone_zones
  }

  depends_on = [scaleway_object_bucket_website_configuration.site]
}

resource "bunnynet_pullzone_hostname" "site" {
  pullzone = bunnynet_pullzone.site.id
  name     = local.fqdn

  # Omitting `certificate` and `certificate_key` is what selects Bunny's free
  # managed DV certificate. Supplying either switches to a custom one.
  tls_enabled = true
  force_ssl   = true

  # Issuing that certificate requires the hostname to already resolve to the
  # pull zone, so the record has to exist first. Bunny is authoritative for the
  # zone, so the wait is short — but on a cold create this is the step most
  # likely to need a second apply.
  depends_on = [bunnynet_dns_record.site]
}

resource "bunnynet_dns_record" "site" {
  zone = data.bunnynet_dns_zone.site.id

  name  = var.subdomain
  type  = "CNAME"
  value = local.cdn_hostname
  ttl   = var.dns_ttl

  comment = "${var.environment} site. Managed by OpenTofu in infra/."
}
