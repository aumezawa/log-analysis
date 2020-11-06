import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Box, Display } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import FileTreeRoot from "../../../components/sets/file-tree-root"
import DropdownItem from "../../../components/parts/dropdown-item"

type VmExplorerBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  onSelect? : (value: string) => void
}

const VmExplorerBox = React.memo<VmExplorerBoxProps>(({
  className = "",
  domain    = null,
  project   = null,
  bundle    = null,
  onSelect  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const vms = useRef({
    name: "No VM inventory",
    file: false,
    children: []
  })

  useEffect(() => {
    vms.current.name = "No VM inventory"
    vms.current.children = []
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (res.data.vms.length > 0) {
          vms.current.name = "Virtual Machines"
          vms.current.children = res.data.vms.map((vm: string) => ({ name: vm, file: true }))
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
        root={ vms.current }
        LIcon={ Box }
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

export default VmExplorerBox
