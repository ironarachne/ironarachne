import type { Plugin } from "@opencode-ai/plugin"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export default (async () => {
  return {
    "tool.execute.after": async (input, output) => {
      const { tool, args } = input
      if (tool !== "Write" && tool !== "Edit") return

      const filePath = args?.filePath ?? args?.file_path
      if (!filePath) return

      try {
        await execAsync(`npx --no-install prettier --write --ignore-unknown "${filePath}"`, {
          stdio: "ignore",
        })
        output.output = (output.output ?? "") + "\n[auto-formatted with prettier]"
      } catch {
        // Fail open - formatting errors shouldn't block work
      }
    },
  }
}) satisfies Plugin
