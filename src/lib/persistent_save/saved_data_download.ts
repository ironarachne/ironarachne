import Download from '$lib/download';
import { heraldryFromSnapshot, type HeraldrySnapshot } from '$lib/heraldry/heraldry_snapshot';
import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
import SaveSVGToPNG from '$lib/renderers/svg-to-png';
import type { CultureSnapshot } from '$lib/culture/culture_snapshot';
import type { ReligionSnapshot } from '$lib/religion/religion_snapshot';

const HERALDRY_DOWNLOAD_WIDTH = 600;
const HERALDRY_DOWNLOAD_HEIGHT = 660;

export function slugifyDownloadName(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'item';
}

export function downloadSnapshotJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  Download(url, filename);
  URL.revokeObjectURL(url);
}

function heraldrySvgString(snapshot: HeraldrySnapshot): string {
  const restored = heraldryFromSnapshot(snapshot);
  return renderHeraldryDeviceSvg(
    restored.arms.device,
    HERALDRY_DOWNLOAD_WIDTH,
    HERALDRY_DOWNLOAD_HEIGHT,
  );
}

export function downloadHeraldrySvg(snapshot: HeraldrySnapshot): void {
  const svg = heraldrySvgString(snapshot);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  Download(window.URL.createObjectURL(blob), `heraldry-${snapshot.seed}.svg`);
}

export function downloadHeraldryPng(snapshot: HeraldrySnapshot): void {
  const svg = heraldrySvgString(snapshot);
  SaveSVGToPNG(svg, HERALDRY_DOWNLOAD_WIDTH, HERALDRY_DOWNLOAD_HEIGHT, `heraldry-${snapshot.seed}.png`);
}

export function downloadCultureJson(snapshot: CultureSnapshot): void {
  downloadSnapshotJson(`culture-${slugifyDownloadName(snapshot.name)}.json`, snapshot);
}

export function downloadReligionJson(snapshot: ReligionSnapshot): void {
  downloadSnapshotJson(`religion-${snapshot.seed}.json`, snapshot);
}
