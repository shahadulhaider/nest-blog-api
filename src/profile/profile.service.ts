import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { ProfileDto } from './profile.dto';
import { Profile } from './profile.entity';
import { ProfileResponse } from './profile.ro';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async findAll(): Promise<ProfileResponse[]> {
    try {
      const profiles = await this.profileRepo.find();

      return profiles.map(p => p.buildProfileResponse());
    } catch (err) {
      throw err;
    }
  }

  async findProfileById(id: string): Promise<ProfileResponse | null> {
    try {
      const profile = await this.profileRepo.findOne(id, {
        relations: ['following', 'followers'],
      });

      if (!profile) {
        throw new NotFoundException();
      }

      return profile.buildProfileResponse();
    } catch (err) {
      if (err.code === '22P02') {
        throw new HttpException('Invalid id', 400);
      }

      throw err;
    }
  }

  async findProfileByUsername(username: string): Promise<ProfileResponse> {
    try {
      const user = await this.usersRepo.findOne({
        where: { username },
        relations: [
          'profile',
          'profile.followers',
          'profile.following',
          'profile.user',
        ],
      });

      const { profile } = user;

      if (!profile) {
        throw new NotFoundException();
      }

      return profile.buildProfileResponse();
    } catch (err) {
      throw err;
    }
  }

  async createProfile(
    username: string,
    data: ProfileDto,
  ): Promise<ProfileResponse> {
    try {
      const user = await this.usersRepo.findOne({ username });

      if (!user || !user.verified) {
        throw new UnauthorizedException();
      }

      const profile = this.profileRepo.create(data);

      profile.user = user;
      await profile.save();

      return profile.buildProfileResponse();
    } catch (err) {
      throw err;
    }
  }

  async edit(id: string, username: string, data: ProfileDto): Promise<boolean> {
    try {
      const profile = await this.profileRepo.findOne(id);

      if (!profile) {
        throw new NotFoundException();
      }

      const owner = await this.usersRepo.findOne({ username });

      if (!owner || !owner.verified || owner.id !== profile.user.id) {
        throw new UnauthorizedException();
      }

      const { affected } = await this.profileRepo.update(id, data);

      if (affected === 0) {
        return false;
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async follow(
    { username }: User,
    id: string,
  ): Promise<ProfileResponse | boolean> {
    try {
      const current = await this.usersRepo.findOne({
        where: { username },
        relations: ['profile'],
      });

      if (!current) {
        throw new UnauthorizedException();
      }

      const profile = await this.profileRepo.findOne(id, {
        relations: ['followers', 'following'],
      });

      if (!profile) {
        throw new NotFoundException();
      }

      const followed = profile.followers.filter(
        f => f.id === current.profile.id,
      );

      if (current.profile.id === profile.id || followed.length > 0) {
        return false;
      }

      profile.followers.push(current.profile);

      await profile.save();
      return profile.buildProfileResponse();
    } catch (err) {
      throw err;
    }
  }

  async unfollow(
    { username }: User,
    id: string,
  ): Promise<ProfileResponse | boolean> {
    try {
      const current = await this.usersRepo.findOne({
        where: { username },
        relations: ['profile'],
      });

      if (!current) {
        throw new UnauthorizedException();
      }

      const profile = await this.profileRepo.findOne(id, {
        relations: ['followers', 'following'],
      });

      if (!profile) {
        throw new NotFoundException();
      }

      const unfollowed = profile.followers.filter(
        f => f.id !== current.profile.id,
      );

      if (current.profile.id === profile.id || unfollowed.length > 0) {
        return false;
      }

      profile.followers = unfollowed;

      await profile.save();
      return profile.buildProfileResponse();
    } catch (err) {
      throw err;
    }
  }
}
