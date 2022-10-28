export interface DocumentReport {
  description: string;
  createdAt: string;
  type: string;
}

export interface AccountReport {
  firstName: string;
  lastName: string;
  plz: string;
  birthDate: string;
}

export interface PolicyReport {
  startDate: string;
  number: string;
}

export interface ReportData {
  document: DocumentReport;
  account: AccountReport;
  policy: PolicyReport;
}