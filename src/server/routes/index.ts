import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDomServer from "react-dom/server"

import * as jwt from "jsonwebtoken"

import IndexPage from "../pages/index-page"

import mainRouter from "./main"
import cmdsRouter from "./cmds"

const router: Router = express.Router()

router.route("/login")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { page: "login" }))
  )
})

router.route("/error")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { page: "error" }))
  )
})

router.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token || req.body.token || req.header("X-Access-Token") || req.cookies.token
  if (!token) {
    // Unauthorized
    return res.redirect(`/login?${ (req.query.anonymous) ? "anonymous=true&" : "" }request=${ encodeURIComponent(req.url.replace("?anonymous=true", "").replace("&anonymous=true", "")) }`)
  }

  jwt.verify(token, req.app.get("token-key"), (err: jwt.VerifyErrors, decoded: object) => {
    if (err) {
      // Unauthorized
      return res.redirect(`/error?type=token&msg=${ err.message }&request=${ encodeURIComponent(req.url) }`)
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

router.route("/")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "main" }))
  )
})

router.use("/main", mainRouter)

router.use("/cmds", cmdsRouter)

router.route("/hello")
.get((req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "hello" }))
  )
})

router.route("*")
.all((req: Request, res: Response, next: NextFunction) => {
  // Not Found
  return res.redirect(`/error?type=page&msg=${ "no page" }`)
})

export default router
