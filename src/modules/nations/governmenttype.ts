export default class GovernmentType {
  name: string;
  nameTemplates: string[];
  description: string;

  constructor(name: string, nameTemplates: string[], description: string) {
    this.name = name;
    this.nameTemplates = nameTemplates;
    this.description = description;
  }
}
