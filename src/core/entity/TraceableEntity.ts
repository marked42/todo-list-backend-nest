import { Entity, ManyToOne, ManyToMany } from 'typeorm';
import { User } from './User';
import { BaseEntity } from './BaseEntity';

@Entity()
export class TraceableEntity extends BaseEntity {
  @ManyToOne(() => User)
  createdBy: User;

  @ManyToMany(() => User)
  updatedBy: User;
}
