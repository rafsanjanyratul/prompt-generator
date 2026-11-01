import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'

import { env } from '../config/env.js'

export const signToken = (payload: string | object | Buffer) =>
  jwt.sign(payload, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
