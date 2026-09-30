export interface SessionProps {
  id: string;
  userId: string;
  refreshToken: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  revokedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SessionEntity {
  private constructor(private readonly props: SessionProps) {}

  public static create(props: {
    id: string;
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    deviceId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): SessionEntity {
    const now = new Date();
    return new SessionEntity({
      id: props.id,
      userId: props.userId,
      refreshToken: props.refreshToken,
      deviceId: props.deviceId ?? null,
      ipAddress: props.ipAddress ?? null,
      userAgent: props.userAgent ?? null,
      revokedAt: null,
      expiresAt: props.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: SessionProps): SessionEntity {
    return new SessionEntity(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public getRefreshToken(): string {
    return this.props.refreshToken;
  }

  public getDeviceId(): string | null | undefined {
    return this.props.deviceId;
  }

  public getIpAddress(): string | null | undefined {
    return this.props.ipAddress;
  }

  public getUserAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  public getRevokedAt(): Date | null | undefined {
    return this.props.revokedAt;
  }

  public getExpiresAt(): Date {
    return this.props.expiresAt;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Méthodes métier
  public isRevoked(): boolean {
    return this.props.revokedAt !== null && this.props.revokedAt !== undefined;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  public revoke(): void {
    this.props.revokedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public rotateRefreshToken(newRefreshToken: string, newExpiresAt: Date): void {
    this.props.refreshToken = newRefreshToken;
    this.props.expiresAt = newExpiresAt;
    this.props.updatedAt = new Date();
  }
}
