locals {
  dev_hostname        = "dev.vastways.app"
  dev_storage_zone_id = 2047627
}

data "bunnynet_dns_zone" "vastways" {
  domain = "vastways.app"
}

resource "bunnynet_pullzone" "vastways" {
  name                  = "vastways-dev"
  cache_enabled         = true
  cache_expiration_time = 2592000

  origin {
    type        = "StorageZone"
    storagezone = local.dev_storage_zone_id
  }

  routing {
    tier  = "Standard"
    zones = ["EU", "US", "ASIA", "SA", "AF"]
  }
}

import {
  to = bunnynet_pullzone.vastways
  id = "6974932"
}

resource "bunnynet_dns_record" "vastways" {
  zone  = data.bunnynet_dns_zone.vastways.id
  name  = "dev"
  type  = "CNAME"
  value = "vastways-dev.b-cdn.net"
  ttl   = 3600
}

import {
  to = bunnynet_dns_record.vastways
  id = "971151|33822184"
}

resource "bunnynet_pullzone_hostname" "vastways" {
  pullzone    = bunnynet_pullzone.vastways.id
  name        = local.dev_hostname
  tls_enabled = true
  force_ssl   = true

  depends_on = [bunnynet_dns_record.vastways]
}

import {
  to = bunnynet_pullzone_hostname.vastways
  id = "6974932|dev.vastways.app"
}
