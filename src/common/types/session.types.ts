export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveSessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null | undefined;
  userAgent: string | null | undefined;
}

export interface ActiveSession {
  user: ActiveUser;
  session: ActiveSessionRecord;
  isSystemAdmin: boolean;
}
