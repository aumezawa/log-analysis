import * as express from "express"
import * as bodyParser from "body-parser"
import * as path from "path"
import * as helmet from "helmet"
import * as morgan from "morgan"
import * as rfs from "rotating-file-stream"

import indexRouter from "./routes/index"
import apiV1Router from "./routes/api-v1"

const app: express.Express = express()
const root: string = process.cwd()
const logfs: rfs.RotatingFileStream = rfs.createStream("access.log", {
  path: path.join(root, "local", "log"),
  size: "1G"
})

app.set("tokenKey", process.env.npm_package_name)

morgan.token("user", (req: express.Request, res: express.Response) => ((req.token && req.token.usr) || "unknown"))
morgan.token("protocol", (req: express.Request, res: express.Response) => (req.protocol.toUpperCase()))
app.use(morgan(":date[iso] :user :remote-addr :protocol/:http-version :method :url :status - :user-agent - :response-time ms", { stream: logfs }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())

app.use("/", indexRouter)
app.use("/", express.static(path.join(root, "public")))

app.use("/api/v1", apiV1Router)

export = app
