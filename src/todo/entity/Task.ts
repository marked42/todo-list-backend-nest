import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TaskStatus } from '../enum/TaskStatus';
import { TraceableEntity } from '../../core/entity/TraceableEntity';
import { TaskList } from './TaskList';

@Entity()
export class Task extends TraceableEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  content: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.Todo,
  })
  status: TaskStatus;

  @ManyToOne(() => TaskList, (taskList) => taskList.tasks)
  @JoinColumn({ name: 'task_list_id' })
  taskList: TaskList;
}
