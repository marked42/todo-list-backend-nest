import { Column, Entity, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/BaseEntity';
import { Role } from '@/user/entity/Role';

@Entity()
export class User extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;

  @OneToMany(() => Role, (role: Role) => role.code)
  @JoinTable({
    joinColumns: [{ name: 'user_id' }],
    inverseJoinColumns: [{ name: 'role_id' }],
  })
  roles?: Role[];

  @Column({
    name: 'encrypted_password',
  })
  encryptedPassword: string;

  @Column({
    default: false,
  })
  locked: boolean;

  @Column({
    default: true,
  })
  enabled: boolean;
}
