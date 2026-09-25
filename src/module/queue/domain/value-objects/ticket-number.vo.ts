import { QueueType } from '@prisma/client';
import { InvalidTicketNumberFormatException } from '../exceptions/queue-domain.exception.js';

export class TicketNumber {
  private readonly _value: string;

  constructor(value: string) {
    const regex = /^[WA]-\d{3,}$/;
    if (!regex.test(value)) {
      throw new InvalidTicketNumberFormatException(value);
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public get prefix(): 'W' | 'A' {
    return this._value[0] as 'W' | 'A';
  }

  public get sequence(): number {
    return parseInt(this._value.substring(2), 10);
  }

  public static generate(type: QueueType, sequence: number): TicketNumber {
    const prefix = type === QueueType.APPOINTMENT ? 'A' : 'W';
    const padded = sequence.toString().padStart(3, '0');
    return new TicketNumber(`${prefix}-${padded}`);
  }

  public toString(): string {
    return this._value;
  }
}
