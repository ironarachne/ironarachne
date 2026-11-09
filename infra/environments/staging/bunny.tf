locals {
  new_hostname    = "staging.vastways.app"
  storage_zone_id = 2047630
}

data "bunnynet_dns_zone" "vastways" {
  domain = "vastways.app"
}

resource "bunnynet_pullzone" "vastways" {
  name                  = "vastways-staging"
  cache_enabled         = false
  cache_expiration_time = 2592000

  origin {
    type        = "StorageZone"
    storagezone = local.storage_zone_id
  }

  routing {
    tier  = "Standard"
    zones = ["US"]
  }
}

import {
  to = bunnynet_pullzone.vastways
  id = "6974950"
}

resource "bunnynet_dns_record" "vastways" {
  zone  = data.bunnynet_dns_zone.vastways.id
  name  = "staging"
  type  = "CNAME"
  value = "vastways-staging.b-cdn.net"
  ttl   = 3600
}

import {
  to = bunnynet_dns_record.vastways
  id = "971151|33822371"
}

resource "bunnynet_pullzone_hostname" "vastways" {
  pullzone    = bunnynet_pullzone.vastways.id
  name        = local.new_hostname
  tls_enabled = true
  force_ssl   = true

  depends_on = [bunnynet_dns_record.vastways]
}

import {
  to = bunnynet_pullzone_hostname.vastways
  id = "6974950|staging.vastways.app"
}
