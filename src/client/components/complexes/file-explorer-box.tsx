import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import FileTreeRoot from "../sets/file-tree-root"
import DropdownItem from "../parts/dropdown-item"

import Escape from "../../lib/escape"

type FileExplorerBoxProps = {
  className?: string,
  path?     : string,
  onSelect? : (action: string, value: string) => void
}

const FileExplorerBox = React.memo<FileExplorerBoxProps>(({
  className = "",
  path      = null,
  onSelect  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const files = useRef({
    name: "",
    file: false,
    children: []
  })

  useEffect(() => {
    if (path) {
      const uri = `${ location.protocol }//${ location.host }/api/v1/${ Escape.root(path) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        files.current = res.data.files
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        files.current = {
          name: "",
          file: false,
          children: []
        }
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      files.current = {
        name: "",
        file: false,
        children: []
      }
      forceUpdate()
    }
  }, [path])

  const handleClickView = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("view", Escape.root(parentValue))
    }
  }, [onSelect])

  const handleClickTerminal = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("terminal", Escape.root(parentValue))
    }
  }, [onSelect])

  const handleClickDownload = useCallback((targetValue: string, parentValue: string) => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/${ Escape.root(path) }/${ Escape.root(parentValue) }?mode=download`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {},
      responseType: "blob"
    })
    .then((res: AxiosResponse) => {
      const blob = new Blob([res.data], { type: res.data.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      let filename: string
      const match = res.headers["content-disposition"].match(/filename="(.*)"(;|$)/)
      if (match) {
        filename = match[1]
        const matchUTF8 = res.headers["content-disposition"].match(/filename[*]=UTF-8''(.*)(;|$)/)
        if (matchUTF8) {
          filename = decodeURIComponent(matchUTF8[1])
        }
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [path])

  return (
    <div className={ `${ className } text-left text-monospace` }>
      <FileTreeRoot
        root={ files.current }
        actions={ [
          <DropdownItem
            key="view"
            label="view"
            onClick={ handleClickView }
          />,
          <DropdownItem
            key="terminal"
            label="legacy view"
            onClick={ handleClickTerminal }
          />,
          <DropdownItem
            key="download"
            label="download"
            onClick={ handleClickDownload }
          />
        ] }
      />
    </div>
  )
})

export default FileExplorerBox
