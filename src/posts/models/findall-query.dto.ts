import { IsString, IsOptional } from 'class-validator';
import { FindFeedQuery } from './findfeed-query.dto';

export class FindAllQuery extends FindFeedQuery {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  favorited?: string;
}
