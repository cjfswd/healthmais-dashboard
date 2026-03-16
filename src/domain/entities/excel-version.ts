export type VersionStatus = 'pending' | 'approved' | 'rejected';

export interface ExcelVersion {
  id: string;
  filename: string;
  uploadedAt: Date;
  status: VersionStatus;
  base64Content: string;
  author: string;
}

export interface IExcelRepository {
  getLatestVersion(): Promise<ExcelVersion | null>;
  savePendingVersion(version: ExcelVersion): Promise<void>;
  listPendingVersions(): Promise<ExcelVersion[]>;
  approveVersion(id: string): Promise<void>;
  rejectVersion(id: string): Promise<void>;
}
