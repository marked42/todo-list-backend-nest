import { Column, Entity, OneToMany } from 'typeorm';
import { TraceableEntity } from '@/common/entity/TraceableEntity';
import { TaskListStatus } from '../model';
import { Task } from './Task';

@Entity()
export class TaskList extends TraceableEntity {
  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.taskList)
  tasks: Task[];

  @Column({
    type: process.env.DATABASE_TYPE === 'mysql' ? 'enum' : 'varchar',
    enum: TaskListStatus,
    default: TaskListStatus.Active,
  })
  status: TaskListStatus;
}
