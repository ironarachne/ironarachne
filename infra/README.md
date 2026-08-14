# infra

OpenTofu configuration for Iron Arachne's hosting: four static sites on Scaleway Object Storage,
each fronted by a Bunny pull zone that terminates TLS for its own subdomain.

Use **OpenTofu** (`tofu`), not Terraform. `>= 1.10` is required — the state backend relies on
`use_lockfile`, and Scaleway has no DynamoDB to lock against.

| Stack                  | Serves                    | Bucket                    | Pull zone             |
| ---------------------- | ------------------------- | ------------------------- | --------------------- |
| `environments/dev`     | `dev.ironarachne.com`     | `ironarachne-web-dev`     | `ironarachne-dev`     |
| `environments/staging` | `staging.ironarachne.com` | `ironarachne-web-staging` | `ironarachne-staging` |
| `environments/prod`    | `app.ironarachne.com`     | `ironarachne-web-prod`    | `ironarachne-prod`    |
| `environments/landing` | `www.ironarachne.com`     | `ironarachne-web-landing` | `ironarachne-landing` |
| `shared`               | the CD identity           | —                         | —                     |

`modules/static_site` holds the per-environment resources; each environment stack is a thin call to
it with its own backend key. The design and the reasoning behind it are in `docs/infrastructure.md`.

`landing` is the odd one out: it is not an environment of the app but the one-page site built from
`landing/` in this repository, and it also owns the apex redirect. Its design is in
`docs/landing-page.md`, and **its first apply is deliberately partial** — see below.

## Credentials

Four environment variables, none of which belong in a file:

```bash
export SCW_ACCESS_KEY=…          # Scaleway API key, used by the provider
export SCW_SECRET_KEY=…
export BUNNYNET_API_KEY=…        # bunny.net API key

# The S3 state backend speaks AWS's dialect and reads AWS's variable names,
# so the same Scaleway key has to be exported twice.
export AWS_ACCESS_KEY_ID="$SCW_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SCW_SECRET_KEY"
```

Two identifiers are also required. They are not secrets, but they are account-specific, so they are
variables rather than committed values:

```bash
export TF_VAR_scaleway_organization_id=…
export TF_VAR_scaleway_project_id=…
```

Read them off the API key itself if you don't have them to hand:

```bash
project=$(curl -s -H "X-Auth-Token: $SCW_SECRET_KEY" \
  "https://api.scaleway.com/iam/v1alpha1/api-keys/$SCW_ACCESS_KEY" | jq -r .default_project_id)

curl -s -H "X-Auth-Token: $SCW_SECRET_KEY" \
  "https://api.scaleway.com/account/v3/projects/$project" | jq '{id, name, organization_id}'
```

## Running it

Each stack is a separate root module with its own state. Work inside one directory:

```bash
cd infra/environments/dev
tofu init
tofu plan
tofu apply
```

Apply `shared` once, in any order relative to the environments — nothing depends on it at plan time.

To read a plan without touching the state bucket's lock at all, add `-lock=false`. Safe for a
read-only look; never use it for an apply.

## The state bucket

State lives in `ironarachne-tfstate-poland` (`pl-waw`), one key per stack. That bucket is
deliberately **not** managed here: it holds the state that would manage it. Create it by hand if it
ever needs recreating.

Backend blocks cannot interpolate, so their settings are literal and repeated per stack. The four
`skip_*` flags are what let the S3 backend talk to Scaleway, which implements no STS, no IAM API and
none of the newer checksum headers.

## Minting the CD API key

Deliberately not Terraform's job: a key created by Terraform has its secret written to state.
`shared` creates the IAM application and a policy scoped to object-storage access on this project
only — read the bucket, and read, write and delete objects. Not `ObjectStorageFullAccess`, which
would let a leaked deploy key delete the buckets and rewrite their access policies.

Mint the key against that application by hand, and store it wherever CD reads secrets from:

```bash
cd infra/shared
app_id=$(tofu output -raw deployer_application_id)

scw iam api-key create application-id="$app_id" \
  description="CD: publish built site to environment buckets"
```

The secret is shown once. Nothing in this repository will ever hold it.

## First apply, and the one step that may need a retry

Bunny will not issue the managed TLS certificate for `dev.ironarachne.com` until that name already
resolves to the pull zone, so the module orders the DNS record ahead of the hostname. Bunny is
authoritative for `ironarachne.com`, so the gap is normally seconds — but on a cold create this is
the step most likely to fail. If it does, re-run `tofu apply`; the record will be in place and the
hostname will settle.

## The landing stack

**Applied. It now applies in one pass like any other stack** — the two-phase dance described below was
a migration constraint, and the migration is done.

The apex is three resources rather than the one `Redirect` record it was designed as. That record
works in the sense that it applies, resolves and serves a valid certificate — and redirects every
request to a doubled slash, which the origin 404s. Decision 3 in `docs/landing-page.md` has the
detail. **Verify an apex change by following the redirect to its final status code**, not by checking
that the 301 exists:

```bash
curl -sSL -o /dev/null -w '%{url_effective} %{http_code}\n' https://ironarachne.com/
# must end at https://www.ironarachne.com/ with 200
```

Do **not** touch the apex `TXT` and `MX` records — they carry live email, they are not managed here,
and deleting one breaks mail rather than the website. `docs/landing-page.md` has the query that
enumerates them.

### Why it once took two phases

Kept because the shape of the problem recurs whenever a live name moves into managed configuration,
not because anyone needs to repeat these commands.

Three records stood in the way, two of which the configuration wanted to create itself:

```
www.ironarachne.com.  IN  CNAME  ironarachne.com.
ironarachne.com.      IN  A      66.241.125.222          (Fly)
ironarachne.com.      IN  AAAA   2a09:8280:1::87:402:0   (Fly, IPv6)
```

The `AAAA` collided with nothing, which is exactly why it was easy to miss: the apply succeeds without
touching it and the apex keeps answering over IPv6 from the old host. A cutover that forgets it
half-lands silently, and every check that resolves IPv4 first reports success.

Applying the whole stack would have collided with the first two, and Bunny will not issue the managed
certificate for `www` until that name resolves to the pull zone — which it could not while it still
pointed at Fly. So phase one created only the bucket and the pull zone, via `-target`; phase two was a
plain apply after the three records were deleted.

`-target` is otherwise a smell, and that was the one thing it is genuinely for: a dependency living
outside the configuration that has to be dealt with in between.

## What this does not do

**Deployments.** Nothing here uploads objects. Publishing a build is CD's job, and the outputs it
needs are exposed for that purpose:

```bash
tofu output bucket_name              # upload target
tofu output bucket_website_endpoint  # origin, for checking the bucket without the CDN
tofu output pull_zone_id             # cache purges after a publish
```

One thing for whoever writes that step: the pull zone honours the origin's `Cache-Control`, and
Object Storage sends none of its own. Set those headers on upload — long-lived for the
content-hashed `_app/immutable/` assets, short for the HTML shells — or caching stays at Bunny's
default regardless of what is configured here.

**The existing DNS.** `ironarachne.com` carries many records predating this code. The zone is read
through a data source and never managed. Only the names this configuration introduces are declared
here: the three environment subdomains, plus `www` and the apex from the landing stack.
