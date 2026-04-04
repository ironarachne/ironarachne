import type { Mutator } from '$lib/mutator';
import type Species from './species';

export function allMutators(): Mutator<Species>[] {
  return [
    {
      name: 'skeleton',
      tags: ['skeleton', 'undead'],
      mutate: (seed: string, target: Species) => {
        let result: Species = JSON.parse(JSON.stringify(target));

        let modifierName = 'skeletal';

        // TODO: remove physical traits that don't make sense for a skeleton, like "has fur" or "has feathers"

        result.name = `${modifierName} ${result.name}`;
        result.pluralName = `${modifierName} ${result.pluralName}`;
        result.adjective = `${modifierName} ${result.adjective}`;
        result.abilities.push({
          name: 'immunity: piercing',
          description: 'immune to piercing damage',
          category: 'immunity',
          tags: ['immunity'],
        });
        result.tags.push('skeleton');
        result.tags.push('undead');

        return result;
      },
    },
    {
      name: 'zombie',
      tags: ['zombie', 'undead'],
      mutate: (seed: string, target: Species) => {
        let result: Species = JSON.parse(JSON.stringify(target));

        let modifierName = 'zombified';

        // TODO: add physical traits that make sense for a zombie, like "has decaying flesh" or "has a foul stench"

        result.name = `${modifierName} ${result.name}`;
        result.pluralName = `${modifierName} ${result.pluralName}`;
        result.adjective = `${modifierName} ${result.adjective}`;
        result.abilities.push({
          name: 'undead fortitude',
          description: 'when killed, has a chance to return to life',
          category: 'trait',
          tags: ['trait', 'undead'],
        });
        result.tags.push('zombie');
        result.tags.push('undead');

        return result;
      },
    },
    {
      name: 'vampire',
      tags: ['vampire', 'undead'],
      mutate: (seed: string, target: Species) => {
        let result: Species = JSON.parse(JSON.stringify(target));

        let modifierName = 'vampiric';

        // TODO: add physical traits that make sense for a vampire, like "has fangs" or "has a pale complexion"

        result.name = `${modifierName} ${result.name}`;
        result.pluralName = `${modifierName} ${result.pluralName}`;
        result.adjective = `${modifierName} ${result.adjective}`;
        result.abilities.push({
          name: 'blood drain',
          description: 'can drain blood from a target to heal itself',
          category: 'action',
          tags: ['action', 'undead'],
        });
        result.tags.push('vampire');
        result.tags.push('undead');

        return result;
      },
    },
  ];
}

export function getMutatorByName(name: string): Mutator<Species> {
  const mutators = allMutators();
  const mutator = mutators.find((m) => m.name === name);
  if (!mutator) {
    throw new Error(`Mutator with name "${name}" not found.`);
  }
  return mutator;
}
