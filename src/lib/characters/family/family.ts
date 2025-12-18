import type * as MUN from "@ironarachne/made-up-names";
import type FamilyMember from "./family_member.js";

export default interface Family {
  name: string;
  members: FamilyMember[];
  familyNameGenerator: MUN.NameGenerator;
  femaleNameGenerator: MUN.NameGenerator;
  maleNameGenerator: MUN.NameGenerator;
}
