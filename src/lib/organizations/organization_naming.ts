/**
 * Descriptive only: documents how a kind names itself for README and tooling.
 * Actual generation is implemented in each kind’s `generateName` (see
 * `OrganizationKindDefinition`).
 */
export type OrganizationNamingProfile =
  | {
      style: 'prefix_suffix';
      description: string;
    }
  | {
      style: 'pattern_list';
      description: string;
    }
  | {
      style: 'family_business';
      description: string;
    }
  | {
      style: 'acronym_numeric';
      description: string;
    }
  | {
      style: 'compound_institutional';
      description: string;
    }
  | {
      style: 'mixed';
      description: string;
    };
