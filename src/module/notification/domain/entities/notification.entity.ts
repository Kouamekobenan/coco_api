import { NotificationChannel } from '@prisma/client';

export interface NotificationProps {
  id?: string;
  userId: string;
  salonId?: string | null;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead?: boolean;
  readAt?: Date | null;
  data?: Record<string, unknown> | null;
  createdAt?: Date;
}

export class NotificationEntity {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _salonId?: string | null;
  private readonly _title: string;
  private readonly _body: string;
  private readonly _channel: NotificationChannel;
  private _isRead: boolean;
  private _readAt?: Date | null;
  private readonly _data?: Record<string, unknown> | null;
  private readonly _createdAt: Date;

  constructor(props: NotificationProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._salonId = props.salonId ?? null;
    this._title = props.title;
    this._body = props.body;
    this._channel = props.channel;
    this._isRead = props.isRead ?? false;
    this._readAt = props.readAt ?? null;
    this._data = props.data ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get salonId(): string | null | undefined {
    return this._salonId;
  }

  public get title(): string {
    return this._title;
  }

  public get body(): string {
    return this._body;
  }

  public get channel(): NotificationChannel {
    return this._channel;
  }

  public get isRead(): boolean {
    return this._isRead;
  }

  public get readAt(): Date | null | undefined {
    return this._readAt;
  }

  public get data(): Record<string, unknown> | null | undefined {
    return this._data;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public markAsRead(): void {
    if (!this._isRead) {
      this._isRead = true;
      this._readAt = new Date();
    }
  }

  public toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      salonId: this._salonId,
      title: this._title,
      body: this._body,
      channel: this._channel,
      isRead: this._isRead,
      readAt: this._readAt,
      data: this._data,
      createdAt: this._createdAt,
    };
  }
}
