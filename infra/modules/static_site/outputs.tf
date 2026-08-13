output "url" {
  description = "Public URL this environment is served from."
  value       = "https://${local.fqdn}"
}

output "fqdn" {
  description = "Fully qualified hostname for this environment."
  value       = local.fqdn
}

output "bucket_name" {
  description = "Bucket CD uploads the built site to."
  value       = scaleway_object_bucket.site.name
}

output "bucket_region" {
  description = "Region of the bucket, needed by any S3-compatible client."
  value       = var.region
}

output "bucket_website_endpoint" {
  description = "Bucket website endpoint, i.e. the pull zone's origin. Serves the site directly, without the CDN or the custom domain."
  value       = "https://${local.bucket_website_host}"
}

output "cdn_hostname" {
  description = "Pull zone hostname the DNS record points at."
  value       = local.cdn_hostname
}

output "pull_zone_id" {
  description = "Bunny pull zone ID, for cache purges from a deployment pipeline."
  value       = bunnynet_pullzone.site.id
}

output "pull_zone_name" {
  description = "Bunny pull zone name. This, not the hostname, is what a DNS record of type PullZone stores in `value`."
  value       = bunnynet_pullzone.site.name
}
