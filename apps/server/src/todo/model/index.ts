export * from './TaskPosition';

export enum TaskListStatus {
  Close = 'closed',
  Active = 'active',
}

export enum TaskMoveResult {
  AlreadyInPlace = 'already-in-place',
  Success = 'success',
}

export enum TaskStatus {
  Todo = 'todo',
  Doing = 'doing',
  Done = 'done',
}

export enum TaskOrder {
  ASC = 'asc',
  DESC = 'desc',
}
