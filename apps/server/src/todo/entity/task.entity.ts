import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { TraceableEntity } from '@/common/entity/traceable.entity';
import { TaskStatus } from '../model';
import { TaskList } from './task-list.entity';

@Entity()
export class Task extends TraceableEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  content: string;

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'varchar' : 'enum', // 动态切换类型
    enum: process.env.NODE_ENV === 'test' ? undefined : TaskStatus, // 测试环境不传 enum
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
