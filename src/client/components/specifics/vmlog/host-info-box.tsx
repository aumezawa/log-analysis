import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import { Cpu, Diagram3, Gear, Grid3x3Gap, HddStack, JournalCheck, Server, Tags } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import Table from "../../../components/parts/table"
import CenterText from "../../../components/parts/center-text"
import Spinner from "../../../components/parts/spinner"

import TableLayout from "../../../lib/table-layout"

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
    bundles : [],
    hosts   : []
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle && !hosts) {
      data.current.bundles = []
      data.current.hosts = []
      status.current.progress = true
      forceUpdate()
      Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundles = [ { name: res.data.name, description: res.data.description } ]
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/hosts`, {
          headers : { "X-Access-Token": Cookie.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/hosts/${ res.data.hosts[0] }`, {
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
      data.current.bundles = []
      data.current.hosts = []
      status.current.progress = true
      forceUpdate()
      Promise.all(hosts.split(",").map((host: string) => {
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, host.split(":")[0]) }`, {
          headers : { "X-Access-Token": Cookie.get("token") || "" },
          data    : {}
        })
      }))
      .then((reses: Array<AxiosResponse>) => {
        data.current.bundles = reses.map((res: AxiosResponse) => ({ name: res.data.name, description: res.data.description }))
        return Promise.all(hosts.split(",").map((host: string) => {
          return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, host.split(":")[0]) }/hosts/${ host.split(":")[1] }`, {
            headers : { "X-Access-Token": Cookie.get("token") || "" },
            data    : {}
          })
        }))
      })
      .then((reses: Array<AxiosResponse>) => {
        data.current.hosts = reses.map((res: AxiosResponse) => res.data.host)
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
        key="bundle"
        title="Log Bundle Information"
        LIcon={ JournalCheck }
        content={ [
          ["name"       ].concat(data.current.bundles.map((bundle: any) => `${ bundle.name }`)),
          ["description"].concat(data.current.bundles.map((bundle: any) => `${ bundle.description }`))
        ] }
      />
    )

    tables.push(
      <Table
        key="base"
        title="ESXi Base Information"
        LIcon={ HddStack }
        compare={ true }
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
        title="ESXi System Information"
        LIcon={ Gear }
        compare={ true }
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
        title="Hardware Information"
        LIcon={ Cpu }
        compare={ true }
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

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.hardware.cards), "slot")
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `card-${ index }` }
          title={ `PCI Card Information - ${ index }` }
          LIcon={ Tags }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.network.nics), "name", null, {speed: "Mbps"})
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `nic-${ index }` }
          title={ `NIC Information - ${ index }` }
          LIcon={ Diagram3 }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.network.vswitches), "name")
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `vswitch-${ index }` }
          title={ `vSwitch Information - ${ index }` }
          LIcon={ Diagram3 }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.network.portgroups), "name")
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `portgroup-${ index }` }
          title={ `PortGroup Information - ${ index }` }
          LIcon={ Diagram3 }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.storage.hbas), "name")
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `hba-${ index }` }
          title={ `HBA Information - ${ index }` }
          LIcon={ Server }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.storage.disks), "name", null, {size: "GB"})
    .forEach((content: Array<Array<string>>, index: number) => {
      tables.push(
        <Table
          key={ `disk-${ index }` }
          title={ `Disk Information - ${ index }` }
          LIcon={ Server }
          compare={ true }
          content={ content }
        />
      )
    })

    TableLayout(data.current.hosts.map((hostInfo: HostInfo) => hostInfo.packages), "name", "version",)
    .forEach((content: Array<Array<string>>) => {
      tables.push(
        <Table
          key={ `package` }
          title={ `Software Package Information` }
          LIcon={ Grid3x3Gap }
          compare={ true }
          content={ content }
        />
      )
    })

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
