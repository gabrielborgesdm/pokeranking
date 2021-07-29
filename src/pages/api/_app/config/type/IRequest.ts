import { NextApiRequest } from 'next'
import { IUserResponse } from './IUser'

export interface IRequest extends NextApiRequest{
  user: IUserResponse;
}
