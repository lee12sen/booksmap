export type LoanStatus = "available" | "borrowed" | "unknown";

export interface LibraryBookResult {
  libraryId: string;
  libraryName: string;
  address: string;
  bookTitle: string;
  hasBook: boolean;
  loanStatus: LoanStatus;
  distanceKm?: number;
  walkingMinutes?: number;
  transitMinutes?: number;
  latitude?: number;
  longitude?: number;
  dataUpdatedAt?: string;
}
