import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user-decorator';
import { User as UserEntity } from 'src/users/user.entity';
import { ProfileDto } from './profile.dto';
import { ProfileResponse } from './profile.ro';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async findProfiles(): Promise<ProfileResponse[]> {
    return await this.profileService.findAll();
  }

  @Get('/:id')
  async findProfile(@Param() id: string): Promise<ProfileResponse | null> {
    return await this.profileService.findProfileById(id);
  }

  @Get('/user/:username') // TODO: optional auth guard
  async findProfileByUsername(
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return await this.profileService.findProfileByUsername(username);
  }

  @Post()
  @UseGuards(AuthGuard())
  async createProfile(
    @User() { username }: UserEntity,
    @Body() data: ProfileDto,
  ): Promise<ProfileResponse> {
    return await this.profileService.createProfile(username, data);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  async updateProfile(
    @Param() id: string,
    @User() { username }: UserEntity,
    @Body() data: ProfileDto,
  ): Promise<boolean> {
    return await this.profileService.edit(id, username, data);
  }

  @Post('/:id/follow')
  @UseGuards(AuthGuard())
  async follow(
    @User() user: UserEntity,
    @Param('id') id: string,
  ): Promise<ProfileResponse | boolean> {
    return await this.profileService.follow(user, id);
  }

  @Delete('/:id/follow')
  @UseGuards(AuthGuard())
  async unfollow(
    @User() user: UserEntity,
    @Param('id') id: string,
  ): Promise<ProfileResponse | boolean> {
    return await this.profileService.unfollow(user, id);
  }
}
