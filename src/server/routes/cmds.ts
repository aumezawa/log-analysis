import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as fs from "fs"
import * as path from "path"

import logger = require("../lib/logger")

const rootPath: string = process.cwd()

const router: Router = express.Router()

router.route("/makeProject")
.get((req: Request, res: Response, next: NextFunction) => {
  let resPath: string
  let domainPath: string
  let projectPath: string

  if (req.app.get("storage-path").slice(0, 1) === "/" || req.app.get("storage-path").slice(1, 3) === ":\\") {
    resPath = req.app.get("storage-path")
  } else {
    resPath = path.join(rootPath, req.app.get("storage-path"))
  }

  if (!req.query.domain || typeof(req.query.domain) !== "string" || !req.app.get("domains").split(",").includes(req.query.domain)) {
    return res.redirect(`/error?type=command&msg=${ "invalid domain" }`)
  }

  domainPath = path.join(resPath, (req.query.domain === "private") ? req.token.usr : req.query.domain)

  if (!req.query.project || typeof(req.query.project) !== "string" || !req.query.project.match(/^[0-9a-zA-Z#@_+-]+$/)) {
    return res.redirect(`/error?type=command&msg=${ "no valid project defined" }`)
  }

  projectPath = path.join(domainPath, req.query.project)

  if (!fs.existsSync(projectPath)) {
    try {
      fs.mkdirSync(projectPath)
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.redirect(`/error?type=command&msg=${ "contact an administrator" }`)
    }

    try {
      fs.writeFileSync(path.join(projectPath, "project.inf"), JSON.stringify({
        name: req.query.project,
        status: "open",
        description: (req.query.description && typeof(req.query.description) === "string" && decodeURI(req.query.description)) || "",
        index: 0,
        bundles: []
      }))
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`${ err.name }: ${ err.message }`)
      }
      // Internal Server Error
      return res.redirect(`/error?type=command&msg=${ "contact an administrator" }`)
    }
  }

  let projectInfo: ProjectInfo
  try {
    projectInfo = JSON.parse(fs.readFileSync(path.join(projectPath, "project.inf"), "utf8"))
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`${ err.name }: ${ err.message }`)
    }
    // Internal Server Error
    return res.redirect(`/error?type=command&msg=${ "contact an administrator" }`)
  }

  if (projectInfo.status !== "open") {
    return res.redirect(`/error?type=command&msg=${ "the project exists, but already closed" }`)
  }

  return res.redirect(`/main/log/${ req.query.domain }/projects/${ req.query.project }`)
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
  return res.redirect(`/error?type=command&msg=${ "invalid command" }`)
})

export default router
