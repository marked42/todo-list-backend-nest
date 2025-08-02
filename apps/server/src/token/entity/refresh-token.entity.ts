import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  token: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
    comment: 'IP address of the user when the token was created', // Optional comment for clarity
  })
  ip?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Device information of the user when the token was created', // Optional comment for clarity
  })
  device?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'User agent of the user when the token was created', // Optional comment for clarity
  })
  userAgent?: string;
}
