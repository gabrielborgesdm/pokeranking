import { IModel } from './IModel'

export interface IMigration extends IModel {
  name: string
  executed: boolean
}
