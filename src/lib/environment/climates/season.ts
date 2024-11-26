export default interface Season {
  name: string;
  startDay: number; // 1-365
  endDay: number; // 1-365
  temperatureAdjustment: number;
  humidityAdjustment: number;
}
