export enum IStatusType {
  Success = 'SUCCESS',
  Warning = 'WARNING',
  Danger = 'DANGER'
}

export interface IStatus {
  message?: string
  type: IStatusType
  onClick?: Function
}

export interface IStatusStyle {
  display?: string
  backgroundColor?: string
  color?: string
  cursor?: string
}
