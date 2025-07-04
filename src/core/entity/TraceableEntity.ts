import { Entity, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { BaseEntity } from './BaseEntity';

@Entity()
export class TraceableEntity extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' }) // 自定义外键字段名
  createdBy: User;

  @ManyToMany(() => User)
  updatedBy: User[];
}
