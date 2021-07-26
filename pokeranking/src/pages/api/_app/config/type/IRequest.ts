import { NextApiRequest } from 'next'
import { IUser } from './IUser'

export interface IRequest extends NextApiRequest{
  user: IUser;
}
