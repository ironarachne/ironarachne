export type Element =
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'ice'
  | 'lightning'
  | 'metal'
  | 'wood'
  | 'light'
  | 'shadow'
  | 'void'
  | 'aether'
  | 'life'
  | 'death'
  | 'spirit'
  | 'mind'
  | 'time'
  | 'space'
  | 'gravity'
  | 'force'
  | 'sound'
  | 'chaos'
  | 'order'
  | 'blood'
  | 'bone'
  | 'flesh'
  | 'poison'
  | 'acid'
  | 'magma'
  | 'steam'
  | 'dust'
  | 'smoke'
  | 'crystal'
  | 'oil'
  | 'nature'
  | 'arcane'
  | 'divine'
  | 'psionic'
  | 'eldritch'
  | 'primal'
  | 'dream'
  | 'nightmare'
  | 'star'
  | 'moon'
  | 'sun';

export type MagicSphere =
  | 'physical' // Affects the physical world
  | 'mental' // Affects minds/emotions
  | 'spiritual' // Affects souls/spirits
  | 'temporal' // Affects time
  | 'spatial' // Affects space
  | 'planar' // Affects dimensions
  | 'conceptual'; // Affects abstract concepts

export type MagicIntent =
  | 'create'
  | 'destroy'
  | 'alter'
  | 'control'
  | 'sense'
  | 'protect'
  | 'restore'
  | 'move'
  | 'summon'
  | 'banish'
  | 'transform'
  | 'imbue'
  | 'drain';

export type MagicCostType = 'mana' | 'stamina' | 'health' | 'sanity' | 'material' | 'soul' | 'time' | 'slot';

export type MagicCost = {
  type: MagicCostType;
  amount: number;
  description?: string;
};

export type MagicComponentType = 'gesture' | 'incantation' | 'focus' | 'consumable' | 'sacrifice' | 'environment' | 'thought';

export type MagicComponent = {
  type: MagicComponentType;
  description: string;
};

export type CastingTime = {
  unit: 'instant' | 'action' | 'turn' | 'minute' | 'hour' | 'day' | 'ritual';
  value: number;
  description?: string;
};

export type Duration = {
  type: 'instantaneous' | 'sustained' | 'timed' | 'permanent' | 'conditional';
  unit?: 'round' | 'minute' | 'hour' | 'day' | 'year';
  value?: number;
  description?: string;
};

export type Range = {
  type: 'self' | 'touch' | 'close' | 'medium' | 'long' | 'extreme' | 'unlimited' | 'planar';
  value?: number; // Abstract distance or specific units if needed
  unit?: string;
  description?: string;
};

export type AreaOfEffect = {
  shape:
    | 'point'
    | 'line'
    | 'cone'
    | 'circle'
    | 'sphere'
    | 'cube'
    | 'cylinder'
    | 'cloud'
    | 'aura'
    | 'global';
  size?: number;
  unit?: string;
  description?: string;
};

export type Spell = {
  id: string;
  name: string;
  description: string;
  elements: Element[];
  spheres: MagicSphere[];
  intent: MagicIntent;
  magnitude: number; // 1-100 scale of power/complexity
  difficulty: number; // 1-100 scale of difficulty to cast
  costs: MagicCost[];
  components: MagicComponent[];
  castingTime: CastingTime;
  duration: Duration;
  range: Range;
  area?: AreaOfEffect;
  tags: string[];
};
