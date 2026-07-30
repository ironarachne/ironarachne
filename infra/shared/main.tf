/**
 * Resources shared by every environment. Currently the identity CD uses to
 * upload built sites to the environment buckets.
 *
 * Kept out of the environment stacks because it is one identity across all
 * three: three stacks each declaring it would fight over the same objects.
 */

provider "scaleway" {
  region          = var.region
  project_id      = var.scaleway_project_id
  organization_id = var.scaleway_organization_id
}

resource "scaleway_iam_application" "deployer" {
  name        = "ironarachne-deployer"
  description = "CD identity that uploads the built static site to the environment buckets. Its API key is created out-of-band so the secret never enters Terraform state."

  tags = ["managed-by-opentofu"]
}

/**
 * Scoped to exactly what publishing a static site needs: read the bucket, then
 * read, write and delete objects within it. Deliberately not
 * ObjectStorageFullAccess, which would also let a leaked deploy key delete the
 * buckets themselves and rewrite their access policies.
 */
resource "scaleway_iam_policy" "deployer_object_storage" {
  name           = "ironarachne-deployer-object-storage"
  description    = "Lets the CD identity publish site content, and nothing else."
  application_id = scaleway_iam_application.deployer.id

  rule {
    project_ids = [var.scaleway_project_id]

    permission_set_names = [
      "ObjectStorageBucketsRead",
      "ObjectStorageObjectsRead",
      "ObjectStorageObjectsWrite",
      "ObjectStorageObjectsDelete",
    ]
  }
}
