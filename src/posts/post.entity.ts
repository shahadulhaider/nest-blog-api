import { classToPlain, Exclude } from 'class-transformer';
import * as slug from 'slug';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationCount,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PostJSON, PostResponse } from './models/post.ro';
import { Comment } from 'src/comments/comment.entity';
import { Tag } from 'src/tags/tag.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => User,
    user => user.posts,
    { eager: true },
  )
  author: User;

  @OneToMany(
    () => Comment,
    comment => comment.post,
  )
  comments: Comment[];

  @ManyToMany(
    () => Tag,
    tag => tag.post,
    { eager: true },
  )
  @JoinTable()
  tagList: Tag[];

  @ManyToMany(
    () => User,
    user => user.favorites,
    { eager: true },
  )
  @JoinTable()
  @Exclude()
  favoritedBy: User[];

  @RelationCount((post: Post) => post.favoritedBy)
  favoritesCount: number;

  @BeforeInsert()
  genarateSlug() {
    this.slug =
      slug(this.title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON(): PostJSON {
    return classToPlain(this) as PostJSON;
  }

  toPostResponse(user?: User): PostResponse {
    let favorited = null;
    if (user) {
      favorited = this.favoritedBy.map(user => user.id).includes(user.id);
    }
    const post = this.toJSON();
    return { ...post, favorited };
  }
}
