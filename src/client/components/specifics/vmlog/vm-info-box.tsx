import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import { Box, Diagram3, Gear, Server } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import Table from "../../../components/parts/table"
import CenterText from "../../../components/parts/center-text"
import Spinner from "../../../components/parts/spinner"

type VmInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  vmname?   : string,
  vms?      : string
}

const VmInfoBox = React.memo<VmInfoBoxProps>(({
  className = "px-2",
  domain    = null,
  project   = null,
  bundle    = null,
  vmname    = null,
  vms       = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    vms     : []
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle && vmname && !vms) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ vmname }`
      data.current.vms = []
      status.current.progress = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.vms = [res.data.vm]
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.vms = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else if (domain && project && vms) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/vms/${ vms }`
      data.current.vms = []
      status.current.progress = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.vms = res.data.vms
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.vms = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else {
      data.current.vms = []
      status.current.progress = false
      forceUpdate()
    }
  }, [domain, project, bundle, vmname, vms])

  const render = () => {
    const tables: Array<JSX.Element> = []

    tables.push(
      <Table
        key="base"
        className="my-2"
        title="VM Base Information"
        LIcon={ Box }
        content={ [
          ["name"       ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.name }`)),
          ["version"    ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.version }`)),
          ["cpus"       ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.cpus }`)),
          ["memory"     ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.memory } GB`)),
          ["firmware"   ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.firmware }`)),
          ["guest os"   ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.guest }`)),
          ["power state"].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.state }`))
        ] }
      />
    )

    tables.push(
      <Table
        key="options"
        className="my-2"
        title="VM Options"
        LIcon={ Gear }
        content={ [
          ["uefi.secureBoot.enabled"                  ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.uefi_secureBoot_enabled }`)),
          ["cpuid.coresPerSocket"                     ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.cpuid_coresPerSocket }`)),
          ["numa.nodeAffinity"                        ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_nodeAffinity }`)),
          ["numa.vcpu.maxPerMachineNode"              ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_vcpu_maxPerMachineNode }`)),
          ["numa.vcpu.maxPerVirtualNode"              ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_vcpu_maxPerVirtualNode }`)),
          ["numa.autosize"                            ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_autosize }`)),
          ["sched.cpu.affinity"                       ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_affinity }`)),
          ["sched.cpu.latencySensitivity"             ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_latencySensitivity }`)),
          ["sched.cpu.min"                            ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_min }`)),
          ["latency.enforceCpuMin"                    ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.latency_enforceCpuMin }`)),
          ["timeTracker.apparentTimeIgnoresInterrupts"].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.timeTracker_apparentTimeIgnoresInterrupts }`))
        ] }
      />
    )

    if (data.current.vms.length > 1) {
      return tables
    }

    data.current.vms[0].nics.map((nic: VirtualNicInfo) => (
      tables.push(
        <Table
          key={ `${ nic.name }` }
          className="my-2"
          title={ `vNIC Information - ${ nic.name }` }
          LIcon={ Diagram3 }
          content={ [
            ["device",    `${ nic.device }`],
            ["present",   `${ nic.present }`],
            ["slot",      `${ nic.slot }`],
            ["mac",       `${ nic.mac }`],
            ["portgroup", `${ nic.portgroup }`]
          ] }
        />
      )
    ))

    data.current.vms[0].scsis.map((scsi: VirtualScsiInfo) => (
      tables.push(
        <Table
          key={ `${ scsi.name }` }
          className="my-2"
          title={ `vSCSI Information - ${ scsi.name }` }
          LIcon={ Server }
          content={ [
            ["device",    `${ scsi.device }`],
            ["present",   `${ scsi.present }`],
            ["slot",      `${ scsi.slot }`]
          ] }
        />
      )
    ))

    data.current.vms[0].disks.map((disk: VirtualDiskInfo) => (
      tables.push(
        <Table
          key={ `${ disk.name }` }
          className="my-2"
          title={ `vDisk Information - ${ disk.name }` }
          LIcon={ Server }
          content={ [
            ["device",                  `${ disk.device }`],
            ["size",                    `${ disk.size } GB`],
            ["present",                 `${ disk.present }`],
            ["mode",                    `${ disk.mode }`],
            ["physical disk (if rdm)",  `${ disk.pdisk }`]
          ] }
        />
      )
    ))

    data.current.vms[0].dpios.map((dpio: PassthruDeviceInfo) => (
      tables.push(
        <Table
          key={ `${ dpio.name }` }
          className="my-2"
          title={ `DPIO Information - ${ dpio.name }` }
          LIcon={ Server }
          content={ [
            ["present",   `${ dpio.present }`],
            ["slot",      `${ dpio.slot }`],
            ["id",        `${ dpio.id }`]
          ] }
        />
      )
    ))

    data.current.vms[0].vfs.map((vf: VfNicInfo) => (
      tables.push(
        <Table
          key={ `${ vf.name }` }
          className="my-2"
          title={ `SR-IOV VF Information - ${ vf.name }` }
          LIcon={ Diagram3 }
          content={ [
            ["present",   `${ vf.present }`],
            ["slot",      `${ vf.slot }`],
            ["id",        `${ vf.id }`],
            ["pfid",      `${ vf.pfid }`],
            ["mac",       `${ vf.mac }`],
            ["portgroup", `${ vf.portgroup }`]
          ] }
        />
      )
    ))

    return tables
  }

  return (
    <div className={ className }>
      {  status.current.progress &&   <Spinner /> }
      { !status.current.progress &&  !data.current.vms.length && <CenterText text="No Data" /> }
      { !status.current.progress && !!data.current.vms.length && render() }
    </div>
  )
})

export default VmInfoBox
