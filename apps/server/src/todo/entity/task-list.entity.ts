import { Column, Entity, OneToMany } from 'typeorm';
import { TraceableEntity } from '@/common/entity/traceable.entity';
import { TaskListStatus } from '../model';
import { Task } from './task.entity';

@Entity()
export class TaskList extends TraceableEntity {
  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.taskList)
  tasks: Task[];

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'varchar' : 'enum', // 动态切换类型
    enum: process.env.NODE_ENV === 'test' ? undefined : TaskListStatus, // 测试环境不传 enum
    default: TaskListStatus.Active,
  })
  status: TaskListStatus;
}
