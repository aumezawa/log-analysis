import * as React from "react"
import { useEffect } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
import * as Socketio from "socket.io-client"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

type TerminalBoxProps = {
  app       : "term",
  path?     : string,
  disabled? : boolean
}

const TerminalBox = React.memo<TerminalBoxProps>(({
  app       = null,
  path      = null,
  disabled  = true
}) => {
  const ref = React.createRef<HTMLDivElement>()

  useEffect(() => {
    const terminal = new Terminal({ cursorBlink: true, cursorStyle: "underline" })
    const fitAddon = new FitAddon()
    let socket: SocketIOClient.Socket = null

    if (path && !disabled) {
      const uri = `${ location.protocol }//${ location.host }/api/v1${ path }?mode=${ app }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        socket = Socketio(`?cmd=${ encodeURI(res.data.cmd) }&cols=${ terminal.cols }&rows=${ terminal.rows }`, { path: "/terminal" })

        terminal.loadAddon(fitAddon)
        terminal.open(ref.current)
        fitAddon.fit()

        terminal.onData((data: string) => {
          socket.emit("request", data)
        })

        socket.on("response", (data: string) => {
          terminal.write(data)
        })

        socket.on("disconnect", (reason: string) => {
        })
        return
      })
      .catch((err: AxiosError) => {
        alert(err.response.data.msg)
        return
      })
    }

    return () => {
      terminal.dispose()
      if (socket) {
        socket.disconnect()
      }
    }
  }, [app, path, disabled])

  return (
    <div ref={ ref } className="h-100"></div>
  )
})

export default TerminalBox
