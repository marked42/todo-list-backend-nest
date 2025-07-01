import { Column, Entity } from 'typeorm';
import { TaskStatus } from '../enum/TaskStatus';
import { TraceableEntity } from './TraceableEntity';

@Entity()
export class Task extends TraceableEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    default: TaskStatus.Todo,
    enum: TaskStatus,
  })
  status: TaskStatus;
}
