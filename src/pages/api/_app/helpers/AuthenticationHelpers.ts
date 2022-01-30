import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const accessTokenSecret = String(process.env.ACCESS_TOKEN_SECRET)

export interface Payload extends JwtPayload {
  _id: string;
}

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10)

export const isPasswordValid = async (
  reqPassword: string,
  accountHash: string
) => {
  return await bcrypt.compare(reqPassword, accountHash)
}

export const generateAccessToken = (payload: object) =>
  jwt.sign(payload, accessTokenSecret)

export const verifyTokenAndGetUserId = (token: string): string => {
  let payload: JwtPayload | null
  try {
    payload = jwt.verify(token, accessTokenSecret) as Payload
  } catch (error) {
    console.log(error)
  }
  return payload?._id ? payload._id : null
}
