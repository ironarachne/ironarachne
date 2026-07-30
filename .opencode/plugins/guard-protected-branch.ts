import type { Plugin } from "@opencode-ai/plugin"
import { execSync } from "child_process"

const PROTECTED = /^(main|master)$/

function getBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  } catch {
    return ""
  }
}

export default (async () => {
  return {
    "permission.ask": async (input, output) => {
      if (input.type !== "bash") return

      const cmd = String(input.metadata?.command ?? "")
      if (!cmd.includes("git")) return

      const branch = getBranch()

      const writesHistory =
        /(^|[;&|\s])git\s+(commit|merge|rebase|cherry-pick|revert)(\s|$)/.test(cmd)
      if (writesHistory && PROTECTED.test(branch)) {
        output.status = "deny"
        return
      }

      if (/(^|[;&|\s])git\s+push/.test(cmd)) {
        const isForce = /--force([ =]|$)|--force-with-lease|\s-[a-zA-Z]*f(\s|$)/.test(cmd)
        if (isForce) {
          output.status = "deny"
          return
        }

        const pushesToProtected = /(^|[;&|\s])git\s+push[^|;&]*\s(main|master)(\s|$)/.test(cmd)
        if (pushesToProtected) {
          output.status = "deny"
          return
        }

        if (PROTECTED.test(branch)) {
          output.status = "deny"
          return
        }
      }
    },
  }
}) satisfies Plugin
