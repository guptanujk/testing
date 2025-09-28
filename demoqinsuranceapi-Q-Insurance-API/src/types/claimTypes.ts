export interface IClaimListPayload {
  currentUserId: number,
  search?: string,
  status?: string,
  createdOn?: string,
  category?: string,
  limit?: number,
  skip?: number,
  page?: number,
  isAdmin: boolean,
}
