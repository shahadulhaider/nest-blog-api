import { Controller, Param, Get } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentResponse } from './models/comment.ro';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('/:id')
  async findCommentById(@Param('id') id: string): Promise<CommentResponse> {
    return await this.commentsService.findById(id);
  }
}
