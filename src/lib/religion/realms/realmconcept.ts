export default class RealmConcept {
  name: string;
  nameOptions: string[];
  appearanceTags: string[];
  personalityTags: string[];
  descriptionOptions: string[];

  constructor(
    name: string,
    nameOptions: string[],
    appearanceTags: string[],
    personalityTags: string[],
    descriptionOptions: string[],
  ) {
    this.name = name;
    this.nameOptions = nameOptions;
    this.appearanceTags = appearanceTags;
    this.personalityTags = personalityTags;
    this.descriptionOptions = descriptionOptions;
  }
}
