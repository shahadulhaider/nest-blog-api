import { IsOptional, IsNumber } from 'class-validator';

export class FindFeedQuery {
  @IsOptional()
  @IsNumber()
  take?: number;

  @IsOptional()
  @IsNumber()
  skip?: number;
}
