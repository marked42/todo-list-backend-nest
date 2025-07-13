import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
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

  /**
   * optional field lazy loading strategy by default
   */
  @ManyToOne(() => TaskList, (taskList) => taskList.tasks, {
    // task is deleted when task list is deleted
    onDelete: 'CASCADE',
  })
  taskList?: TaskList;

  @RelationId((task: Task) => task.taskList)
  taskListId: number;

  @Column({ default: 0 })
  order: number;
}
