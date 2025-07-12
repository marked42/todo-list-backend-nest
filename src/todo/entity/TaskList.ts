import { Column, Entity, OneToMany } from 'typeorm';
import { TraceableEntity } from '@/core/entity/TraceableEntity';
import { TaskListStatus } from '../enum/TaskListStatus';
import { Task } from './Task';

@Entity()
export class TaskList extends TraceableEntity {
  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.taskList)
  tasks: Task[];

  @Column({
    type: 'varchar',
    enum: TaskListStatus,
    default: TaskListStatus.Active,
  })
  status: TaskListStatus;
}
