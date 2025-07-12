import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { TraceableEntity } from '@/core/entity/TraceableEntity';
import { TaskStatus } from '../enum/TaskStatus';
import { TaskList } from './TaskList';

@Entity()
export class Task extends TraceableEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  content: string;

  @Column({
    type: 'varchar',
    enum: TaskStatus,
    default: TaskStatus.Todo,
  })
  status: TaskStatus;

  @ManyToOne(() => TaskList, (taskList) => taskList.tasks, {
    // task is deleted when task list is deleted
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_list_id' })
  taskList: TaskList;

  @RelationId((task: Task) => task.taskList)
  taskListId: number;
}
