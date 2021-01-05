export class ProfileResponse {
  id: string;
  bio: string;
  image: string | null;
  followers: ProfileResponse[];
  following: ProfileResponse[];
}
