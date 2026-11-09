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

resource "bunnynet_pullzone_edgerule" "legacy_redirect" {
  pullzone    = module.site.pull_zone_id
  enabled     = true
  description = "Vastways legacy hostname redirect"
  match_type  = "MatchAll"

  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns   = ["https://${module.site.fqdn}/*", "http://${module.site.fqdn}/*"]
      parameter1 = null
      parameter2 = null
    },
    {
      type       = "Url"
      match_type = "MatchNone"
      patterns   = ["*/_app/*", "*/recover", "*/recover/*"]
      parameter1 = null
      parameter2 = null
    },
  ]

  actions = [{
    type       = "Redirect"
    parameter1 = "https://${local.new_hostname}{{path}}"
    parameter2 = "301"
    parameter3 = null
  }]
}

import {
  to = bunnynet_pullzone_edgerule.legacy_redirect
  id = "6245673|945d5d8d-f239-4535-8821-b8caec7e2151"
}

resource "bunnynet_pullzone_edgerule" "recovery_noindex" {
  pullzone    = module.site.pull_zone_id
  enabled     = true
  description = "Vastways legacy recovery noindex"
  match_type  = "MatchAny"

  triggers = [{
    type       = "Url"
    match_type = "MatchAny"
    patterns   = ["https://${module.site.fqdn}/recover", "https://${module.site.fqdn}/recover/*"]
    parameter1 = null
    parameter2 = null
  }]

  actions = [{
    type       = "SetResponseHeader"
    parameter1 = "X-Robots-Tag"
    parameter2 = "noindex"
    parameter3 = null
  }]
}

import {
  to = bunnynet_pullzone_edgerule.recovery_noindex
  id = "6245673|da9b7a2d-70f0-4998-a1c6-a129ec852992"
}
