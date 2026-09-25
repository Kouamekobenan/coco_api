import { StaffEntity } from '../entities/staff.entity.js';
import { StaffServiceEntity } from '../entities/staff-service.entity.js';
import { StaffWorkingHourEntity } from '../entities/staff-working-hour.entity.js';
import { StaffBreakEntity } from '../entities/staff-break.entity.js';
import { StaffTimeOffEntity, TimeOffStatus } from '../entities/staff-time-off.entity.js';

export const STAFF_REPOSITORY = Symbol('STAFF_REPOSITORY');

export interface IStaffRepository {
  // Staff
  save(staff: StaffEntity): Promise<void>;
  findById(id: string): Promise<StaffEntity | null>;
  findBySalonId(salonId: string, onlyActive?: boolean): Promise<StaffEntity[]>;
  update(staff: StaffEntity): Promise<void>;
  delete(id: string): Promise<void>;

  // Staff Services
  saveStaffService(staffService: StaffServiceEntity): Promise<void>;
  findStaffServiceById(id: string): Promise<StaffServiceEntity | null>;
  findStaffServices(staffId: string): Promise<StaffServiceEntity[]>;
  updateStaffService(staffService: StaffServiceEntity): Promise<void>;
  deleteStaffService(id: string): Promise<void>;

  // Working Hours
  saveWorkingHours(staffId: string, hours: StaffWorkingHourEntity[]): Promise<void>;
  findWorkingHours(staffId: string): Promise<StaffWorkingHourEntity[]>;

  // Breaks
  saveBreak(staffBreak: StaffBreakEntity): Promise<void>;
  findBreakById(id: string): Promise<StaffBreakEntity | null>;
  findBreaks(staffId: string): Promise<StaffBreakEntity[]>;
  deleteBreak(id: string): Promise<void>;

  // Time Offs
  saveTimeOff(timeOff: StaffTimeOffEntity): Promise<void>;
  findTimeOffById(id: string): Promise<StaffTimeOffEntity | null>;
  findTimeOffs(staffId: string): Promise<StaffTimeOffEntity[]>;
  updateTimeOffStatus(id: string, status: TimeOffStatus): Promise<void>;
  deleteTimeOff(id: string): Promise<void>;
}
