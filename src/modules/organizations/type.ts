export class OrganizationType {
  name: string;
  minSize: number;
  maxSize: number;
  leaderTitle: string;
  randomName: Function;
  randomDescription: Function;
  randomLeadership: Function;
  getRanks: Function;

  constructor(name: string, minSize: number, maxSize: number, leaderTitle: string, randomName: Function, randomDescription: Function, randomLeadership: Function, getRanks: Function) {
    this.name = name;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.leaderTitle = leaderTitle;
    this.randomName = randomName;
    this.randomDescription = randomDescription;
    this.randomLeadership = randomLeadership;
    this.getRanks = getRanks;
  }
}
