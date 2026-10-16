import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { LoyaltyScope, LoyaltyTxType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';

/** Points offerts lors d'un parrainage réussi (à l'inscription du filleul). */
export const REFERRER_REWARD_POINTS = 100;
export const REFEREE_REWARD_POINTS = 50;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class ReferralUseCase {
  private readonly logger = new Logger(ReferralUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Retourne le code de parrainage de l'utilisateur, en le générant au besoin. */
  public async ensureReferralCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (user?.referralCode) return user.referralCode;

    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this.generateCode();
      try {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
          select: { referralCode: true },
        });
        return updated.referralCode as string;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          continue; // collision de code, on réessaie
        }
        throw e;
      }
    }
    throw new Error('Impossible de générer un code de parrainage unique.');
  }

  /**
   * Appelé à l'inscription d'un nouvel utilisateur : génère son code, et si un
   * code de parrainage valide est fourni, lie le filleul et crédite les deux parties.
   */
  public async handleNewUser(newUserId: string, usedCode?: string | null): Promise<void> {
    await this.ensureReferralCode(newUserId);

    const code = usedCode?.trim().toUpperCase();
    if (!code) return;

    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, isActive: true },
    });
    if (!referrer || !referrer.isActive || referrer.id === newUserId) {
      this.logger.warn(`Code de parrainage invalide ou non applicable: ${code}`);
      return;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: newUserId,
            referrerPoints: REFERRER_REWARD_POINTS,
            refereePoints: REFEREE_REWARD_POINTS,
          },
        });
        await this.credit(tx, referrer.id, REFERRER_REWARD_POINTS, 'Parrainage : un filleul a rejoint Coco', newUserId);
        await this.credit(tx, newUserId, REFEREE_REWARD_POINTS, 'Bonus de bienvenue (parrainage)', referrer.id);
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return; // déjà parrainé, aucune récompense en double
      }
      throw e;
    }
  }

  public async getMyReferralInfo(userId: string) {
    const code = await this.ensureReferralCode(userId);
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        referee: { select: { id: true, firstName: true, lastName: true, createdAt: true } },
      },
    });

    return {
      referralCode: code,
      referrerRewardPoints: REFERRER_REWARD_POINTS,
      refereeRewardPoints: REFEREE_REWARD_POINTS,
      totalReferrals: referrals.length,
      totalPointsEarned: referrals.reduce((sum, r) => sum + r.referrerPoints, 0),
      referrals: referrals.map((r) => ({
        userId: r.referee.id,
        name: [r.referee.firstName, r.referee.lastName].filter(Boolean).join(' ') || null,
        joinedAt: r.referee.createdAt,
        pointsEarned: r.referrerPoints,
      })),
    };
  }

  private async credit(
    tx: Prisma.TransactionClient,
    userId: string,
    points: number,
    description: string,
    referenceId: string,
  ): Promise<void> {
    let account = await tx.loyaltyAccount.findFirst({
      where: {
        scope: LoyaltyScope.GLOBAL,
        userId,
        salonCustomerId: null,
        salonId: null,
      },
    });
    if (!account) {
      account = await tx.loyaltyAccount.create({
        data: { scope: LoyaltyScope.GLOBAL, userId },
      });
    }
    await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: { pointsBalance: { increment: points } },
    });
    await tx.loyaltyTransaction.create({
      data: {
        loyaltyAccountId: account.id,
        points,
        txType: LoyaltyTxType.REFERRAL_BONUS,
        description,
        referenceId,
      },
    });
  }

  private generateCode(): string {
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    }
    return code;
  }
}
