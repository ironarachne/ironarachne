import type { Gender } from './gender_types';

export function getGenderFromSet(name: string, genderSet: Gender[]) {
  const gender = genderSet.find((g) => g.name === name);

  if (!gender) {
    throw new Error(`Gender "${name}" not found in provided gender set.`);
  }

  return gender;
}

export function traditional(): Gender[] {
  return [
    {
      name: 'female',
      pronouns: {
        subjective: 'she',
        objective: 'her',
        possessive: 'her',
        reflexive: 'herself',
      },
    },
    {
      name: 'male',
      pronouns: {
        subjective: 'he',
        objective: 'him',
        possessive: 'his',
        reflexive: 'himself',
      },
    },
  ];
}
