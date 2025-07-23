import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { TraceableEntity } from '@/common/entity/traceable.entity';
import { TaskStatus } from '../model';
import { TaskList } from './task-list.entity';

console.log('DATABASE_TYPE: ', process.env.DATABASE_TYPE);
@Entity()
export class Task extends TraceableEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  content: string;

  @Column({
    // TODO:
    // type: process.env.DATABASE_TYPE === 'mysql' ? 'enum' : 'varchar',
    type: 'enum',
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
