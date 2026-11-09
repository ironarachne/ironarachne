#!/usr/bin/env python3
"""Publish an unpacked Vastways build to Bunny Storage and verify its CDN."""

import hashlib
import json
import mimetypes
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


API = "https://api.bunny.net"
IMMUTABLE = "_app/immutable/"
TARGETS = {
    "dev": ("https://dev.vastways.app", 6974932, 2047627, "vastways-dev"),
    "staging": ("https://staging.vastways.app", 6974950, 2047630, "vastways-staging"),
    "prod": ("https://vastways.app", 6974897, 2047619, "vastways-app"),
}
NESTED_ROUTE = "fantasy/dcc/character/"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
MUTABLE_CACHE = "public, max-age=0, must-revalidate"


def request(url, key=None, method="GET", body=None, headers=None, status=200):
    req = Request(url, data=body, method=method, headers=headers or {})
    if key:
        req.add_unredirected_header("AccessKey", key)
    for attempt in range(3):
        try:
            with urlopen(req, timeout=25) as response:
                if status is not None and response.status != status:
                    raise RuntimeError(f"{method} {url} returned HTTP {response.status}")
                return response.read(), response.headers
        except HTTPError as error:
            if error.code == status or (method == "DELETE" and error.code == 404):
                return error.read(), error.headers
            if attempt == 2 or (error.code != 429 and error.code < 500):
                raise RuntimeError(f"{method} {url} returned HTTP {error.code}") from None
        except (URLError, TimeoutError):
            if attempt == 2:
                raise RuntimeError(f"{method} {url} could not connect") from None
        time.sleep(2 ** attempt)


def stored_files(storage_url, password, directory=""):
    entries = json.loads(request(f"{storage_url}/{quote(directory)}", password)[0])
    for entry in entries:
        name = entry["ObjectName"]
        if not name or name in {".", ".."} or "/" in name:
            raise RuntimeError("Bunny Storage returned an invalid object name")
        path = directory + name
        if entry["IsDirectory"]:
            yield from stored_files(storage_url, password, path + "/")
        else:
            yield path, entry.get("Checksum")


def configure_cdn(pull_url, pull_zone, hostname, api_key, noindex):
    # Bunny action IDs: 25 overrides browser Cache-Control, 5 sets a response header.
    # Trigger match 2 is MatchNone, so the mutable rule excludes hashed assets.
    rules = [
        ("Vastways immutable browser cache", 25, IMMUTABLE_CACHE, "", 0, f"*/{IMMUTABLE}*"),
        ("Vastways mutable browser cache", 25, MUTABLE_CACHE, "", 2, f"*/{IMMUTABLE}*"),
    ]
    if noindex:
        label = "dev" if hostname["Value"].startswith("dev.") else "staging"
        rules.append((f"Vastways {label} noindex", 5, "X-Robots-Tag", "noindex", 0, "*"))
    existing = {rule["Description"]: rule for rule in pull_zone.get("EdgeRules", [])}
    for description, action, first, second, match, pattern in rules:
        if description in existing:
            continue
        body = json.dumps({
            "Enabled": True,
            "Description": description,
            "ActionType": action,
            "ActionParameter1": first,
            "ActionParameter2": second,
            "ActionParameter3": "",
            "ExtraActions": [],
            "TriggerMatchingType": match,
            "Triggers": [{"Type": 0, "PatternMatchingType": 0, "PatternMatches": [pattern]}],
        }).encode()
        request(f"{pull_url}/edgerules/addOrUpdate", api_key, "POST", body,
                {"Content-Type": "application/json"}, status=201)
    if not hostname["ForceSSL"]:
        body = json.dumps({"Hostname": hostname["Value"], "ForceSSL": True}).encode()
        request(f"{pull_url}/setForceSSL", api_key, "POST", body,
                {"Content-Type": "application/json"}, status=204)


def verify_cdn(site, build, asset, noindex):
    checks = (
        ("", "index.html", 200, {"max-age=0", "must-revalidate"}),
        (NESTED_ROUTE + "?seed=bunny%20rollout%2B1", NESTED_ROUTE + "index.html", 200,
         {"max-age=0", "must-revalidate"}),
        (asset, asset, 200, {"max-age=31536000", "immutable"}),
        ("vastways-deployment-check-missing/", "404.html", 404, set()),
    )
    for route, source, status, cache in checks:
        expected = (build / source).read_bytes()
        for attempt in range(6):
            try:
                actual, headers = request(f"{site}/{route}", status=status)
                # Bunny may append a newline when serving the custom error document.
                if status == 404:
                    actual, expected = actual.rstrip(), expected.rstrip()
                if actual != expected:
                    raise RuntimeError(f"{site}/{route} does not match the build")
                directives = {value.strip() for value in headers.get("Cache-Control", "").split(",")}
                if not cache <= directives:
                    raise RuntimeError(f"{site}/{route} has unexpected cache headers: {directives}")
                if noindex and route == "" and headers.get("X-Robots-Tag") != "noindex":
                    raise RuntimeError(f"{site}/ is missing its noindex header")
                print(f"Verified HTTP {status} at {site}/{route}", flush=True)
                break
            except RuntimeError:
                if attempt == 5:
                    raise
                time.sleep(5)


