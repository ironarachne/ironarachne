output "url" {
  description = "Public URL the landing page is served from."
  value       = module.site.url
}

output "bucket_name" {
  description = "Former Scaleway origin bucket, retained for rollback."
  value       = module.site.bucket_name
}

output "bucket_website_endpoint" {
  description = "Website endpoint of the former Scaleway origin."
  value       = module.site.bucket_website_endpoint
}

output "cdn_hostname" {
  description = "Pull zone hostname. Serves the page before DNS is cut over, which is how phase one is verified."
  value       = module.site.cdn_hostname
}

output "pull_zone_id" {
  description = "Pull zone ID used by the Studio Website deployment workflow."
  value       = module.site.pull_zone_id
}
