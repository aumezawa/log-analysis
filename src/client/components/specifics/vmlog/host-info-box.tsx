import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

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
        content={ [
          ["hostname",  `${ hostInfo.current.hostname }`],
          ["version",   `${ hostInfo.current.version }`],
          ["build",     `${ hostInfo.current.build }`]
        ] }
      />
    )

    tables.push(
      <Table
        key="hardware"
        className="my-2"
        title="Hardware Information"
        content={ [
          ["machine",       `${ hostInfo.current.hardware.machine }`],
          ["cpu - sockets", `${ hostInfo.current.hardware.cpu.sockets }`],
          ["cpu - cores",   `${ hostInfo.current.hardware.cpu.cores }`],
          ["memory",        `${ hostInfo.current.hardware.memory } GB`]
        ] }
      />
    )
    tables.push(
      <Table
        key="card"
        className="my-2"
        title="PCI Card Information"
        content={
          hostInfo.current.hardware.cards.map((card: HostPciCardInfo) => (
            [`slot ${ card.slot }`, `${ card.device }`]
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
          content={ [
            ["speed",   `${ nic.speed } Mbps`],
            ["mtu",     `${ nic.mtu }`],
            ["linkup",  `${ nic.linkup }`],
            ["device",  `${ nic.device }`],
            ["port",    `${ nic.port }`],
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
          title={ `vSwitch Information - ${ vswitch.name }` }
          content={ [
            ["uplink",    `${ vswitch.uplinks.join(", ") }`],
            ["mtu",       `${ vswitch.mtu }`]
          ].concat(
            vswitch.portgroups.map((portgroup: PortgroupInfo) => (
              [`portgroup - ${ portgroup.name }`, `${ portgroup.vlan }`]
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
          content={ [
            ["device",  `${ hba.device }`],
            ["port",    `${ hba.port }`],
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
          title={ `Disk Information - ${ disk.name }` }
          content={ [
            ["size",  `${ disk.size } GB`],
            ["hbas",  `${ disk.adapters.join(", ") }`]
          ] }
        />
      )
    ))

    tables.push(
      <Table
        key="package"
        className="my-2"
        title="Software Package Information"
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
