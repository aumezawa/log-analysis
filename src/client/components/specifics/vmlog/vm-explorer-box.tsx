import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Box, Gear, Display } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import ModalFrame from "../../../components/frames/modal-frame"
import ListForm from "../../../components/parts/list-form"
import ButtonSet from "../../../components/sets/button-set"
import FileTreeRoot from "../../../components/sets/file-tree-root"
import DropdownItem from "../../../components/parts/dropdown-item"

import UniqueId from "../../../lib/unique-id"

type VmExplorerBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  onSelect? : (action: string, value: string) => void
}

const VmExplorerBox = React.memo<VmExplorerBoxProps>(({
  className = "",
  domain    = "",
  project   = "",
  bundle    = "",
  onSelect  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    list: useRef({} as ListFormReference)
  })

  const id = useRef({
    logs: "modal-" + UniqueId()
  })

  const data = useRef({
    vms : {
      name: "No VM inventory",
      file: false,
      children: []
    },
    vm  : "",
    logs: [],
    log : ""
  })

  useEffect(() => {
    data.current.vms.name = "No VM inventory"
    data.current.vms.file = false
    data.current.vms.children = []
    data.current.vm = ""
    data.current.logs = []
    data.current.log = ""
    refs.current.list.current.clear()
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (res.data.vms.length > 0) {
          data.current.vms.name = "Virtual Machines"
          data.current.vms.children = res.data.vms.map((vm: string) => ({ name: vm, file: true }))
        }
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response!.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    } else {
      forceUpdate()
    }
  }, [domain, project, bundle])

  const handleClickSelectVmInfo = useCallback((targetValue: string, parentValue: string) => {
    const vmName = parentValue.slice(1)   // NOTE: removed leading character '/'
    if (onSelect) {
      onSelect("vminfo", vmName)
    }
  }, [onSelect])

  const handleClickSelectVmVmx = useCallback((targetValue: string, parentValue: string) => {
    const vmName = parentValue.slice(1)   // NOTE: removed leading character '/'
    data.current.vm = vmName
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ data.current.vm }/vmx`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      if (onSelect) {
        onSelect("vmx", res.data.vmxpath)
      }
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [domain, project, bundle, onSelect])

  const handleClickSelectVmLog = useCallback((targetValue: string, parentValue: string) => {
    const vmName = parentValue.slice(1)   // NOTE: removed leading character '/'
    data.current.vm = vmName
    data.current.logs = []
    data.current.log = ""
    refs.current.list.current.clear()
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ data.current.vm }/logs`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.logs = res.data.vmlogs
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      forceUpdate()
      return
    })
  }, [domain, project, bundle])

  const handleSelectVmLog = useCallback((value: string) => {
    data.current.log = value
    forceUpdate()
  }, [domain, project, bundle])

  const handleSubmit = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ data.current.vm }/logs/${ data.current.log }/path`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      if (onSelect) {
        onSelect("vmlog", res.data.vmlogpath)
      }
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [domain, project, bundle, onSelect])

  return (
    <div className={ `${ className } text-left text-monospace` }>
      <ModalFrame
        id={ id.current.logs }
        title={ `VM: ${ data.current.vm }` }
        message="Select a vmware[-<X>].log to open."
        body={
          <ListForm
            ref={ refs.current.list }
            labels={ data.current.logs }
            onChange={ handleSelectVmLog }
          />
        }
        foot={
          <ButtonSet
            submit="Open"
            cancel="Close"
            valid={ !!data.current.log }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <FileTreeRoot
        root={ data.current.vms }
        LIcon={ Box }
        actions={ [
          <DropdownItem
            key="info"
            label="show information"
            LIcon={ Box }
            onClick={ handleClickSelectVmInfo }
          />,
          <DropdownItem
            key="vmx"
            label="open vmx file"
            LIcon={ Gear }
            onClick={ handleClickSelectVmVmx }
          />,
          <DropdownItem
            key="log"
            label="open vmware.log"
            LIcon={ Display }
            toggle="modal"
            target={ id.current.logs }
            onClick={ handleClickSelectVmLog }
          />,
        ] }
      />
    </div>
  )
})

export default VmExplorerBox
