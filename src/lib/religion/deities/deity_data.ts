import type { Mutator } from '$lib/mutator';
import { RNG } from '@ironarachne/rng';
import type { Deity } from './deity_types';
import { add_trait } from '$lib/physical_traits';
import { describeDeity } from './deity_generation';

export const deityMutators: Mutator<Deity>[] = [
  {
    name: 'add feathered wings',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const wingType = rng.item([
        'feathered wings',
        'large feathered wings',
        'black feathered wings',
        'six feathered wings',
      ]);

      target.physicalTraits = add_trait(
        { name: 'wings', description: wingType, category: 'wings', tags: ['wings', 'flight'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'flight',
        description: `Can fly using their ${wingType}.`,
        category: 'movement',
        tags: ['flight'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['air', 'wind', 'movement', 'wings', 'flight'],
  },
  {
    name: 'add beast horns',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hornType = rng.item([
        'curved ram horns',
        'straight bull horns',
        'twisted goat horns',
        'antelope horns',
      ]);

      target.physicalTraits = add_trait(
        { name: 'horns', description: hornType, category: 'horns', tags: ['horns', 'beast'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['earth', 'nature', 'forest', 'beast', 'horns'],
  },
  {
    name: 'add glowing eyes',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const eyeColor = rng.item([
        'glowing red eyes',
        'glowing blue eyes',
        'glowing green eyes',
        'glowing yellow eyes',
        'glowing white eyes',
      ]);

      target.physicalTraits = add_trait(
        { name: 'eyes', description: eyeColor, category: 'eyes', tags: ['eyes', 'glowing'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['magic', 'mystery', 'darkness', 'light', 'eyes', 'celestial', 'the moon'],
  },
  {
    name: 'add smoldering skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinType = rng.item([
        'smoldering stone skin',
        'smoldering molten skin',
        'smoldering ash-covered skin',
        'smoldering ember skin',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinType, category: 'skin', tags: ['skin', 'smoldering'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['fire', 'lava', 'destruction', 'rebirth', 'skin', 'revenge'],
  },
  {
    name: 'add hardened skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinType = rng.item([
        'hardened stone skin',
        'hardened bark skin',
        'hardened metal skin',
        'hardened crystal skin',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinType, category: 'skin', tags: ['skin', 'hardened'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['earth', 'nature', 'protection', 'resilience', 'skin', 'persistence'],
  },
  {
    name: 'add leathery wings',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const wingType = rng.item(['leathery wings', 'giant leathery wings']);

      target.physicalTraits = add_trait(
        { name: 'wings', description: wingType, category: 'wings', tags: ['wings', 'flight'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'flight',
        description: `Can fly using their ${wingType}.`,
        category: 'movement',
        tags: ['flight'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['darkness', 'magic', 'chaos', 'evil', 'wings', 'flight'],
  },
  {
    name: 'add multiple arms',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const armCount = rng.item([4, 6, 8]);

      target.physicalTraits = add_trait(
        {
          name: 'arms',
          description: `${armCount} arms`,
          category: 'arms',
          tags: ['arms', 'multiple'],
        },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['war', 'strength', 'protection', 'arms', 'balance'],
  },
  {
    name: 'add lizard tail',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const tailType = rng.item([
        'scaly lizard tail',
        'spiked lizard tail',
        'long lizard tail',
        'barbed lizard tail',
      ]);

      target.physicalTraits = add_trait(
        { name: 'tail', description: tailType, category: 'tail', tags: ['tail', 'lizard'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'tail'],
  },
  {
    name: "add horse's head",
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'head', description: "horse's head", category: 'head', tags: ['head', 'horse'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'horses'],
  },
  {
    name: "add fox's head",
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'head', description: "fox's head", category: 'head', tags: ['head', 'fox'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'trickery', 'beast', 'foxes'],
  },
  {
    name: "add bull's head",
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'head', description: "bull's head", category: 'head', tags: ['head', 'bull'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'strength', 'beast', 'bulls'],
  },
  {
    name: "add ram's head",
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'head', description: "ram's head", category: 'head', tags: ['head', 'ram'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'strength', 'beast', 'rams'],
  },
  {
    name: "add cat's head",
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'head', description: "cat's head", category: 'head', tags: ['head', 'cat'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'mystery', 'beast', 'cats'],
  },
  {
    name: 'add claws',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const clawType = rng.item(['sharp claws', 'razor claws', 'giant claws', 'venomous claws']);

      target.physicalTraits = add_trait(
        { name: 'claws', description: clawType, category: 'claws', tags: ['claws', 'beast'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'claws', 'demons'],
  },
  {
    name: 'add fangs',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const fangType = rng.item(['sharp fangs', 'venomous fangs', 'giant fangs', 'glowing fangs']);

      target.physicalTraits = add_trait(
        { name: 'fangs', description: fangType, category: 'fangs', tags: ['fangs', 'beast'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'fangs', 'demons', 'snakes'],
  },
  {
    name: 'add tentacles',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const tentacleType = rng.item([
        'slimy tentacles',
        'suckered tentacles',
        'barbed tentacles',
        'glowing tentacles',
      ]);

      target.physicalTraits = add_trait(
        {
          name: 'tentacles',
          description: tentacleType,
          category: 'tentacles',
          tags: ['tentacles', 'beast'],
        },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'tentacles', 'sea'],
  },
  {
    name: 'add scales',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const scaleType = rng.item([
        'rough scales',
        'smooth scales',
        'spiked scales',
        'glowing scales',
      ]);

      target.physicalTraits = add_trait(
        { name: 'scales', description: scaleType, category: 'skin', tags: ['scales', 'beast'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'scales', 'reptiles', 'fish', 'water'],
  },
  {
    name: 'add aquatic hair',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairType = rng.item([
        'flowing aquatic hair',
        'seaweed-like hair',
        'tentacle-like hair',
        'glowing aquatic hair',
      ]);

      target.physicalTraits = add_trait(
        { name: 'hair', description: hairType, category: 'hair', tags: ['hair', 'aquatic'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'chaos', 'beast', 'aquatic', 'sea', 'hair', 'water'],
  },
  {
    name: 'add fiery hair',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairType = rng.item([
        'flowing fiery hair',
        'flame-like hair',
        'ember-like hair',
        'glowing fiery hair',
      ]);

      target.physicalTraits = add_trait(
        { name: 'hair', description: hairType, category: 'hair', tags: ['hair', 'fiery'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['fire', 'lava', 'destruction', 'rebirth', 'hair', 'heat'],
  },
  {
    name: 'add skeletal face',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        {
          name: 'face',
          description: 'skeletal face',
          category: 'face',
          tags: ['face', 'skeletal'],
        },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['death', 'undead', 'darkness', 'skeletal'],
  },
  {
    name: 'add frosty skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinType = rng.item([
        'skin perpetually covered in frost',
        'skin made of ice',
        'shimmering skin that resembles a snow-covered landscape',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinType, category: 'skin', tags: ['skin', 'frosty'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['ice', 'snow', 'cold', 'winter', 'skin'],
  },
  {
    name: 'add flower hair',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairType = rng.item([
        'hair made of blooming flowers',
        'hair adorned with vines and blossoms',
        'hair that changes with the seasons',
      ]);

      target.physicalTraits = add_trait(
        { name: 'hair', description: hairType, category: 'hair', tags: ['hair', 'floral'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['nature', 'growth', 'rebirth', 'floral', 'hair', 'life', 'spring'],
  },
  {
    name: 'add lightning eyes',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const eyeDescription = rng.item([
        'eyes that crackle with lightning',
        'eyes that glow with electric energy',
      ]);

      target.physicalTraits = add_trait(
        {
          name: 'eyes',
          description: eyeDescription,
          category: 'eyes',
          tags: ['eyes', 'lightning'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'lightning strike',
        description: `Can unleash a bolt of lightning from their eyes.`,
        category: 'offense',
        tags: ['lightning', 'electricity'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['lightning', 'electricity', 'storm', 'eyes'],
  },
  {
    name: 'add shadowy form',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        {
          name: 'form',
          description: 'shadowy and indistinct form',
          category: 'form',
          tags: ['form', 'shadowy'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'shadow blend',
        description: `Can blend into shadows, becoming nearly invisible in darkness.`,
        category: 'defense',
        tags: ['shadows', 'stealth'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['darkness', 'stealth', 'shadows', 'shadowy'],
  },
  {
    name: 'add hair of dusk',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairDescription = rng.item([
        'hair that resembles the colors of dusk, shifting between deep purples, fiery oranges, and dusky pinks',
        'hair that seems to absorb light, giving it a dark and shadowy appearance',
      ]);

      target.physicalTraits = add_trait(
        { name: 'hair', description: hairDescription, category: 'hair', tags: ['hair', 'dusk'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['twilight', 'dusk', 'mystery', 'hair', 'autumn'],
  },
  {
    name: 'add celestial glow',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        {
          name: 'aura',
          description: 'celestial glow that surrounds them',
          category: 'aura',
          tags: ['aura', 'celestial'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'radiant presence',
        description: `Emits a radiant glow that can illuminate dark areas and inspire allies.`,
        category: 'support',
        tags: ['radiance', 'inspiration'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['light', 'celestial', 'inspiration', 'aura', 'wisdom', 'mercy'],
  },
  {
    name: 'add golden skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        {
          name: 'skin',
          description: 'shimmering golden skin',
          category: 'skin',
          tags: ['skin', 'golden'],
        },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['light', 'healing', 'protection', 'golden', 'skin', 'nobility', 'trade', 'luck'],
  },
  {
    name: 'add time-shifting presence',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        {
          name: 'presence',
          description:
            'time-shifting presence that seems to flicker in and out of the current moment',
          category: 'presence',
          tags: ['presence', 'time-shifting'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'temporal distortion',
        description: `Can briefly shift themselves or others out of sync with time, allowing for quick movements or dodges.`,
        category: 'defense',
        tags: ['time', 'distortion'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['time', 'mystery', 'chaos', 'time-shifting'],
  },
  {
    name: 'add runic skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinDescription = rng.item([
        'skin covered in glowing runes that shift and change',
        'skin that resembles ancient stone inscribed with magical symbols',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinDescription, category: 'skin', tags: ['skin', 'runic'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'arcane shield',
        description: `Can activate the runes on their skin to create a magical shield that absorbs damage.`,
        category: 'defense',
        tags: ['magic', 'shield'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['magic', 'protection', 'runic', 'skin', 'languages', 'knowledge'],
  },
  {
    name: 'add fearsome eyes',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const eyeDescription = rng.item([
        'eyes that instill overwhelming fear in those who meet their gaze',
        'eyes that glow with a terrifying light, causing dread in onlookers',
        'solid-black eyes',
        'eyes that seem to contain swirling darkness',
      ]);

      target.physicalTraits = add_trait(
        { name: 'eyes', description: eyeDescription, category: 'eyes', tags: ['eyes', 'fearsome'] },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['fear', 'awe', 'darkness', 'eyes'],
  },
  {
    name: 'add paint skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinDescription = rng.item([
        'skin that appears to be painted with vibrant colors and intricate designs',
        'skin that resembles a living canvas, with ever-changing patterns and hues',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinDescription, category: 'skin', tags: ['skin', 'paint'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'color shift',
        description: `Can change the colors and patterns on their skin to blend into surroundings or create dazzling displays.`,
        category: 'defense',
        tags: ['camouflage', 'display'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['art', 'creativity', 'camouflage', 'skin'],
  },
  {
    name: 'add musical chime hair',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairDescription = rng.item([
        'hair that resembles delicate musical chimes, tinkling softly with movement',
        'hair that produces harmonious sounds when touched or moved',
      ]);

      target.physicalTraits = add_trait(
        { name: 'hair', description: hairDescription, category: 'hair', tags: ['hair', 'musical'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'chime melody',
        description: `Can create soothing or disorienting melodies by moving their hair.`,
        category: 'support',
        tags: ['music', 'soothing', 'disorienting'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['music', 'soothing', 'disorienting', 'hair'],
  },
  {
    name: 'add intoxicating aura',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const auraDescription = rng.item([
        'an intoxicating aura that causes euphoria and disorientation in those nearby',
        'an aura that fills the air with a heady scent, making it difficult to think clearly',
      ]);

      target.physicalTraits = add_trait(
        {
          name: 'aura',
          description: auraDescription,
          category: 'aura',
          tags: ['aura', 'intoxicating'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'intoxicating presence',
        description: `Emits an aura that can cause euphoria and disorientation in those nearby.`,
        category: 'offense',
        tags: ['intoxicating', 'aura'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['intoxicating', 'euphoria', 'disorientation', 'aura', 'love'],
  },
  {
    name: 'add autumnal hair',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const hairDescription = rng.item([
        'hair that resembles the colors of autumn leaves, shifting between fiery reds, burnt oranges, and golden yellows',
        'hair that seems to rustle like leaves in the wind, giving it a dynamic and lively appearance',
      ]);

      target.physicalTraits = add_trait(
        {
          name: 'hair',
          description: hairDescription,
          category: 'hair',
          tags: ['hair', 'autumnal'],
        },
        target.physicalTraits,
      );

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['autumn', 'change', 'nature', 'hair', 'harvests'],
  },
  {
    name: 'add stone skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinDescription = rng.item([
        'skin that resembles rough, weathered stone',
        'skin that appears to be made of solid rock, with cracks and crevices',
      ]);

      target.physicalTraits = add_trait(
        { name: 'skin', description: skinDescription, category: 'skin', tags: ['skin', 'stone'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'stone resilience',
        description: `Has resistance to physical damage due to their stone-like skin.`,
        category: 'defense',
        tags: ['resilience', 'stone'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['stone', 'resilience', 'defense', 'nature'],
  },
  {
    name: 'add metallic skin',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      const skinDescription = rng.item([
        'skin that resembles polished metal, reflecting light and surroundings',
        'skin that appears to be made of interlocking metal plates',
      ]);

      target.physicalTraits = add_trait(
        {
          name: 'skin',
          description: skinDescription,
          category: 'skin',
          tags: ['skin', 'metallic'],
        },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'metallic defense',
        description: `Has resistance to physical damage due to their metallic skin.`,
        category: 'defense',
        tags: ['resilience', 'metal'],
      });

      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['metal', 'protection', 'law', 'order'],
  },
  {
    name: 'add no eyes',
    mutate: (seed: string, target: Deity): Deity => {
      const rng = new RNG(seed);

      target.physicalTraits = add_trait(
        { name: 'eyes', description: 'no visible eyes', category: 'eyes', tags: ['eyes', 'none'] },
        target.physicalTraits,
      );
      target.abilities.push({
        name: 'blind sight',
        description: `Can perceive their surroundings without the need for sight.`,
        category: 'senses',
        tags: ['blind sight'],
      });
      target.description = describeDeity(target, rng);

      return target;
    },
    tags: ['blind', 'senses', 'mystery', 'darkness', 'justice'],
  },
];
