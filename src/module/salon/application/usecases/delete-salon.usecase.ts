import { Inject, Injectable } from '@nestjs/common';
import type { ISalonRepository } from '../../domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../domain/repositories/salon.repository.interface.js';
import { SalonNotFoundException } from '../../domain/exceptions/salon-domain.exception.js';

@Injectable()
export class DeleteSalonUseCase {
  constructor(
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(id: string): Promise<{ success: boolean; message: string }> {
    const salon = await this.salonRepository.findById(id);
    if (!salon) {
      throw new SalonNotFoundException(id);
    }

    await this.salonRepository.delete(id);

    return {
      success: true,
      message: `Le salon "${salon.getName()}" (${id}) a été supprimé avec succès.`,
    };
  }
}
