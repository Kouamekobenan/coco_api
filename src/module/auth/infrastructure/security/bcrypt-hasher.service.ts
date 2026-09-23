import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/ports/password-hasher.port.js';

@Injectable()
export class BcryptHasherService implements IPasswordHasher {
  private readonly saltRounds = 10;

  public async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  public async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
