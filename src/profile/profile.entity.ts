import { classToPlain, Exclude } from 'class-transformer';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileResponse } from './profile.ro';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string | null;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @OneToOne(
    () => User,
    user => user.profile,
    { eager: true },
  )
  user: User;

  @ManyToMany(
    () => Profile,
    profile => profile.following,
  )
  @JoinTable()
  followers: Profile[];

  @ManyToMany(
    () => Profile,
    profile => profile.followers,
  )
  following: Profile[];

  buildProfileResponse(): ProfileResponse {
    return classToPlain(this) as ProfileResponse;
  }
}
