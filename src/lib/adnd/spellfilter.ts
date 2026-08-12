export default interface SpellFilter {
  name: string;
  level: number;
  casterClass: string;
  requiredTags: string[];
  bannedTags: string[];
}
