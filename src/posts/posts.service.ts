import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './models/create-post.dto';
import { FindAllQuery } from './models/findall-query.dto';
import { PostResponse } from './models/post.ro';
import { UpdatePostDto } from './models/update-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postsRepo: Repository<Post>) {}

  async findAll(user: User, query: FindAllQuery): Promise<PostResponse[]> {
    try {
      const postsQuery = this.postsRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.favoritedBy', 'favoritedBy');

      if (query.author) {
        postsQuery.where('author.username = :username', {
          username: query.author,
        });
      }

      if (query.favorited) {
        postsQuery.where('favoritedBy.username = :username', {
          username: query.favorited,
        });
      }

      // if (query.tag) {
      //   options.where.tagList = Like(`%{query.tag}%`);
      // }

      // if (query.skip) {
      //   options.skip = query.skip;
      // }

      // if (query.take) {
      //   options.take = query.take;
      // }

      const posts = await postsQuery.getMany();

      return posts.map(p => p.toPostResponse(user));
    } catch (err) {
      throw err;
    }
  }

  async findFeed() {}

  async findByAuthor(username: string, user: User): Promise<PostResponse[]> {
    try {
      const postsQuery = this.postsRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.favoritedBy', 'favoritedBy')
        .where('author.username = :username', { username });

      const posts = await postsQuery.getMany();

      return posts.map(p => p.toPostResponse(user));
    } catch (err) {
      throw err;
    }
  }

  async findBySlug(slug: string, user: User): Promise<PostResponse | null> {
    try {
      const post = await this.postsRepo.findOne({
        where: { slug },
        relations: ['comments'],
      });

      if (!post) {
        throw new NotFoundException();
      }

      return post.toPostResponse(user);
    } catch (err) {
      throw err;
    }
  }

  async create(user: User, data: CreatePostDto): Promise<PostResponse> {
    try {
      const post = this.postsRepo.create(data);

      post.author = user;

      await post.save();

      return post.toPostResponse();
    } catch (err) {
      throw err;
    }
  }

  async update(
    slug: string,
    user: User,
    data: UpdatePostDto,
  ): Promise<boolean> {
    try {
      const post = await this.postsRepo.findOne({ where: { slug } });

      if (!post) {
        throw new NotFoundException();
      }

      if (post.author.id !== user.id) {
        throw new UnauthorizedException();
      }

      const { affected } = await this.postsRepo.update(post.id, data);

      if (affected === 0) {
        return false;
      }

      return true;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  async remove(user: User, slug: string): Promise<boolean> {
    try {
      const post = await this.postsRepo.findOne({ where: { slug } });

      if (!post) {
        throw new NotFoundException();
      }

      if (user.id !== post.author.id) {
        throw new UnauthorizedException();
      }

      const { affected } = await this.postsRepo.delete(post.id);

      if (affected === 0) {
        return false;
      }

      return true;
    } catch (err) {
      throw err;
    }
  }

  async favorite(user: User, slug: string): Promise<PostResponse> {
    try {
      const post = await this.postsRepo.findOne({ slug });

      if (!post) {
        throw new NotFoundException();
      }

      if (post.favoritedBy.map(u => u.id).includes(user.id)) {
        throw new ConflictException();
      }

      post.favoritedBy.push(user);

      await post.save();

      return post.toPostResponse(user);
    } catch (err) {
      throw err;
    }
  }
  async unfavorite(user: User, slug: string): Promise<PostResponse> {
    try {
      const post = await this.postsRepo.findOne({ slug });

      if (!post) {
        throw new NotFoundException();
      }

      post.favoritedBy = post.favoritedBy.filter(u => u.id !== user.id);

      await post.save();

      return post.toPostResponse(user);
    } catch (err) {
      throw err;
    }
  }
}
