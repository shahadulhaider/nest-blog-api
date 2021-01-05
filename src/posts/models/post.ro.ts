import { UserResponse } from 'src/users/user.ro';

export class PostJSON {
  slug: string;
  title: string;
  description: string;
  body: string;
  author: UserResponse;
  favoritesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PostResponse extends PostJSON {
  favorited: boolean | null;
}
