export type DoorType = 'regular' | 'secret';

export type DoorState = 'open' | 'closed' | 'locked';

export type Door = {
  id: string;
  x: number;
  y: number;
  type: DoorType;
  state: DoorState;
  description: string;
  // Optional ID linking to a specific Key entity if locked.
  // (Will be utilized by the future Key/Lock subsystem)
  keyId?: string;
};

export type Key = {
  id: string;
  doorId: string; // The specific door this key unlocks
  x: number;
  y: number;
  description: string;
};
