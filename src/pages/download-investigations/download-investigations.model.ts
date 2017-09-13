export class SearchSortOptions {
  static CREATED = "createdAt";
  static UPDATED = "lastupdated";
  static CREATOR = "author";

  static CREATEDDESC = "-createdAt";
  static UPDATEDDESC = "-lastupdated";
  static CREATORDESC = "-author";
}

export interface ISearchParams {
  afterDate?: string;
  beforeDate?: string;
  fields?: string;
  page: string;
  perPage: number;
  query?: string;
  sort?: string;
}

export class DateFormat {
  static API = "YYYY-MM-DD"
}

export class DatePickerOptions {
  static DisplayFormat = DateFormat.API;
  static PickerFormat = "DD MMM YYYY";
}
