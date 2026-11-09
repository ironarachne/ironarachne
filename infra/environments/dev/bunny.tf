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

resource "bunnynet_pullzone_edgerule" "legacy_redirect" {
  pullzone    = module.site.pull_zone_id
  enabled     = true
  description = "Vastways legacy dev redirect"
  match_type  = "MatchAll"

  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns   = ["https://dev.ironarachne.com/*", "http://dev.ironarachne.com/*"]
      parameter1 = null
      parameter2 = null
    },
    {
      type       = "Url"
      match_type = "MatchNone"
      patterns   = ["*/_app/immutable/*"]
      parameter1 = null
      parameter2 = null
    },
  ]

  actions = [{
    type       = "Redirect"
    parameter1 = "https://${local.dev_hostname}{{path}}"
    parameter2 = "301"
    parameter3 = null
  }]
}

import {
  to = bunnynet_pullzone_edgerule.legacy_redirect
  id = "6245647|5b23b879-d494-43d7-bd95-bb77eb95ac12"
}
