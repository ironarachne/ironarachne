import {
  heraldryFromSnapshot,
  type HeraldrySnapshot,
  renderHeraldryDeviceSvg,
} from '$lib/heraldry';

const HERALDRY_PREVIEW_WIDTH = 120;
const HERALDRY_PREVIEW_HEIGHT = 132;

export function buildHeraldryPreviewMap(
  snapshots: HeraldrySnapshot[],
): Record<string, string | null> {
  const previews: Record<string, string | null> = {};
  for (const snapshot of snapshots) {
    try {
      previews[snapshot.blazon] = renderHeraldryDeviceSvg(
        heraldryFromSnapshot(snapshot).arms.device,
        HERALDRY_PREVIEW_WIDTH,
        HERALDRY_PREVIEW_HEIGHT,
      );
    } catch {
      previews[snapshot.blazon] = null;
    }
  }
  return previews;
}
