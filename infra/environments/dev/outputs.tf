output "url" {
  description = "Public URL for this environment."
  value       = module.site.url
}

output "bucket_name" {
  description = "Bucket CD uploads to."
  value       = module.site.bucket_name
}

output "bucket_website_endpoint" {
  description = "Origin the pull zone fetches from. Useful for checking the bucket in isolation from the CDN."
  value       = module.site.bucket_website_endpoint
}

output "pull_zone_id" {
  description = "Pull zone ID, for cache purges."
  value       = module.site.pull_zone_id
}
