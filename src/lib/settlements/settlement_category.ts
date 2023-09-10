export default interface SettlementCategory {
  name: string;
  minSize: number;
  maxSize: number;
  sizeClass: string;
  possibleDescriptions: string[];
}
