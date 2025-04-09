// Singleton Pattern for User Session Management
export class UserSession {
  private static instance: UserSession | null = null;
  private userId: string | null = null;
  private token: string | null = null;
  private lastActivity: Date = new Date();

  private constructor() {}

  public static getInstance(): UserSession {
    if (!UserSession.instance) {
      UserSession.instance = new UserSession();
    }
    return UserSession.instance;
  }

  public login(userId: string, token: string): void {
    this.userId = userId;
    this.token = token;
    this.updateLastActivity();
  }

  public logout(): void {
    this.userId = null;
    this.token = null;
  }

  public isLoggedIn(): boolean {
    return !!this.userId && !!this.token;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public getToken(): string | null {
    return this.token;
  }

  public updateLastActivity(): void {
    this.lastActivity = new Date();
  }

  public getLastActivity(): Date {
    return this.lastActivity;
  }

  public isSessionExpired(expirationMinutes: number = 30): boolean {
    if (!this.isLoggedIn()) return true;
    
    const now = new Date();
    const diffMs = now.getTime() - this.lastActivity.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes > expirationMinutes;
  }
}