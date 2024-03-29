import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as crypto from "crypto"
import * as fs from "fs"
import * as jwt from "jsonwebtoken"
import * as path from "path"

import logger = require("../lib/logger")

import logRouter from "./api-v1-log"
import statsRouter from "./api-v1-stats"
import testRouter from "./api-v1-test"

const rootPath: string = process.cwd()

const router: Router = express.Router()

router.route("/public-key")
.get((req: Request, res: Response, next: NextFunction) => {
  let publicKey: string
  try {
    publicKey = fs.readFileSync(path.join(rootPath, req.app.get("public-key-path")), "utf8")
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  // OK
  return res.status(200).json({
    msg: "Use the public key for encryption.",
    key: publicKey
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/login")
.post((req: Request, res: Response, next: NextFunction) => {
  /*if (req.protocol !== "https") {
    // Forbidden
    return res.status(403).json({
      msg: "use https protocol for authentication."
    })
  }*/

  if (!req.body.username || !req.body.password) {
    // Bad Request
    return res.status(400).json({
      msg: "Username and password are required. (param name: username, password)"
    })
  }

  if (req.body.username === "anonymous") {
    // OK
    const token = jwt.sign({
      iss: process.env.npm_package_name,
      sub: "token-" + process.env.npm_package_name,
      usr: "anonymous",
      als: "anonymous",
      prv: "none"
    }, req.app.get("token-key"), { expiresIn: req.app.get("token-period") })
    return res.status(200).json({
      msg: "Authentication successfully.",
      token: token
    })
  }

  const username: string = req.body.username
  let password: string = req.body.password
  const encrypted: boolean = !!req.body.encrypted

  let userlist: LocalUserList = []
  try {
    userlist = JSON.parse(fs.readFileSync(path.join(rootPath, req.app.get("userlist-path")), "utf8"))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.status(500).json({
      msg: "Contact an administrator."
    })
  }

  if (encrypted) {
    let privateKey: string
    try {
      privateKey = fs.readFileSync(path.join(rootPath, req.app.get("private-key-path")), "utf8")
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }
    password = crypto.privateDecrypt(privateKey, Buffer.from(password, "base64")).toString()
  }

  const userinfo: LocalUserInfo = userlist.find((userinfo: LocalUserInfo) => (
    (username === userinfo.username && crypto.createHash("sha256").update(username + password, "utf8").digest("hex") === userinfo.password)
  ))

  if (!userinfo) {
    // Unauthorized
    return res.status(401).json({
      msg: "Username or password is incorrect."
    })
  }

  // OK
  const token = jwt.sign({
    iss: process.env.npm_package_name,
    sub: "token-" + process.env.npm_package_name,
    usr: userinfo.username,
    als: userinfo.alias,
    prv: userinfo.privilege
  }, req.app.get("token-key"), { expiresIn: req.app.get("token-period") })
  return res.status(200).json({
    msg: "Authentication successfully.",
    token: token
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "POST method is only supported."
  })
})


router.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.npm_package_config_no_auth === "true" || process.env.NO_AUTH === "true") {
    req.token = {
      iss: process.env.npm_package_name,
      sub: "token-" + process.env.npm_package_name,
      iat: 0,
      exp: 0,
      usr: "root",
      als: "root",
      prv: "root"
    }
    return next()
  }

  const token = req.query.token || req.body.token || req.header("X-Access-Token")
  if (!token) {
    // Unauthorized
    return res.status(401).json({
      msg: "Access token is required. (param name: token)"
    })
  }

  jwt.verify(token, req.app.get("token-key"), (err: jwt.VerifyErrors, decoded: any) => {
    if (err) {
      // Unauthorized
      return res.status(401).json({
        msg: `Access token is invalid. (reason: ${ err.message })`
      })
    }

    req.token = {
      iss: (decoded as any)["iss"],
      sub: (decoded as any)["sub"],
      iat: (decoded as any)["iat"],
      exp: (decoded as any)["exp"],
      usr: (decoded as any)["usr"],
      als: (decoded as any)["als"],
      prv: (decoded as any)["prv"]
    }
    return next()
  })

  return
})

router.route("/token")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: "You get your token information.",
    iss: req.token.iss,
    sub: req.token.sub,
    iat: req.token.iat,
    exp: req.token.exp,
    IssueAt: (new Date(req.token.iat * 1000)).toLocaleString("ja"),
    ExpirationTime: (new Date(req.token.exp * 1000)).toLocaleString("ja")
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.use("/log", logRouter)

router.use("/stats", statsRouter)

router.use("/test", testRouter)

router.route("/whatsnew")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).sendFile(path.join(rootPath, "WHATSNEW.md"))
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/hello")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: `Hello ${ req.token.usr }!`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("*")
.all((req: Request, res: Response, next: NextFunction) => {
  // Not Found
  return res.status(404).json({
    msg: "No resource found."
  })
})

export default router
