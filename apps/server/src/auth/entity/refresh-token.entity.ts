import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  // TODO: user id string or number?
  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;
}