def publish(environment, build):
    api_key = os.environ.get("BUNNYNET_API_KEY")
    if not api_key:
        raise RuntimeError("BUNNYNET_API_KEY is not set")
    for required in ("index.html", "404.html", NESTED_ROUTE + "index.html"):
        if not (build / required).is_file():
            raise RuntimeError(f"Missing {build / required}. Unpack the complete build first.")

    files = {path.relative_to(build).as_posix(): path for path in build.rglob("*") if path.is_file()}
    assets = sorted(name for name in files if name.startswith(IMMUTABLE))
    if not assets:
        raise RuntimeError(f"Missing {build / IMMUTABLE}. Unpack the complete build first.")

    site, pull_id, zone_id, storage_name = TARGETS[environment]
    pull_url = f"{API}/pullzone/{pull_id}"
    pull_zone = json.loads(request(pull_url, api_key)[0])
    if pull_zone["StorageZoneId"] != zone_id:
        raise RuntimeError(f"Pull zone {pull_id} must use Bunny storage zone {zone_id}")
    hostname = next((entry for entry in pull_zone["Hostnames"]
                     if entry["Value"] == site.removeprefix("https://")), None)
    if not hostname or not hostname["HasCertificate"]:
        raise RuntimeError(f"Pull zone {pull_id} has no HTTPS certificate for {site}")
    zone_url = f"{API}/storagezone/{zone_id}"
    zone = json.loads(request(zone_url, api_key)[0])
    if zone["Name"] != storage_name:
        raise RuntimeError(f"Pull zone {pull_id} must use {storage_name}")
    host = zone["StorageHostname"]
    if not re.fullmatch(r"(?:[a-z0-9-]+\.)?storage\.bunnycdn\.com", host):
        raise RuntimeError("Bunny returned an unexpected storage endpoint")
    password = zone.get("Password")
    if not password:
        raise RuntimeError("The Bunny API key cannot read the zone upload credential")
    storage_url = f"https://{host}/{storage_name}"
    remote = dict(stored_files(storage_url, password))

    def upload(name):
        contents = files[name].read_bytes()
        checksum = hashlib.sha256(contents).hexdigest().upper()
        if (remote.get(name) or "").upper() == checksum:
            return
        mime_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
        request(f"{storage_url}/{quote(name)}", password, "PUT", contents,
                {"Content-Type": mime_type, "Checksum": checksum}, status=201)

    print(f"Publishing {build} to {storage_name} (Bunny storage zone {zone_id})", flush=True)
    mutable = sorted(set(files) - set(assets))
    with ThreadPoolExecutor(max_workers=4) as workers:
        # Finish each pass before submitting the next one. Existing open tabs can still load old hashes.
        for group in (assets, [name for name in mutable if not name.endswith(".html")],
                      [name for name in mutable if name.endswith(".html")]):
            list(workers.map(upload, group))
    for name in sorted(remote.keys() - files.keys()):
        if not name.startswith(IMMUTABLE):
            request(f"{storage_url}/{quote(name)}", password, "DELETE", status=None)

    if zone.get("Custom404FilePath") != "/404.html" or zone.get("Rewrite404To200"):
        body = json.dumps({"Custom404FilePath": "/404.html", "Rewrite404To200": False}).encode()
        request(zone_url, api_key, "POST", body, {"Content-Type": "application/json"}, status=None)
    noindex = environment != "prod"
    configure_cdn(pull_url, pull_zone, hostname, api_key, noindex)
    request(f"{pull_url}/purgeCache", api_key, "POST", b"", status=None)
    verify_cdn(site, build, assets[0], noindex)


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in TARGETS:
        raise SystemExit(f"Usage: {sys.argv[0]} <{'|'.join(TARGETS)}> <build-dir>")
    try:
        publish(sys.argv[1], Path(sys.argv[2]))
    except RuntimeError as error:
        raise SystemExit(str(error)) from None
