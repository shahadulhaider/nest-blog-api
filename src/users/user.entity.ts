import * as argon2 from 'argon2';
import { classToPlain, Exclude } from 'class-transformer';
import { Post } from 'src/posts/post.entity';
import { Profile } from 'src/profile/profile.entity';
import { Comment } from '../comments/comment.entity';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserResponse } from './user.ro';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(
    () => Profile,
    profile => profile.user,
    { cascade: true },
  )
  @JoinColumn()
  profile: Profile;

  @OneToMany(
    () => Post,
    post => post.author,
  )
  posts: Post[];

  @ManyToMany(
    () => Post,
    post => post.favoritedBy,
  )
  favorites: Post[];

  @OneToMany(
    () => Comment,
    comment => comment.author,
  )
  comments: Comment[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  async verifyPassword(plain: string): Promise<boolean> {
    return await argon2.verify(this.password, plain);
  }

  toUserResponse(): UserResponse {
    return classToPlain(this) as UserResponse;
  }
}
