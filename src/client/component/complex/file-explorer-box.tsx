import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import FileTreeRoot from "../set/file-tree-root"

type FileExplorerBoxProps = {
  className?: string,
  path?     : string
}

const FileExplorerBox = React.memo<FileExplorerBoxProps>(({
  className = "",
  path      = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const fileTree = useRef({
    name: "",
    file: false,
    children: []
  })

  useEffect(() => {
    if (path) {
      const uri = `${ location.protocol }//${ location.host }/api/v1${ path }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        fileTree.current = res.data.files
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        return
      })
    } else {
      fileTree.current = {
        name: "",
        file: false,
        children: []
      }
      forceUpdate()
    }
  }, [path])

  return (
    <div className={ `${ className } text-left text-monospace` }>
      <FileTreeRoot
        root={ fileTree.current }
      />
    </div>
  )
})

export default FileExplorerBox
