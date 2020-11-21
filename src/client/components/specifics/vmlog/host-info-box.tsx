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
  bundle?   : string,
  hosts?    : string
}

const HostInfoBox = React.memo<HostInfoBoxProps>(({
  className = "px-2",
  domain    = null,
  project   = null,
  bundle    = null,
  hosts     = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    hosts   : []
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle && !hosts) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/hosts`
      data.current.hosts = []
      status.current.progress = true
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
        data.current.hosts = [res.data.host]
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.hosts = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else if (domain && project && hosts) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/hosts/${ hosts }`
      data.current.hosts = []
      status.current.progress = true
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.hosts = res.data.hosts
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.hosts = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else {
      data.current.hosts = []
      status.current.progress = false
      forceUpdate()
    }
  }, [domain, project, bundle, hosts])

  const render = () => {
    const tables: Array<JSX.Element> = []

    tables.push(
      <Table
        key="base"
        className="my-2"
        title="ESXi Base Information"
        LIcon={ HddStack }
        content={ [
          ["hostname"].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hostname }`)),
          ["version" ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.version }`)),
          ["build"   ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.build }`)),
          ["profile" ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.profile }`)),
          ["uptime"  ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.uptime } days`))
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
          ["power policy"                             ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.system.powerPolicy }`)),
          ["kernel param - pcipDisablePciErrReporting"].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.system.pcipDisablePciErrReporting }`)),
          ["kernel param - enableACPIPCIeHotplug"     ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.system.enableACPIPCIeHotplug }`))
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
          ["machine"            ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.machine }`)),
          ["serial number"      ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.serial }`)),
          ["cpu - model"        ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.cpu.model }`)),
          ["cpu - sockets"      ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.cpu.sockets }`)),
          ["cpu - total cores"  ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.cpu.cores }`)),
          ["cpu - total threads"].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.cpu.threads }`)),
          ["memory - total"     ].concat(data.current.hosts.map((hostInfo: HostInfo) => `${ hostInfo.hardware.memory } GB`))
        ] }
      />
    )

    if (data.current.hosts.length > 1) {
      return tables
    }

    tables.push(
      <Table
        key="card"
        className="my-2"
        title="PCI Card Information"
        LIcon={ Tags }
        content={
          data.current.hosts[0].hardware.cards.map((card: HostPciCardInfo) => (
            [`slot ${ card.slot }`, `[${ card.sbdf }] ${ card.device }`]
          ))
        }
      />
    )

    data.current.hosts[0].network.nics.map((nic: HostNicInfo) => (
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
    data.current.hosts[0].network.vswitches.map((vswitch: VirtualSwitchInfo) => (
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

    data.current.hosts[0].storage.hbas.map((hba: HostHbaInfo) => (
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
    data.current.hosts[0].storage.disks.map((disk: HostDiskInfo) => (
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
          data.current.hosts[0].packages.map((vib: HostPackageInfo) => (
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
      { !status.current.progress &&  !data.current.hosts.length && <CenterText text="No Data" /> }
      { !status.current.progress && !!data.current.hosts.length && render() }
    </div>
  )
})

export default HostInfoBox
