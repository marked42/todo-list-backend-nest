import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entity/BaseEntity';

@Entity()
export class Role extends BaseEntity {
  @Column({
    unique: true,
  })
  code: string;

  @Column()
  label: string;
}
