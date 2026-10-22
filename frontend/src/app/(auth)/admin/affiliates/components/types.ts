export interface AffiliateReportRow {
  affiliateCode: string | null;
  name: string;
  email: string;
  referralCount: number;
  salesCount: number;
  salesTotal: number;
  commissionTotal: number;
  balance: number;
  pending: number;
}
