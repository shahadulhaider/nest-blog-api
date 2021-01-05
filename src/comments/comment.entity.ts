import { classToPlain } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { CommentResponse } from './models/comment.ro';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @ManyToOne(
    () => User,
    user => user.comments,
    { eager: true },
  )
  author: User;

  @ManyToOne(
    () => Post,
    post => post.comments,
    { onDelete: 'CASCADE' },
  )
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toCommentResponse(): CommentResponse {
    return classToPlain(this) as CommentResponse;
  }
}
