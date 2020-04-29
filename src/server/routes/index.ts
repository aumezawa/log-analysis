import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as React from "react"
import * as ReactDOMServer from "react-dom/server"

import IndexPage from "../page/index-page"

const router: Router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.send(
    ReactDOMServer.renderToString(React.createElement(IndexPage))
  )
})

export default router
