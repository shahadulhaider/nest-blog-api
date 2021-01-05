import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { CommentResponse } from './models/comment.ro';
import { User } from 'src/users/user.entity';
import { CreateCommentDto } from './models/create-comment.dto';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async findByPostSlug(slug: string): Promise<CommentResponse[]> {
    const comments = await this.commentsRepo
      .createQueryBuilder('comment')
      .leftJoin('comment.post', 'post')
      .leftJoinAndSelect('comment.author', 'author')
      .where('post.slug = :slug', { slug })
      .getMany();

    return comments.map(c => c.toCommentResponse());
  }

  async findById(id: string): Promise<CommentResponse> {
    const comment = await this.commentsRepo.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment.toCommentResponse();
  }

  async createComment(
    user: User,
    slug: string,
    data: CreateCommentDto,
  ): Promise<CommentResponse> {
    const post = await this.postsRepo.findOne({ slug });

    if (!post) {
      throw new NotFoundException();
    }
    const comment = this.commentsRepo.create(data);

    comment.post = post;
    comment.author = user;

    await comment.save();

    return comment.toCommentResponse();
  }

  async deleteComment(user: User, id: string): Promise<boolean> {
    const { affected } = await this.commentsRepo
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .delete()
      .where('id = :id', { id })
      .andWhere('author.id = :userId', { userId: user.id })
      .execute();

    if (affected === 0) {
      return false;
    }

    return true;
  }
}
