import GovernmentType from "./governmenttype";

export default class Nation {
  name: string;
  description: string;
  governmentType: GovernmentType;

  constructor(name: string, description: string, governmentType: GovernmentType) {
    this.name = name;
    this.description = description;
    this.governmentType = governmentType;
  }
}
