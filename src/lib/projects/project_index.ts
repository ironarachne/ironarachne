import { isGameSystem, isGenre } from '$lib/tools';
import { readAllProjectRecords, type VaultResult } from '$lib/vault_db';

import { deriveSettingTags } from './project_setting';
import type { Project } from './project_types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * A stored record as a project, or `undefined` when it is not one.
 *
 * Nothing is repaired by guessing: a record missing an id has no identity to restore it under, and
 * one with a non-numeric `updatedAt` cannot be ordered against the rest. Once the import machinery
 * lands (#35) this is where a rejected record gets quarantined instead of dropped, and it is the
 * single place that has to change to do it.
 *
 * `genre` and `system` are the exception, and deliberately: an unrecognised value **drops the field
 * and keeps the project**. Rejecting the record would mean a vault written by a build that knows a
 * fifth genre loses the whole project here — its name, description, tags and id — and spills its
 * artifacts into the recovered-artifacts bucket, which is a far worse answer than a project that
 * lists every tool.
 */
export function toProject(value: unknown): Project | undefined {
  const record = asRecord(value);
  if (record === null) {
    return undefined;
  }
  if (typeof record.id !== 'string' || record.id === '') {
    return undefined;
  }
  if (typeof record.name !== 'string') {
    return undefined;
  }
  if (record.description !== undefined && typeof record.description !== 'string') {
    return undefined;
  }
  if (!isStringArray(record.tags)) {
    return undefined;
  }
  if (!isFiniteNumber(record.createdAt) || !isFiniteNumber(record.updatedAt)) {
    return undefined;
  }

  const project: Project = {
    id: record.id,
    name: record.name,
    tags: record.tags,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  if (record.description !== undefined) {
    project.description = record.description;
  }
  if (isGenre(record.genre)) {
    project.genre = record.genre;
  }
  if (isGameSystem(record.system)) {
    project.system = record.system;
  }
  // Derived on the way in as well as on the way out: a file may carry a `genre:` tag that disagrees
  // with the field, or one this build could not read, and neither may survive the read.
  project.tags = deriveSettingTags(project.tags, project);
  return project;
}

/**
 * Every project, by id — the hydrated index.
 *
 * `null` until it has been read, which is what separates "no projects" from "not looked yet". It
 * is a cache and never a source of truth, and nothing is put in it until the transaction that
 * wrote the record has committed: memory claiming a save the database does not have is the
 * failure docs/workshop.md spends a section on.
 */
let index: Map<string, Project> | null = null;

let hydrating: Promise<VaultResult<Project[]>> | null = null;

async function readIndex(): Promise<VaultResult<Project[]>> {
  const records = await readAllProjectRecords();
  if (!records.ok) {
    return records;
  }
  const hydrated = new Map<string, Project>();
  for (const record of records.value) {
    const project = toProject(record);
    if (project !== undefined) {
      hydrated.set(project.id, project);
    }
  }
  index = hydrated;
  return { ok: true, value: [...hydrated.values()] };
}

/**
 * Read every project into memory, once, so that listing them stays synchronous for callers. Cheap
 * and safe to call repeatedly: after the first success it answers from the cache.
 *
 * A failure is not cached — a browser that had no database when the page loaded may have one by
 * the time the user creates a project.
 */
export async function hydrateProjects(): Promise<VaultResult<Project[]>> {
  if (index !== null) {
    return { ok: true, value: [...index.values()] };
  }
  hydrating ??= readIndex();
  try {
    return await hydrating;
  } finally {
    hydrating = null;
  }
}

/** True once the projects have been read. Callers listing before this get an empty vault. */
export function projectsHydrated(): boolean {
  return index !== null;
}

/**
 * Drop the cache so the next hydration re-reads the database. What replacing the whole store —
 * a vault import, a "clear everything" — has to do, and what a test does between cases.
 *
 * Call it when no hydration is in flight: one already reading would finish afterwards and put the
 * records it read back, which is the stale state this was called to get rid of.
 */
export function resetProjectIndex(): void {
  index = null;
  hydrating = null;
}

export function indexedProjects(): Project[] {
  return index === null ? [] : [...index.values()];
}

export function indexedProject(id: string): Project | undefined {
  return index?.get(id);
}

/** Record a committed write. Never called before the transaction behind it has committed. */
export function rememberProject(project: Project): void {
  index?.set(project.id, project);
}

/** Record a committed delete. */
export function forgetProject(id: string): void {
  index?.delete(id);
}
