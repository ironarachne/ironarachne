locals {
  new_hostname    = "vastways.app"
  storage_zone_id = 2047619
}

data "bunnynet_dns_zone" "vastways" {
  domain = "vastways.app"
}

resource "bunnynet_pullzone" "vastways" {
  name                  = "vastways-app"
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
  id = "6974897"
}

resource "bunnynet_dns_record" "vastways" {
  zone  = data.bunnynet_dns_zone.vastways.id
  name  = ""
  type  = "CNAME"
  value = "vastways-app.b-cdn.net"
  ttl   = 3600
}

import {
  to = bunnynet_dns_record.vastways
  id = "971151|33821555"
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
  id = "6974897|vastways.app"
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
  id = "6245674|0e7592ba-e7d3-4122-9c7b-aace8f954e9a"
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
  id = "6245674|bc4c791f-e6d3-4478-a005-1c102642ce11"
}

resource "bunnynet_pullzone_edgerule" "noncanonical_noindex" {
  pullzone    = bunnynet_pullzone.vastways.id
  enabled     = true
  description = "Vastways production noncanonical noindex"
  match_type  = "MatchAny"

  triggers = [{
    type       = "Url"
    match_type = "MatchAny"
    patterns   = ["https://${local.new_hostname}/recover", "https://${local.new_hostname}/recover/*", "https://vastways-app.b-cdn.net/*"]
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
  to = bunnynet_pullzone_edgerule.noncanonical_noindex
  id = "6974897|f100073b-9be6-4f43-b277-5eba897edcd4"
}
