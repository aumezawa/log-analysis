import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDOMServer from "react-dom/server"

import * as jwt from "jsonwebtoken"

import IndexPage from "../page/index-page"

const router: Router = express.Router()

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage, { page: "login" }))
  )
})

router.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token || req.body.token || req.header("X-Access-Token")
  if (!token) {
    // Unauthorized
    return res.redirect("/login")
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

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage))
  )
})

export default router
