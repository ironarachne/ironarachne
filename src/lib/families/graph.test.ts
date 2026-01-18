import { describe, it, expect } from 'vitest';
import * as Families from './families';
import * as Graph from './graph';

describe('Family Graph', () => {
    const seed = 'test-graph';
    const config = Families.getDefaultFamilyGenerationConfig(seed);

    it('should generate a graph with nodes and edges', () => {
        let family = Families.generateNewFamily(seed, config);
        // Ensure some members exist
        const genConfig = { ...config, generations: 2 }; 
        family = Families.generateFamilyGeneration(seed, genConfig, family);

        const graph = Graph.getFamilyGraph(family);
        
        expect(graph).toBeDefined();
        expect(graph.nodes.length).toBe(family.members.length);
        
        // Check if nodes have coordinates
        graph.nodes.forEach(node => {
            expect(node.x).toBeDefined();
            expect(node.y).toBeDefined();
            expect(node.generation).toBeDefined();
        });
    });
    
    it('should generate an SVG string', () => {
        let family = Families.generateNewFamily(seed, config);
        const genConfig = { ...config, generations: 1 }; 
        family = Families.generateFamilyGeneration(seed, genConfig, family);
        
        const svg = Graph.getFamilyTreeSVG(family);
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
        expect(svg).toContain('rect');
    });
});
