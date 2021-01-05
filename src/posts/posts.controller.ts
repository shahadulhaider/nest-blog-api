import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { User } from 'src/auth/user-decorator';
import { User as UserEntity } from 'src/users/user.entity';
import { CreatePostDto } from './models/create-post.dto';
import { FindAllQuery } from './models/findall-query.dto';
import { PostResponse } from './models/post.ro';
import { UpdatePostDto } from './models/update-post.dto';
import { PostsService } from './posts.service';
import { CommentsService } from 'src/comments/comments.service';
import { CommentResponse } from 'src/comments/models/comment.ro';
import { CreateCommentDto } from 'src/comments/models/create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @Get()
  @UseGuards(new OptionalAuthGuard())
  async findAll(
    @User() user: UserEntity,
    @Query() query: FindAllQuery,
  ): Promise<PostResponse[]> {
    return await this.postsService.findAll(user, query);
  }

  @Get('/feed')
  @UseGuards(AuthGuard())
  async findFeed() {
    return await this.postsService.findFeed();
  }

  @Get('/:slug')
  @UseGuards(new OptionalAuthGuard())
  async findBySlug(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<PostResponse | null> {
    return await this.postsService.findBySlug(slug, user);
  }

  @Get('/author/:username')
  @UseGuards(new OptionalAuthGuard())
  async findByAuthor(
    @Param('username') username: string,
    @User() user: UserEntity,
  ): Promise<PostResponse[]> {
    return await this.postsService.findByAuthor(username, user);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(
    @User() user: UserEntity,
    @Body() data: CreatePostDto,
  ): Promise<PostResponse> {
    return await this.postsService.create(user, data);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard())
  async update(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body() data: UpdatePostDto,
  ): Promise<boolean> {
    return await this.postsService.update(slug, user, data);
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async delete(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<boolean> {
    return await this.postsService.remove(user, slug);
  }

  @Get('/:slug/comments')
  async findComments(@Param('slug') slug: string): Promise<CommentResponse[]> {
    return await this.commentsService.findByPostSlug(slug);
  }

  @Post('/:slug/comments')
  @UseGuards(AuthGuard())
  async createComment(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body() data: CreateCommentDto,
  ): Promise<CommentResponse> {
    return await this.commentsService.createComment(user, slug, data);
  }

  @Delete('/:slug/comments/:id')
  @UseGuards(AuthGuard())
  async deleteComment(
    @User() user: UserEntity,
    @Param('id') id: string,
  ): Promise<boolean> {
    return await this.commentsService.deleteComment(user, id);
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favorite(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<PostResponse> {
    return await this.postsService.favorite(user, slug);
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavorite(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<PostResponse> {
    return await this.postsService.unfavorite(user, slug);
  }
}
