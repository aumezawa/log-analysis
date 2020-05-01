import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as crypto from "crypto"
import * as fs from "fs"
import * as jwt from "jsonwebtoken"
import * as path from "path"

const rootpath: string = process.cwd()
const ulpath: string = path.join(rootpath, "local", "userlist.json")

const router: Router = express.Router()

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  /*if (req.protocol !== "https") {
    // Forbidden
    return res.status(403).json({
      msg: "use https protocol for authentication."
    })
  }*/

  if (!req.body.username || !req.body.password) {
    // Bad Request
    return res.status(400).json({
      msg: "username and password are required."
    })
  }

  const username: string = req.body.username
  const password: string = req.body.password

  let userlist: LocalUserList = []
  try {
    userlist = JSON.parse(fs.readFileSync(ulpath, "utf8"))
  } catch {
    // Internal Server Error
    return res.status(500).json({
      msg: "contact an administrator."
    })
  }

  const userinfo: LocalUserInfo = userlist.find((userinfo: LocalUserInfo) => (
    (username === userinfo.username && crypto.createHash("sha256").update(username + password, "utf8").digest("hex") === userinfo.password)
  ))

  if (!userinfo) {
    // Unauthorized
    return res.status(401).json({
      msg: "username or password is incorrect."
    })
  }

  // OK
  const token = jwt.sign({
    iss: process.env.npm_package_author_name,
    sub: "token-" + process.env.npm_package_name,
    usr: userinfo.username,
    prv: userinfo.privilege
  }, req.app.get("tokenKey"), { expiresIn: "1h" })
  return res.status(200).json({
    msg: "authentication successfully.",
    token: token
  })
})

router.all("/login", (req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "POST method is only supported."
  })
})


router.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token || req.body.token || req.header("X-Access-Token")
  if (!token) {
    // Unauthorized
    return res.status(401).json({
      msg: "access token is required."
    })
  }

  jwt.verify(token, req.app.get("tokenKey"), (err: jwt.VerifyErrors, decoded: object) => {
    if (err) {
      // Unauthorized
      return res.status(401).json({
        msg: "access token is invalid."
      })
    }

    req.token = {
      iss: (decoded as any)["iss"],
      sub: (decoded as any)["sub"],
      iat: (decoded as any)["iat"],
      exp: (decoded as any)["exp"],
      usr: (decoded as any)["usr"],
      prv: (decoded as any)["prv"]
    }
    return next()
  })

  return
})

router.get("/hello", (req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: `Hello ${ req.token.usr }!`
  })
})

router.all("*", (req: Request, res: Response, next: NextFunction) => {
  // Not Found
  return res.status(404).json({
    msg: "No resource found."
  })
})

export default router