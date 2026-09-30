/**
 * Contrats d'interfaces des routes d'administration Coco Platform.
 * Chaque contrôleur de la couche Presentation implémente son interface correspondante.
 */

export interface IAdminDashboardRoutes {
  getKpis(): Promise<any>;
  getPaymentStats(): Promise<any>;
}

export interface IAdminSalonsRoutes {
  getSalons(query: any): Promise<any>;
  getSalonById(id: string): Promise<any>;
  updateSalonStatus(id: string, dto: any, adminUser: any): Promise<any>;
  reassignSalonOwner(id: string, dto: any, adminUser: any): Promise<any>;
}

export interface IAdminUsersRoutes {
  getUsers(query: any): Promise<any>;
  getUserById(id: string): Promise<any>;
  toggleUserStatus(id: string, adminUser: any): Promise<any>;
  updateUserRole(id: string, dto: any, adminUser: any): Promise<any>;
  revokeUserSessions(id: string, adminUser: any): Promise<any>;
}

export interface IAdminFinanceRoutes {
  getLedger(query: any): Promise<any>;
  getSalonBalance(salonId: string): Promise<any>;
  createPayout(dto: any, adminUser: any): Promise<any>;
}

export interface IAdminReviewsRoutes {
  getReviews(query: any): Promise<any>;
  moderateReview(id: string, dto: any, adminUser: any): Promise<any>;
  deleteReview(id: string, adminUser: any): Promise<any>;
}

export interface IAdminSettingsRoutes {
  getSettings(): Promise<any>;
  getSettingByKey(key: string): Promise<any>;
  upsertSetting(key: string, dto: any, adminUser: any): Promise<any>;
}

export interface IAdminAuditRoutes {
  getAuditLogs(query: any): Promise<any>;
}
