import { Column, Entity, JoinTable, OneToMany } from 'typeorm';
import { Role } from './Role';
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {
  @Column({
    unique: true,
  })
  username: string;

  @OneToMany(() => Role, (role: Role) => role.code)
  @JoinTable({
    joinColumns: [{ name: 'user_id' }],
    inverseJoinColumns: [{ name: 'role_id' }],
  })
  roles: string[];

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
