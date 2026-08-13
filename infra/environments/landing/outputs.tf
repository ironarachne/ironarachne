output "url" {
  description = "Public URL the landing page is served from."
  value       = module.site.url
}

output "bucket_name" {
  description = "Bucket CD uploads the landing page to."
  value       = module.site.bucket_name
}

output "bucket_website_endpoint" {
  description = "Origin the pull zone fetches from. Useful for checking the bucket in isolation from the CDN."
  value       = module.site.bucket_website_endpoint
}

output "cdn_hostname" {
  description = "Pull zone hostname. Serves the page before DNS is cut over, which is how phase one is verified."
  value       = module.site.cdn_hostname
}

output "pull_zone_id" {
  description = "Pull zone ID. scripts/publish_site.sh needs this for its cache purge; it is not known until the first apply."
  value       = module.site.pull_zone_id
}
