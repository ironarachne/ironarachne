import { generateLayout } from '../src/lib/dungeon/layout/architect';
import { connectRooms } from '../src/lib/dungeon/layout/corridors';
import { generateDoors } from '../src/lib/dungeon/interactive/doors';
import { distributeKeys } from '../src/lib/dungeon/interactive/keys';
import { getTile } from '../src/lib/dungeon/grid/grid';

function main() {
    const args = process.argv.slice(2);
    if (args.length < 5) {
        console.error("Usage: npx tsx scripts/render_layout.ts <seed> <width> <height> <density> <styles (comma separated)>");
        console.error("Example: npx tsx scripts/render_layout.ts my-seed 50 30 0.25 rectangle,circle,l-shape,blob");
        process.exit(1);
    }

    const seed = args[0];
    const width = parseInt(args[1], 10);
    const height = parseInt(args[2], 10);
    const density = parseFloat(args[3]);
    const styles = args[4].split(',').map(s => s.trim());

    if (isNaN(width) || isNaN(height) || isNaN(density)) {
        console.error("Error: width and height must be integers, density must be a float (e.g. 0.2).");
        process.exit(1);
    }

    const layout = generateLayout(seed, width, height, density, styles);
    connectRooms(seed, layout);
    const doors = generateDoors(seed, layout, {
        doorDensity: 0.8,
        secretPercentage: 0.2,
        lockedPercentage: 0.3
    });
    const keys = distributeKeys(seed, layout, doors);

    console.log(`\n--- Generated Layout ---`);
    console.log(`Seed: ${seed}`);
    console.log(`Grid: ${width}x${height}`);
    console.log(`Target Density: ${(density * 100).toFixed(1)}%`);
    console.log(`Allowed Styles: ${styles.join(', ')}`);
    console.log(`Total Rooms: ${layout.rooms.length}`);
    console.log(`Total Doors: ${doors.length} (${doors.filter(d => d.type === 'secret').length} secret, ${doors.filter(d => d.state === 'locked').length} locked)`);
    console.log(`Total Keys: ${keys.length}\n`);

    // Render the master layout grid
    for (let y = 0; y < layout.height; y++) {
        let rowStr = '';
        for (let x = 0; x < layout.width; x++) {
            const isFloor = getTile(layout.grid, x, y);

            // Check for doors overriding floor render
            const doorMatch = doors.find(d => d.x === x && d.y === y);
            const keyMatch = keys.find(k => k.x === x && k.y === y);

            if (doorMatch) {
                if (doorMatch.type === 'secret') {
                    rowStr += 'SS';
                } else if (doorMatch.state === 'locked') {
                    rowStr += 'LL';
                } else if (doorMatch.state === 'open') {
                    rowStr += '  '; // Visually clear/open
                } else {
                    rowStr += 'DD'; // simple closed door
                }
            } else if (keyMatch) {
                rowStr += 'KK';
            } else {
                rowStr += isFloor ? '██' : '..';
            }
        }
        console.log(rowStr);
    }
    console.log('\n');
}

main();
