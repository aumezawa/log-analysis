import * as React from "react"
import { useEffect, useRef, useCallback } from "react"
import useResizeObserver from "../../lib/useResizeObserver"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

type TerminalBoxProps = {
  app       : "term",
  path?     : string,
  disabled? : boolean,
  focus?    : boolean,
  reload?   : number
}

const TerminalBox = React.memo<TerminalBoxProps>(({
  app       = null,
  path      = null,
  disabled  = true,
  focus     = false,
  reload    = null
}) => {
  const ref = React.createRef<HTMLDivElement>()

  const data = useRef({
    terminal: null,
    fitAddon: null,
    socket  : null
  })

  useEffect(() => {
    const terminal = data.current.terminal = new Terminal({ cursorBlink: true, cursorStyle: "underline" })
    const fitAddon = data.current.fitAddon = new FitAddon()
    let socket: SocketIOClient.Socket = null

    if (path && !disabled) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?mode=${ app }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        terminal.loadAddon(fitAddon)
        terminal.open(ref.current)
        fitAddon.fit()

        socket = data.current.socket = require("socket.io-client")(`?cmd=${ encodeURIComponent(res.data.cmd) }&cols=${ terminal.cols }&rows=${ terminal.rows }`, { path: "/terminal" })

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
      .catch((err: Error | AxiosError) => {
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    }

    return () => {
      terminal.dispose()
      if (socket) {
        socket.disconnect()
      }
    }
  }, [app, path, disabled, reload])

  useResizeObserver(ref, () => {
    const terminal = data.current.terminal
    const fitAddon = data.current.fitAddon
    const socket = data.current.socket

    if (focus) {
      fitAddon.fit()
      if (socket) {
        socket.emit("resize", [`${ terminal.cols }`, `${ terminal.rows }`])
      }
    }
  }, [focus])

  return (
    <div ref={ ref } className="h-100"></div>
  )
})

export default TerminalBox
