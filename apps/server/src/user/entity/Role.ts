import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entity/BaseEntity';

@Entity()
export class Role extends BaseEntity {
  @Column({
    unique: true,
  })
  code: RoleCode;

  @Column()
  label: string;
}

export enum RoleCode {
  User = 'user',
  Admin = 'admin',
}
