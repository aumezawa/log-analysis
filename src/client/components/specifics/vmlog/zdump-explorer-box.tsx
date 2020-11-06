import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Display, FileEarmarkMedical } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import FileTreeRoot from "../../../components/sets/file-tree-root"
import DropdownItem from "../../../components/parts/dropdown-item"

type ZdumpExplorerBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  onSelect? : (value: string) => void
}

const ZdumpExplorerBox = React.memo<ZdumpExplorerBoxProps>(({
  className = "",
  domain    = null,
  project   = null,
  bundle    = null,
  onSelect  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const zdumps = useRef({
    name: "No zdump file",
    file: false,
    children: []
  })

  useEffect(() => {
    zdumps.current.name = "No zdump file"
    zdumps.current.children = []
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/zdumps`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (res.data.zdumps.length > 0) {
          zdumps.current.name = "zdump files"
          zdumps.current.children = res.data.zdumps.map((vm: string) => ({ name: vm, file: true }))
        }
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      forceUpdate()
    }
  }, [domain, project, bundle])

  const handleClickSelect = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect(parentValue.slice(1))  // NOTE: removed leading character '/'
    }
  }, [onSelect])

  return (
    <div className={ `${ className } text-left text-monospace` }>
      <FileTreeRoot
        root={ zdumps.current }
        LIcon={ FileEarmarkMedical }
        actions={ [
          <DropdownItem
            key="open"
            label="open"
            LIcon={ Display }
            onClick={ handleClickSelect }
          />
        ] }
      />
    </div>
  )
})

export default ZdumpExplorerBox
