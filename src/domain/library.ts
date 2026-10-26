export type LoanStatus = "available" | "borrowed" | "unknown";

export interface LibrarySummary {
  libraryId: string;
  libraryName: string;
  address: string;
  telephone?: string;
  homepage?: string;
}

export interface BookSearchResult {
  title: string;
  authors: string;
  publisher: string;
  publicationYear: string;
  isbn13: string;
  imageUrl?: string;
  detailUrl?: string;
}

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
