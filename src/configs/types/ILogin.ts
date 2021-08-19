import { IResponse } from './IResponse'
import { IUserType } from './IUser'

export type ILogin = {
  token?: string;
  user?: IUserType;
}

export interface ILoginResponse extends ILogin, IResponse {}
