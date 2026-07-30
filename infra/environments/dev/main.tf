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

  environment = "dev"
  subdomain   = "dev"

  bucket_name    = "ironarachne-web-dev"
  pull_zone_name = "ironarachne-dev"

  region = var.region
}
