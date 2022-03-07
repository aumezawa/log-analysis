import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDomServer from "react-dom/server"

import IndexPage from "../pages/index-page"

const router: Router = express.Router()

router.route("/:domain/projects/:projectName/stats/:statsId/counters/:counter")
.get((req: Request, res: Response, next: NextFunction) => {
  let query = `?domain=${ req.params.domain }&project=${ req.params.projectName }&stats=${ req.params.statsId }&counter=${ encodeURIComponent(req.params.counter) }`
  if (req.query.date_from) {
    query = `${ query }&date_from=${ req.query.date_from }`
  }
  if (req.query.date_to) {
    query = `${ query }&date_to=${ req.query.date_to }`
  }
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "stats", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/:domain/projects/:projectName/stats/:statsId")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }&project=${ req.params.projectName }&stats=${ req.params.statsId }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "stats", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/:domain/projects/:projectName")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }&project=${ req.params.projectName }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "stats", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/:domain")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, alias: req.token.als, privilege: req.token.prv, domains: req.app.get("domains"), page: "stats", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

export default router
