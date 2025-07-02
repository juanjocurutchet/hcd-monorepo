declare module "jsonwebtoken" {
  export interface JwtPayload {
    id?: number
    email?: string
    role?: string
    iat?: number
    exp?: number
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions,
  ): string

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions,
  ): JwtPayload | string

  export function decode(token: string, options?: DecodeOptions): JwtPayload | string | null

  export interface SignOptions {
    algorithm?: string
    expiresIn?: string | number
    notBefore?: string | number
    audience?: string | string[]
    issuer?: string
    jwtid?: string
    subject?: string
    noTimestamp?: boolean
    header?: object
    keyid?: string
    mutatePayload?: boolean
  }

  export interface VerifyOptions {
    algorithms?: string[]
    audience?: string | RegExp | Array<string | RegExp>
    clockTimestamp?: number
    clockTolerance?: number
    complete?: boolean
    issuer?: string | string[]
    ignoreExpiration?: boolean
    ignoreNotBefore?: boolean
    jwtid?: string
    subject?: string
    maxAge?: string | number
  }

  export interface DecodeOptions {
    complete?: boolean
    json?: boolean
  }
}
