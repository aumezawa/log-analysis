import * as http from "http"
import * as nodepty from "node-pty"
import * as os from "os"

import logger = require("../lib/logger")

const shell = os.platform() === "win32" ? "powershell.exe"  : "bash"
const opt   = os.platform() === "win32" ? []                : ["-c"]

const terminal = (server: http.Server) => {
  const io = require("socket.io")(server, { path: "/terminal" })

  io.on("connection", (socket: any) => {
    const cmd = socket.handshake.query.cmd ? [...opt, decodeURIComponent(socket.handshake.query.cmd)] : []
    const pty = nodepty.spawn(shell, cmd, {
      name: "xterm-color",
      cols: Number(socket.handshake.query.cols || 80),
      rows: Number(socket.handshake.query.rows || 24),
    })

    logger.info(`terminal opened: ${ cmd }`)
    socket.on("request", (data: string) => {
      pty.write(data)
    })

    socket.on("disconnect", () => {
      logger.info(`terminal disconnected: ${ cmd }`)
      pty.kill()
    })

    pty.on("data", (data: string) => {
      socket.emit("response", data)
    })

    pty.on("exit", (exitCode: number) => {
      logger.info(`terminal closed: ${ cmd }, code=${ exitCode }`)
      socket.disconnect()
    })
  })
}

export = terminal
