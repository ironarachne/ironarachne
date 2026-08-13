variable "environment" {
  description = "Deploy target this site serves: dev, staging, prod, or landing."
  type        = string

  validation {
    # "landing" is not an environment of the app; it is the marketing page at
    # www.ironarachne.com, which is a fourth thing this module builds rather
    # than a fourth copy of the app. The variable really means "which deploy
    # target is this", and the string only reaches a bucket tag and the DNS
    # record's comment, both of which read correctly as "landing".
    condition     = contains(["dev", "staging", "prod", "landing"], var.environment)
    error_message = "environment must be one of: dev, staging, prod, landing."
  }
}

variable "subdomain" {
  description = "Subdomain within dns_zone_domain that serves this environment, e.g. \"dev\" for dev.ironarachne.com."
  type        = string

  validation {
    # A record name, not a hostname: a dot here would silently create a
    # deeper subdomain than intended.
    condition     = can(regex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$", var.subdomain))
    error_message = "subdomain must be a single DNS label: lowercase letters, digits and hyphens."
  }
}

variable "dns_zone_domain" {
  description = "Existing Bunny DNS zone to add the record to. Read, never managed — the zone holds many records this code must not touch."
  type        = string
  default     = "ironarachne.com"
}

variable "bucket_name" {
  description = "Object Storage bucket name. Must be unique within the region."
  type        = string
}

variable "pull_zone_name" {
  description = "Bunny pull zone name. Must be globally unique across bunny.net, and determines the <name>.b-cdn.net hostname the DNS record targets."
  type        = string
}

variable "region" {
  description = "Scaleway region hosting the bucket."
  type        = string
  default     = "pl-waw"
}

variable "index_document" {
  description = "Object served for a path ending in a slash. Must be at the bucket root."
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Object served when no key matches. Must be at the bucket root. Produced by `npm run build` via adapter-static's fallback; see docs/static-hosting.md."
  type        = string
  default     = "404.html"
}

variable "pull_zone_tier" {
  description = "Bunny routing tier. Standard covers every region; Volume is cheaper but routes through fewer POPs."
  type        = string
  default     = "Standard"
}

variable "pull_zone_zones" {
  description = "Bunny routing zones to serve from."
  type        = set(string)
  default     = ["EU", "US", "ASIA", "SA", "AF"]
}

variable "cache_expiration_time" {
  description = <<-EOT
    Edge cache lifetime in seconds. -1 respects the origin's Cache-Control.

    Object Storage sends no Cache-Control of its own, so honouring the origin
    only produces sensible caching once the deployment step sets those headers
    on upload — long-lived for the content-hashed `_app/immutable/` assets,
    short for the HTML shells. Until then this is effectively Bunny's default.
  EOT
  type        = number
  default     = -1
}

variable "dns_ttl" {
  description = "TTL for the CNAME record, in seconds."
  type        = number
  default     = 300
}
