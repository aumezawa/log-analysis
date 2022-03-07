import * as express from "express"
import { Router } from "express"

import logRouter from "./main-log"
import statsRouter from "./main-stats"

const router: Router = express.Router()

router.use("/log", logRouter)
router.use("/stats", statsRouter)

export default router
