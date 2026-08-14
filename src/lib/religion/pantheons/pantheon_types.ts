import type { Relationship } from '$lib/relationships';
import type { NameGenerator } from '@ironarachne/made-up-names';
import type { Deity } from '../deities/deity_types';
import type { Species } from '$lib/species';
import type { DivineRealm } from '../realms/realm_types';
import type { Domain } from '../domains/domain_types';

export type Pantheon = {
  name: string;
  description: string;
  members: Deity[];
  relationships: Relationship[];
  leader: number;
};

export type PantheonGenerationConfig = {
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  minDeities: number;
  maxDeities: number;
  speciesOptions: Species[];
  realms: DivineRealm[];
  domains: Domain[];
};
