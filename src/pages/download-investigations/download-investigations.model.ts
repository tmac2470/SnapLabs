import * as moment from "moment";

export class SearchSortOptions {
  static CREATED = "createdat";
  static UPDATED = "lastupdated";
  static CREATOR = "author";

  static CREATEDDESC = "-createdat";
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
  static API = "YYYY-MM-DD";
}

export class DatePickerOptions {
  static DisplayFormat = DateFormat.API;
  static PickerFormat = "DD MMM YYYY";
  static MaxDate = moment().format(DateFormat.API);
  static MinDate = moment()
    .subtract(1, "year")
    .format(DateFormat.API);
}
