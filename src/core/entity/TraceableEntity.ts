import { Entity, ManyToOne, ManyToMany, RelationId } from 'typeorm';
import { User } from './User';
import { BaseEntity } from './BaseEntity';

@Entity()
export class TraceableEntity extends BaseEntity {
  /**
   * optional field lazy loading strategy by default
   */
  @ManyToOne(() => User, { nullable: false })
  creator?: User;

  @RelationId((entity: TraceableEntity) => entity.creator)
  creatorId: number;

  @ManyToMany(() => User)
  updaters: User[];
}
