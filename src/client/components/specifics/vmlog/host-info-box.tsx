import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import { Cpu, Diagram3, Gear, Grid3x3Gap, HddStack, Server, Tags } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import Table from "../../../components/parts/table"
import CenterText from "../../../components/parts/center-text"
import Spinner from "../../../components/parts/spinner"

type HostInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string
}

const HostInfoBox = React.memo<HostInfoBoxProps>(({
  className = "px-2",
  domain    = null,
  project   = null,
  bundle    = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const hostInfo = useRef<HostInfo>(null)
  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/hosts`
      status.current.progress = true
      hostInfo.current = null
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        const hostname = res.data.hosts[0]
        const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/hosts/${ hostname }`
        return Axios.get(uri, {
          headers : { "X-Access-Token": Cookie.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        status.current.progress = false
        hostInfo.current = res.data.host
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        status.current.progress = false
        hostInfo.current = null
        forceUpdate()
        return
      })
    } else {
      status.current.progress = false
      hostInfo.current = null
      forceUpdate()
    }
  }, [domain, project, bundle])

  const render = () => {
    const tables: Array<JSX.Element> = []

    tables.push(
      <Table
        key="base"
        className="my-2"
        title="ESXi Base Information"
        LIcon={ HddStack }
        content={ [
          ["hostname",  `${ hostInfo.current.hostname }`],
          ["version",   `${ hostInfo.current.version }`],
          ["build",     `${ hostInfo.current.build }`],
          ["profile",   `${ hostInfo.current.profile }`],
          ["uptime",    `${ hostInfo.current.uptime } days`]
        ] }
      />
    )

    tables.push(
      <Table
        key="system"
        className="my-2"
        LIcon={ Gear }
        title="ESXi System Information"
        content={ [
          ["power policy",                              `${ hostInfo.current.system.powerPolicy }`],
          ["kernel param - pcipDisablePciErrReporting", `${ hostInfo.current.system.pcipDisablePciErrReporting }`],
          ["kernel param - enableACPIPCIeHotplug",      `${ hostInfo.current.system.enableACPIPCIeHotplug }`]
        ] }
      />
    )

    tables.push(
      <Table
        key="hardware"
        className="my-2"
        title="Hardware Information"
        LIcon={ Cpu }
        content={ [
          ["machine",             `${ hostInfo.current.hardware.machine }`],
          ["serial number",       `${ hostInfo.current.hardware.serial }`],
          ["cpu - model",         `${ hostInfo.current.hardware.cpu.model }`],
          ["cpu - sockets",       `${ hostInfo.current.hardware.cpu.sockets }`],
          ["cpu - total cores",   `${ hostInfo.current.hardware.cpu.cores }`],
          ["cpu - total threads", `${ hostInfo.current.hardware.cpu.threads }`],
          ["memory - total",      `${ hostInfo.current.hardware.memory } GB`]
        ] }
      />
    )
    tables.push(
      <Table
        key="card"
        className="my-2"
        title="PCI Card Information"
        LIcon={ Tags }
        content={
          hostInfo.current.hardware.cards.map((card: HostPciCardInfo) => (
            [`slot ${ card.slot }`, `[${ card.sbdf }] ${ card.device }`]
          ))
        }
      />
    )

    hostInfo.current.network.nics.map((nic: HostNicInfo) => (
      tables.push(
        <Table
          key={ `${ nic.name }` }
          className="my-2"
          title={ `NIC Information - ${ nic.name }` }
          LIcon={ Diagram3 }
          content={ [
            ["speed",   `${ nic.speed } Mbps`],
            ["mtu",     `${ nic.mtu }`],
            ["linkup",  `${ nic.linkup }`],
            ["sbdf",    `${ nic.sbdf }`],
            ["device",  `${ nic.device }`],
            ["port",    `${ nic.port }`],
            ["mac",     `${ nic.mac }`],
            ["driver",  `${ nic.driver }`]
          ] }
        />
      )
    ))
    hostInfo.current.network.vswitches.map((vswitch: VirtualSwitchInfo) => (
      tables.push(
        <Table
          key={ `${ vswitch.name }` }
          className="my-2"
          LIcon={ Diagram3 }
          title={ `vSwitch Information - ${ vswitch.name }` }
          content={ [
            ["uplink",    `${ vswitch.uplinks.join(", ") }`],
            ["mtu",       `${ vswitch.mtu }`]
          ].concat(
            vswitch.portgroups.map((portgroup: PortgroupInfo) => (
              [`vlan - portgroup - ${ portgroup.name }`, `${ portgroup.vlan }`]
            ))
          ) }
        />
      )
    ))

    hostInfo.current.storage.hbas.map((hba: HostHbaInfo) => (
      tables.push(
        <Table
          key={ `${ hba.name }` }
          className="my-2"
          title={ `HBA Information - ${ hba.name }` }
          LIcon={ Server }
          content={ [
            ["sbdf",    `${ hba.sbdf }`],
            ["device",  `${ hba.device }`],
            ["port",    `${ hba.port }`],
            ["wwn",     `${ hba.wwn }`],
            ["driver",  `${ hba.driver }`]
          ] }
        />
      )
    ))
    hostInfo.current.storage.disks.map((disk: HostDiskInfo) => (
      tables.push(
        <Table
          key={ `${ disk.name }` }
          className="my-2"
          LIcon={ Server }
          title={ `Disk Information - ${ disk.name }` }
          content={ [
            ["alternate",   `${ disk.vml }`],
            ["storage",     `${ disk.storage }`],
            ["size",        `${ disk.size } GB`],
            ["hbas",        `${ disk.adapters.join(", ") }`],
            ["nmp - psp",   `${ disk.nmp_psp }`],
            ["nmp - satp",  `${ disk.nmp_satp }`]
          ] }
        />
      )
    ))

    tables.push(
      <Table
        key="package"
        className="my-2"
        title="Software Package Information"
        LIcon={ Grid3x3Gap }
        content={
          hostInfo.current.packages.map((vib: HostPackageInfo) => (
            [`${ vib.name }`, `${ vib.version }`]
          ))
        }
      />
    )

    return tables
  }

  return (
    <div className={ className }>
      {  status.current.progress &&   <Spinner /> }
      { !status.current.progress &&  !hostInfo.current && <CenterText text="No Data" /> }
      { !status.current.progress && !!hostInfo.current && render() }
    </div>
  )
})

export default HostInfoBox
