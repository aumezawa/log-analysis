import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDOMServer from "react-dom/server"

import * as jwt from "jsonwebtoken"

import IndexPage from "../page/index-page"

const router: Router = express.Router()

router.route("/login")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage, { page: "login" }))
  )
})

router.route("/error")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage, { page: "error" }))
  )
})

router.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token || req.body.token || req.header("X-Access-Token") || req.cookies.token
  if (!token) {
    // Unauthorized
    return res.redirect("/login")
  }

  jwt.verify(token, req.app.get("token-key"), (err: jwt.VerifyErrors, decoded: object) => {
    if (err) {
      // Unauthorized
      return res.redirect(`/error?type=token&msg=${ err.message }`)
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

router.route("/")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "main" }))
  )
})

router.route("/hello")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDOMServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "hello" }))
  )
})

router.route("*")
.all((req: Request, res: Response, next: NextFunction) => {
  // Not Found
  return res.redirect(`/error?type=page&msg=${ "no page" }`)
})

export default router
