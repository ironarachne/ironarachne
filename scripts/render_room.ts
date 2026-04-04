import { generateRoom } from '../src/lib/dungeon/room/generator';
import { getTile } from '../src/lib/dungeon/grid/grid';

function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error(
      'Usage: npx ts-node scripts/render_room.ts <seed> <widthBound> <heightBound> <style>',
    );
    console.error('Available styles: rectangle, circle, l-shape, blob');
    process.exit(1);
  }

  const seed = args[0];
  const widthBound = parseInt(args[1], 10);
  const heightBound = parseInt(args[2], 10);
  const style = args[3];

  // Basic validation
  if (isNaN(widthBound) || isNaN(heightBound)) {
    console.error('Error: widthBound and heightBound must be integers.');
    process.exit(1);
  }

  const room = generateRoom(seed, widthBound, heightBound, style);

  console.log(`\n--- Generated Room ---`);
  console.log(`Style: ${room.style}`);
  console.log(`Seed: ${seed}`);
  console.log(`Requested Bounds: ${widthBound}x${heightBound}`);
  console.log(`Actual Dimensions: ${room.width}x${room.height}\n`);

  // Render the grid
  for (let y = 0; y < room.height; y++) {
    let rowStr = '';
    for (let x = 0; x < room.width; x++) {
      const isFloor = getTile(room.shape, x, y);
      // Using two characters to better approximate square proportions in terminal fonts
      rowStr += isFloor ? '██' : '..';
    }
    console.log(rowStr);
  }
  console.log('\n');
}

main();
