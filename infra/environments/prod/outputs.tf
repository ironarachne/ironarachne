output "url" {
  description = "Public URL for this environment."
  value       = "https://${local.new_hostname}"
}

output "bucket_name" {
  description = "Former Scaleway origin bucket, retained for recovery and rollback."
  value       = module.site.bucket_name
}

output "bucket_website_endpoint" {
  description = "Website endpoint of the former Scaleway origin."
  value       = module.site.bucket_website_endpoint
}

output "pull_zone_id" {
  description = "Pull zone ID, for cache purges."
  value       = bunnynet_pullzone.vastways.id
}

output "bunny_storage_zone_id" {
  description = "Bunny Storage origin used by the promotion workflow."
  value       = local.storage_zone_id
}
