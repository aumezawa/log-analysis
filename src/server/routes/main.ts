import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDomServer from "react-dom/server"

import IndexPage from "../pages/index-page"

const router: Router = express.Router()

router.route("/log/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)/files/*")
.get((req: Request, res: Response, next: NextFunction) => {
  let query = `?domain=${ req.params.domain }&project=${ req.params.projectName }&bundle=${ req.params.bundleId }&filepath=${ req.params[0] }`
  if (req.query.line) {
    query = `${ query }&line=${ req.query.line }`
  }
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "main", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/log/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)/bundles/:bundleId([0-9]+)")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }&project=${ req.params.projectName }&bundle=${ req.params.bundleId }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "main", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/log/:domain(private|public)/projects/:projectName([0-9a-zA-Z_.#]+)")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }&project=${ req.params.projectName }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "main", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

router.route("/log/:domain(private|public)")
.get((req: Request, res: Response, next: NextFunction) => {
  const query = `?domain=${ req.params.domain }`
  return res.status(200).send(
    ReactDomServer.renderToString(React.createElement(IndexPage, { user: req.token.usr, page: "main", query: query }))
  )
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method is only supported."
  })
})

export default router
