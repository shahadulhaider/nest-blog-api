import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string;

  @Column()
  tag: string;


  @ManyToMany(
    () => Post,
    post => post.tagList,
  )
  post: Post[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;
}
