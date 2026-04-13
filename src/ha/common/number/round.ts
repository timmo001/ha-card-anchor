export const round = (value: number, precision = 2): number =>
  Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
