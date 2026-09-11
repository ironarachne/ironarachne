#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);

  const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const input = payload.tool_input ?? {};
  const paths = new Set();

  for (const candidate of [input.file_path, input.filePath, input.path]) {
    if (typeof candidate === 'string') paths.add(candidate);
  }

  if (typeof input.patch === 'string') {
    for (const match of input.patch.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm)) {
      paths.add(match[1]);
    }
  }

  const existingPaths = [...paths].filter((path) => existsSync(path));
  if (existingPaths.length > 0) {
    spawnSync(
      'npx',
      ['--no-install', 'prettier', '--write', '--ignore-unknown', '--', ...existingPaths],
      {
        stdio: 'ignore',
      },
    );
  }
} catch {
  // Fail open: formatting errors should not block work.
}
