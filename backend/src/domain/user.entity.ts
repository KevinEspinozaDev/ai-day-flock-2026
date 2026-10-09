export interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: Date;
}

/** Public projection of a user: never exposes the password hash. */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}
