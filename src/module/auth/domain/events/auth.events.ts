export const AUTH_EVENT_PATTERNS = {
  USER_REGISTERED: 'auth.user.registered',
} as const;

export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly phone: string,
    public readonly nationalPhone: string,
    public readonly email: string | null,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly fullName: string | null,
    public readonly universe: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
