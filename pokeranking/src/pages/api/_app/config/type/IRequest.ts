import { NextApiRequest } from 'next'
import { IUserInterface } from './IUser'

export interface IRequest extends NextApiRequest{
  user: IUserInterface
}
