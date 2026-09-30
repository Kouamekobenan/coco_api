export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminDashboardKpis {
  totalSalons: number;
  activeSalons: number;
  pendingSalons: number;
  suspendedSalons: number;
  totalUsers: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenueGmv: number; // en FCFA
  totalCommissions: number; // en FCFA
  totalReviews: number;
  cocomoussoSalons: number;
  cocotailleSalons: number;
}

export interface AdminPaymentStat {
  provider: string;
  totalAmount: number;
  transactionCount: number;
}

export interface AuditLogEntry {
  actorId?: string;
  salonId?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
  ipAddress?: string;
  userAgent?: string;
  justification?: string;
}

export interface IAdminRepository {
  getDashboardKpis(): Promise<AdminDashboardKpis>;
  getPaymentStats(): Promise<AdminPaymentStat[]>;
  getSalons(query: {
    page: number;
    limit: number;
    status?: string;
    universe?: string;
    search?: string;
  }): Promise<{ items: any[]; total: number }>;
  getSalonById(id: string): Promise<any | null>;
  updateSalonStatus(id: string, status: string): Promise<any>;
  reassignSalonOwner(salonId: string, newOwnerId: string): Promise<any>;
  getUsers(query: {
    page: number;
    limit: number;
    search?: string;
    isSuperAdmin?: boolean;
    isActive?: boolean;
  }): Promise<{ items: any[]; total: number }>;
  getUserById(id: string): Promise<any | null>;
  toggleUserStatus(userId: string): Promise<any>;
  updateUserSuperAdmin(userId: string, isSuperAdmin: boolean): Promise<any>;
  revokeUserSessions(userId: string): Promise<number>;
  getReviews(query: {
    page: number;
    limit: number;
    salonId?: string;
    isPublic?: boolean;
    rating?: number;
  }): Promise<{ items: any[]; total: number }>;
  moderateReview(
    reviewId: string,
    isPublic: boolean,
    moderationReason?: string,
  ): Promise<any>;
  deleteReview(reviewId: string): Promise<boolean>;
  getLedger(query: {
    page: number;
    limit: number;
    salonId?: string;
    entryType?: string;
  }): Promise<{ items: any[]; total: number }>;
  getSalonLedgerBalance(salonId: string): Promise<{ balance: number; currency: string }>;
  createPayout(data: {
    salonId: string;
    amount: number;
    reference: string;
    description?: string;
  }): Promise<any>;
  getSettings(): Promise<any[]>;
  getSettingByKey(key: string): Promise<any | null>;
  upsertSetting(key: string, value: any, description?: string): Promise<any>;
  logAudit(entry: AuditLogEntry): Promise<void>;
  getAuditLogs(query: {
    page: number;
    limit: number;
    actorId?: string;
    salonId?: string;
    entityType?: string;
  }): Promise<{ items: any[]; total: number }>;
}
