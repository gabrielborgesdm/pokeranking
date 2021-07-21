import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const accessTokenSecret = String(process.env.ACCESS_TOKEN_SECRET)

export interface Payload extends JwtPayload{
  _id: string
}

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10)

export const isPasswordValid = async (reqPassword: string, accountHash: string) => {
  return await bcrypt.compare(reqPassword, accountHash)
}

export const generateAccessToken = (payload: object) => jwt.sign(payload, accessTokenSecret)

export const isTokenValid = (token: string): boolean => {
  const payload: JwtPayload = jwt.verify(token, accessTokenSecret) as Payload
  return !!payload._id
}
