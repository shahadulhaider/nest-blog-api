import { UserResponse } from '../../users/user.ro';

export class CommentResponse {
  id: string;
  body: string;
  author: UserResponse;
  createdAt: string | Date;
  updatedAt: string | Date;
}
