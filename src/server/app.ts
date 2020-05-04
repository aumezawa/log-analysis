import * as express from "express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as path from "path"
import * as helmet from "helmet"
import * as log4js from "log4js"

import logger = require("./lib/logger")

import indexRouter from "./routes/index"
import apiV1Router from "./routes/api-v1"

const app: express.Express = express()
const rootpath: string = process.cwd()

app.set("http-port", Number(process.env.npm_package_config_http_port))
app.set("https-port", Number(process.env.npm_package_config_https_port))
app.set("num-workers", Number(process.env.npm_package_config_num_workers))
app.set("token-key", process.env.npm_package_name)
app.set("token-period", process.env.npm_package_config_token_period)

app.use(log4js.connectLogger(logger, {
  level: "auto",
  format: (req: any, res: any, formatter: ((str: string) => string)) => (
    formatter(`${ req.protocol.toUpperCase() }/:http-version :method :status [${ (req.token && req.token.usr) || "unknown" } (:remote-addr)] :url - :user-agent - :response-time ms`)
  )
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

app.use("/public", express.static(path.join(rootpath, "public")))
app.use("/api/v1", apiV1Router)
app.use("/", indexRouter)

export = app
