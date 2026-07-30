provider "scaleway" {
  region          = var.region
  project_id      = var.scaleway_project_id
  organization_id = var.scaleway_organization_id
}

provider "bunnynet" {
  # API key comes from BUNNYNET_API_KEY.
}

module "site" {
  source = "../../modules/static_site"

  environment = "prod"
  subdomain   = "app"

  bucket_name    = "ironarachne-web-prod"
  pull_zone_name = "ironarachne-prod"

  region = var.region
}
