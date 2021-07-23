export interface IMigration {
  _id?: string,
  name: string,
  executed: boolean
  updatedAt?: number,
  createdAt?: number
}
