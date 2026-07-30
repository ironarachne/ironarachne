import type { Plugin } from "@opencode-ai/plugin"
import { execSync } from "child_process"

function contentCheck(
  added: string,
  label: string,
  pattern: RegExp,
): string | null {
  const match = added.split("\n").find((line) => pattern.test(line))
  return match ? `${label} -> ${match.slice(0, 100)}` : null
}

function nameCheck(
  names: string,
  label: string,
  pattern: RegExp,
): string | null {
  const match = names.split("\n").find((line) => pattern.test(line))
  return match ? `${label} -> ${match}` : null
}

export default (async () => {
  return {
    "permission.ask": async (input, output) => {
      if (input.type !== "bash") return

      const cmd = String(input.metadata?.command ?? "")
      if (!/(^|[;&|\s])git\s+commit(\s|$)/.test(cmd)) return

      try {
        execSync("git rev-parse --git-dir", { stdio: "ignore" })
      } catch {
        return
      }

      let staged = ""
      let names = ""
      try {
        staged = execSync("git diff --cached --unified=0", {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString()
        names = execSync("git diff --cached --name-only", {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString()
      } catch {
        return
      }

      if (/git\s+commit[^|;&]*\s-[a-zA-Z]*a/.test(cmd)) {
        try {
          staged +=
            "\n" +
            execSync("git diff --unified=0", {
              stdio: ["ignore", "pipe", "ignore"],
            }).toString()
          names +=
            "\n" +
            execSync("git diff --name-only", {
              stdio: ["ignore", "pipe", "ignore"],
            }).toString()
        } catch {
          // ignore
        }
      }

      const added = staged
        .split("\n")
        .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
        .join("\n")

      if (!added && !names) return

      const hits: string[] = []

      const checks: Array<{ label: string; pattern: RegExp; type: "content" | "name" }> = [
        { label: "AWS access key id", pattern: /AKIA[0-9A-Z]{16}/, type: "content" },
        { label: "private key block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, type: "content" },
        { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9]{30,}/, type: "content" },
        { label: "Slack token", pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/, type: "content" },
        { label: "npm token", pattern: /npm_[A-Za-z0-9]{30,}/, type: "content" },
        { label: "PyPI token", pattern: /pypi-[A-Za-z0-9_-]{30,}/, type: "content" },
        {
          label: "credential assigned to a variable",
          pattern:
            /(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd)["']?\s*[:=]\s*["'][^"']{16,}["']/,
          type: "content",
        },
        { label: "environment file", pattern: /(^|\/)\.env($|\.)/, type: "name" },
        { label: "private key file", pattern: /\.(pem|p12|pfx|key)$/, type: "name" },
        { label: "SSH private key", pattern: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/, type: "name" },
        { label: "npm auth config", pattern: /(^|\/)\.npmrc$/, type: "name" },
      ]

      for (const check of checks) {
        const hit =
          check.type === "content"
            ? contentCheck(added, check.label, check.pattern)
            : nameCheck(names, check.label, check.pattern)
        if (hit) hits.push(`  - ${hit}`)
      }

      if (hits.length === 0) return

      output.status = "deny"
    },
  }
}) satisfies Plugin
