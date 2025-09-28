export interface IPagination {
  limit: number,
  skip: number,
}

export interface IGetStatesPayload {
  limit: number,
  skip: number,
  countryId: number,
}

export interface IRecordsCount {
  count: number
}

export interface ICountries {
  id: number,
  name: string,
  iso3: string,
}

export interface IStates {
  id: number,
  name: string,
  isow: string,
  countryId: number,
}
