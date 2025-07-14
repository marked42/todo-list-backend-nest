export enum TaskPosition {
  Before = 'before',
  After = 'after',
  First = 'first',
  Last = 'last',
}

export const RelativePositions = [
  TaskPosition.Before,
  TaskPosition.After,
] as const;
export type RelativePosition = (typeof RelativePositions)[number];

export const AbsolutePositions = [
  TaskPosition.First,
  TaskPosition.Last,
] as const;
export type AbsolutePosition = (typeof AbsolutePositions)[number];
