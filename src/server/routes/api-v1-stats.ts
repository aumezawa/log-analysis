import * as express from "express"
import { Router, Request, Response, NextFunction } from "express"

import * as multer from "multer"

import logger = require("../lib/logger")

import * as Project from "../lib/project"

const router: Router = express.Router()

/* -------------------------------------------------------------------------- */

router.param("domain", (req: Request, res: Response, next: NextFunction, domain: string) => {
  req.domain = decodeURIComponent(domain)

  if (req.token.usr === "anonymous" && req.domain !== "public") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.createDomainResource(req.token.usr, req.domain)
  .catch(() => {
    return
  })
  .then(() => {
    return Project.validateDomainResource(req.token.usr, req.domain)
  })
  .then(() => {
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

router.param("projectName", (req: Request, res: Response, next: NextFunction, projectName: string) => {
  req.project = decodeURIComponent(projectName)

  return Project.validateProjectResource(req.token.usr, req.domain, req.project)
  .then(() => {
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

router.param("statsId", (req: Request, res: Response, next: NextFunction, statsId: string) => {
  req.statsId = decodeURIComponent(statsId)

  return Project.validateStatsResource(req.token.usr, req.domain, req.project, req.statsId)
  .then(() => {
    return Project.getStatsInfo(req.token.usr, req.domain, req.project, req.statsId)
  })
  .then((statsInfo: StatsInfo) => {
    req.statsName = statsInfo.name
    return next()
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})

router.param("counter", (req: Request, res: Response, next: NextFunction, counter: string) => {
  req.counter = counter
  next()
})

/* -------------------------------------------------------------------------- */

router.route("/:domain/projects/:projectName/stats/:statsId/counters/:counter")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getStatsCounterData(req.token.usr, req.domain, req.project, req.statsId, req.counter)
  .then((data: any) => {
    // OK
    return res.status(200).json({
      msg: `You get stats counter data of stats ID = ${ req.statsId }, counters = ${ req.counter }.`,
      data: data
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})

router.route("/:domain/projects/:projectName/stats/:statsId/counters")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getStatsCounters(req.token.usr, req.domain, req.project, req.statsId)
  .then((counters: any) => {
    // OK
    return res.status(200).json({
      msg: `You get stats counters of stats ID = ${ req.statsId }.`,
      counters: counters
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})

router.route("/:domain/projects/:projectName/stats/:statsId")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getStatsInfo(req.token.usr, req.domain, req.project, req.statsId)
  .then((statsInfo: StatsInfo) => {
    // OK
    return res.status(200).json({
      msg: `You get a stats name and description of stats ID = ${ req.statsId }.`,
      name: statsInfo.name,
      description: statsInfo.description,
      type: statsInfo.type
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  const statsDescription = req.body.description

  if (!statsDescription) {
    // Bad Request
    return res.status(400).json({
      msg: "Stats description is required. (param name: description)"
    })
  }

  return Project.updateStatsDescription(req.token.usr, req.domain, req.project, req.statsId, statsDescription)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `stats: stats ID=${ req.statsId } description was updated successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(403).json({
      msg: `stats: ${ req.statsName } is only deleted by an administrator.`
    })
  }

  return Project.deleteStatsResource(req.token.usr, req.domain, req.project, req.statsId)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `stats: stats ID = ${ req.statsId } was deleted successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})


router.route("/:domain/projects/:projectName/stats")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getStatsResourceList(req.token.usr, req.domain, req.project)
  .then((list: Array<StatsInfo>) => {
    // OK
    return res.status(200).json({
      msg: `You get a stats list of project ${ req.project }.`,
      stats: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  return multer({
    storage: multer.diskStorage({
      destination : (req, file, cb) => cb(null, Project.getProjectResourcePathSync(req.token.usr, req.domain, req.project)),
      filename    : (req, file, cb) => cb(null, file.originalname)
    })
  }).single("stats")(req, res, (err: any) => {
    if (err) {
      (err instanceof Error) && logger.error(`${ err.name }: ${ err.message }`)
      // Bad Request
      return res.status(500).json({
        msg: "Contact an administrator."
      })
    }

    if (!req.file) {
      // Bad Request
      return res.status(400).json({
        msg: "stats is required. (param name: stats)"
      })
    }

    return Project.registerStatsResource(req.token.usr, req.domain, req.project, req.file.originalname, req.body.description || "")
    .then((statsInfo: StatsInfo) => {
      // Created
      return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/`).json({
        msg : `stats: ${ req.file.originalname } was uploaded and successfully.`,
        id  : statsInfo.id,
        name: statsInfo.name,
        type: statsInfo.type
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})


router.route("/:domain/projects/:projectName")
.get((req: Request, res: Response, next: NextFunction) => {
  return Project.getProjectInfo(req.token.usr, req.domain, req.project)
  .then((projectInfo: ProjectInfo) => {
    // OK
    return res.status(200).json({
      msg: "You get a project status and description.",
      status: projectInfo.status,
      description: projectInfo.description
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.put((req: Request, res: Response, next: NextFunction) => {
  const projectDescription = req.body.description
  const projectStatus = req.body.status

  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  if (projectStatus) {
    return Project.updateProjectStatus(req.token.usr, req.domain, req.project, projectStatus)
    .then(() => {
      // OK
      return res.status(200).json({
        msg: `project: ${ req.project } status was updated successfully.`
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  } else if (projectDescription) {
    return Project.updateProjectDescription(req.token.usr, req.domain, req.project, projectDescription)
    .then(() => {
      // OK
      return res.status(200).json({
        msg: `project: ${ req.project } description was updated successfully.`
      })
    })
    .catch((err: any) => {
      return ((err instanceof Error) && (err.name === "External"))
        ? // Bad Request
          res.status(400).json({ msg: err.message })
        : // Internal Server Error
          res.status(500).json({ msg: "Contact an administrator." })
    })
  } else {
    // Bad Request
    return res.status(400).json({
      msg: "Project status or description is required. (param name: status, description)"
    })
  }
})
.delete((req: Request, res: Response, next: NextFunction) => {
  if (!["public", "private"].includes(req.domain) && req.token.prv !== "root") {
    // Bad Request
    return res.status(403).json({
      msg: `project: ${ req.project } is only deleted by an administrator.`
    })
  }

  return Project.deleteProjectResource(req.token.usr, req.domain, req.project)
  .then(() => {
    // OK
    return res.status(200).json({
      msg: `project: ${ req.project } was deleted successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/PUT/DELETE method are only supported."
  })
})


router.route("/:domain/projects")
.get((req: Request, res: Response, next: NextFunction) => {
  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.getProjectResourceList(req.token.usr, req.domain)
  .then((list: Array<ProjectInfo>) => {
    // OK
    return res.status(200).json({
      msg: "You get a project list.",
      projects: list
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.post((req: Request, res: Response, next: NextFunction) => {
  const projectName = req.body.name
  const projectDesc = req.body.description || ""

  if (!projectName) {
    // Bad Request
    return res.status(400).json({
      msg: "Project name is required. (param name: name)"
    })
  }

  if (req.token.usr === "anonymous") {
    // Forbidden
    return res.status(403).json({ msg: "Not be permitted to access." })
  }

  return Project.createProjectResource(req.token.usr, req.domain, projectName, projectDesc)
  .then(() => {
    // Created
    return res.status(201).location(`${ req.protocol }://${ req.headers.host }${ req.path }/${ projectName }`).json({
      msg: `project: ${ projectName } was created successfully.`
    })
  })
  .catch((err: any) => {
    return ((err instanceof Error) && (err.name === "External"))
      ? // Bad Request
        res.status(400).json({ msg: err.message })
      : // Internal Server Error
        res.status(500).json({ msg: "Contact an administrator." })
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET/POST method are only supported."
  })
})


router.route("/:domain")
.get((req: Request, res: Response, next: NextFunction) => {
  // OK
  return res.status(200).json({
    msg: `domain: ${ req.domain } is available.`
  })
})
.all((req: Request, res: Response, next: NextFunction) => {
  // Method Not Allowed
  return res.status(405).json({
    msg: "GET method are only supported."
  })
})


export default router
