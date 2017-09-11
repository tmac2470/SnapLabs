export class SearchSortOptions {
  static CREATED = "createdAt";
  static UPDATED = "lastUpdatedAt";
  static CREATOR = "author";

  static CREATEDDESC = "-createdAt";
  static UPDATEDDESC = "-lastUpdatedAt";
  static CREATORDESC = "-author";
}

export interface ISearchParams {
  afterDate?: Date;
  beforeDate?: Date;
  fields?: string;
  page: string;
  perPage: number;
  query?: string;
  sort?: string;
}
