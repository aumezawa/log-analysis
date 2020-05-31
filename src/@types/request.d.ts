declare namespace Express {
  export interface Request {
    token?: {
      iss: string,
      sub: string,
      iat: number,
      exp: number,
      usr: string,
      als: string,
      prv: string
    }
  }
}

declare namespace Express {
  export interface Request {
    resPath?        : string,
    projectInfoPath?: string
  }
}
