export default class Organization {
  constructor(name, orgType, description, memberCount, leadership, ranks) {
    this.name = name
    this.organizationType = orgType
    this.description = description
    this.memberCount = memberCount
    this.leadership = leadership
    this.notableMembers = []
    this.ranks = ranks
  }

  getRanksOfTier(tier) {
    let ranks = []
    let currentRank = this.ranks

    if (tier == 0) {
      return [currentRank]
    }

    let ranksToCheck = currentRank.inferiors

    for (let i=0;i<tier;i++) {
      let nextRanks = []
      for (let j=0;j<ranksToCheck.length;j++) {
        if (ranksToCheck[j].title.precedence == tier) {
          ranks.push(ranksToCheck[j])
        }
        nextRanks = nextRanks.concat(ranksToCheck[j].inferiors)
      }
      ranksToCheck = nextRanks
    }

    return ranks
  }
}
