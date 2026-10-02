import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { buildBaseMapGraph } from './builder';
import { buildRegionMapSvgString } from './region_map_svg';
import type { RegionMapSvgFeature } from './region_map_svg_types';

const map = buildBaseMapGraph({
  width: 60,
  height: 35,
  pointSpacing: 3,
  seed: 'facts',
  rng: new RNG('facts'),
});
const interior = map.nodes.filter(
  ({ center }) => center.x > 10 && center.x < 50 && center.y > 10 && center.y < 25,
);
const feature = (kind: RegionMapSvgFeature['kind'], index = 0): RegionMapSvgFeature => ({
  id: `${kind}:saved`,
  name: `Named ${kind}`,
  kind,
  nodeIds: [interior[index].id],
  edgeIds: [],
});

describe('regional map features', () => {
  it('uses stored identities and escaped names on both labels and symbols', () => {
    const fact = { ...feature('landmark'), id: 'place:"<&', name: 'Survey <& "site"' };
    const svg = buildRegionMapSvgString(map, { features: [fact] });
    expect(svg.match(/data-feature-id="place:&quot;&lt;&amp;"/g)).toHaveLength(3);
    expect(svg).toContain('Survey &lt;&amp; &quot;site&quot;');
    expect(svg).toContain('data-feature-marker="true"');
  });
  it('labels habitats without adding another terrain symbol', () => {
    const svg = buildRegionMapSvgString(map, { features: [feature('habitat')] });
    expect(svg).toContain('Named habitat');
    expect(svg).not.toContain('data-feature-marker');
  });
  it('draws distinguishable landmark and hazard symbols', () => {
    const svg = buildRegionMapSvgString(map, {
      features: [feature('landmark'), feature('hazard', 5)],
    });
    const paths = [...svg.matchAll(/<path[^>]*data-feature-marker="true"[^>]*d="([^"]+)"/g)];
    expect(paths).toHaveLength(2);
    expect(paths.map((path) => (path[1].match(/ L /g) ?? []).length).sort()).toEqual([2, 3]);
  });
  it('resolves edge-only anchors and sparse node IDs by identity', () => {
    const edge = map.edges.find((edge) => edge.d0 === interior[0].id)!;
    const anchored = { ...feature('hazard'), nodeIds: [], edgeIds: [edge.id] };
    expect(buildRegionMapSvgString(map, { features: [anchored] })).toContain('Named hazard');
    const node = { ...interior[0], id: 9000, neighbors: [] };
    expect(
      buildRegionMapSvgString(
        { ...map, nodes: [node], edges: [], corners: [] },
        { features: [{ ...feature('landmark'), nodeIds: [9000] }] },
      ),
    ).toContain('Named landmark');
  });
  it('omits empty, missing, water-only and oversized facts without blank symbols', () => {
    const features = [
      { ...feature('landmark'), name: '  ' },
      { ...feature('landmark'), nodeIds: [99999] },
      { ...feature('landmark'), name: 'W'.repeat(500) },
    ];
    expect(buildRegionMapSvgString(map, { features })).toEqual(buildRegionMapSvgString(map));
    const water = { ...map, nodes: map.nodes.map((node) => ({ ...node, isWater: true })) };
    expect(buildRegionMapSvgString(water, { features: [feature('landmark')] })).toEqual(
      buildRegionMapSvgString(water),
    );
  });
  it('does not crowd an occupied settlement site', () => {
    const node = interior[0];
    const svg = buildRegionMapSvgString(map, {
      settlements: [{ id: 'town:1', mapNodeId: node.id, name: 'Town', population: 10000 }],
      features: [feature('landmark')],
    });
    expect(svg).toContain('data-feature-id="town:1"');
    expect(svg).not.toContain('data-feature-id="landmark:saved"');
  });
  it('bounds habitat selection and is independent of input order without mutating inputs', () => {
    const features = interior.slice(0, 10).map((node, index) => ({
      ...feature('habitat'),
      id: `habitat:${index}`,
      name: `Habitat ${index}`,
      nodeIds: [node.id],
    }));
    const before = JSON.stringify({ map, features });
    const svg = buildRegionMapSvgString(map, { features });
    expect(svg).toEqual(buildRegionMapSvgString(map, { features: [...features].reverse() }));
    expect([...svg.matchAll(/data-feature-kind="habitat"/g)].length).toBeLessThanOrEqual(6);
    expect(svg).toContain('Habitat 0');
    expect(JSON.stringify({ map, features })).toEqual(before);
  });
  it('preserves the legacy drawing when optional facts are absent', () => {
    expect(buildRegionMapSvgString(map)).toEqual(buildRegionMapSvgString(map, { features: [] }));
  });
});
