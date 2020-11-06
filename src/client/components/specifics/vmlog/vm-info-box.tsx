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
  vm?       : string
}

const VmInfoBox = React.memo<VmInfoBoxProps>(({
  className = "px-2",
  domain    = null,
  project   = null,
  bundle    = null,
  vm        = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const vmInfo = useRef<VmInfo>(null)
  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle && vm) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ vm }`
      status.current.progress = true
      vmInfo.current = null
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        status.current.progress = false
        vmInfo.current = res.data.vm
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        status.current.progress = false
        vmInfo.current = null
        forceUpdate()
        return
      })
    } else {
      status.current.progress = false
      vmInfo.current = null
      forceUpdate()
    }
  }, [domain, project, bundle, vm])

  const render = () => {
    const tables: Array<JSX.Element> = []

    tables.push(
      <Table
        key="base"
        className="my-2"
        title="VM Base Information"
        LIcon={ Box }
        content={ [
          ["name",        `${ vmInfo.current.name }`],
          ["version",     `${ vmInfo.current.version }`],
          ["cpus",        `${ vmInfo.current.cpus }`],
          ["memory",      `${ vmInfo.current.memory } GB`],
          ["firmware",    `${ vmInfo.current.firmware }`],
          ["guest os",    `${ vmInfo.current.guest }`],
          ["power state", `${ vmInfo.current.state }`]
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
          ["uefi.secureBoot.enabled",                   `${ vmInfo.current.options.uefi_secureBoot_enabled }`],
          ["cpuid.coresPerSocket",                      `${ vmInfo.current.options.cpuid_coresPerSocket }`],
          ["numa.nodeAffinity",                         `${ vmInfo.current.options.numa_nodeAffinity }`],
          ["numa.vcpu.maxPerMachineNode",               `${ vmInfo.current.options.numa_vcpu_maxPerMachineNode }`],
          ["numa.vcpu.maxPerVirtualNode",               `${ vmInfo.current.options.numa_vcpu_maxPerVirtualNode }`],
          ["numa.autosize",                             `${ vmInfo.current.options.numa_autosize }`],
          ["sched.cpu.affinity",                        `${ vmInfo.current.options.sched_cpu_affinity }`],
          ["sched.cpu.latencySensitivity",              `${ vmInfo.current.options.sched_cpu_latencySensitivity }`],
          ["sched.cpu.min",                             `${ vmInfo.current.options.sched_cpu_min }`],
          ["latency.enforceCpuMin",                     `${ vmInfo.current.options.latency_enforceCpuMin }`],
          ["timeTracker.apparentTimeIgnoresInterrupts", `${ vmInfo.current.options.timeTracker_apparentTimeIgnoresInterrupts }`]
        ] }
      />
    )

    vmInfo.current.nics.map((nic: VirtualNicInfo) => (
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

    vmInfo.current.scsis.map((scsi: VirtualScsiInfo) => (
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

    vmInfo.current.disks.map((disk: VirtualDiskInfo) => (
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

    vmInfo.current.dpios.map((dpio: PassthruDeviceInfo) => (
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

    vmInfo.current.vfs.map((vf: VfNicInfo) => (
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
      { !status.current.progress &&  !vmInfo.current && <CenterText text="No Data" /> }
      { !status.current.progress && !!vmInfo.current && render() }
    </div>
  )
})

export default VmInfoBox
