import * as http from "http"
import * as nodepty from "node-pty"
import * as os from "os"
import * as socketio from "socket.io"

const shell = os.platform() === "win32" ? "powershell.exe"  : "bash"
const opt   = os.platform() === "win32" ? []                : ["-c"]

const terminal = (server: http.Server) => {
  const io = socketio(server, { path: "/terminal" })

  io.on("connection", (socket: SocketIO.Socket) => {
    const cmd = socket.handshake.query.cmd ? [...opt, decodeURI(socket.handshake.query.cmd)] : []
    const pty = nodepty.spawn(shell, cmd, {
      name: "xterm-color",
      cols: Number(socket.handshake.query.cols || 80),
      rows: Number(socket.handshake.query.rows || 24),
    })

    socket.on("request", (data: string) => {
      pty.write(data)
    })

    socket.on("disconnect", () => {
      pty.kill()
    })

    pty.on("data", (data: string) => {
      socket.emit("response", data)
    })

    pty.on("exit", (exitCode: number) => {
      socket.disconnect()
    })
  })
}

export = terminal
