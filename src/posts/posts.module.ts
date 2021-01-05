import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment, Tag]), AuthModule],
  controllers: [PostsController],
  providers: [PostsService, CommentsService],
})
export class PostsModule {}
