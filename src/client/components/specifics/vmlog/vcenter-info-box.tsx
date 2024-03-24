import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Display, Hdd, HddStack, JournalCheck, Server } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import LayerFrame from "../../../components/frames/layer-frame"

import Table from "../../../components/parts/table"
import CenterText from "../../../components/parts/center-text"
import Spinner from "../../../components/parts/spinner"
import SelectForm from "../../../components/parts/select-form"

import TableLayout from "../../../lib/table-layout"

type VCenterInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string
}

const OPTIONS = ["All", "vSAN"]

const VCenterInfoBox = React.memo<VCenterInfoBoxProps>(({
  className = "px-2",
  domain    = "",
  project   = "",
  bundle    = ""
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    display : OPTIONS[0],
    bundles : ([] as Array<{[label: string]: any}>),
    vcs     : ([] as Array<any>)
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    data.current.display = OPTIONS[0]
    data.current.bundles = []
    data.current.vcs = []

    if (domain && project && bundle) {
      status.current.progress = true
      forceUpdate()
      Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundles = [ { name: res.data.name, description: res.data.description } ]
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vcs`, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vcs/${ res.data.vcs[0] }`, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        data.current.vcs = [res.data.vc]
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.bundles = []
        data.current.vcs = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else {
      status.current.progress = false
      forceUpdate()
    }
  }, [domain, project, bundle])

  const handleChangeDisplay = useCallback((value: string) => {
    data.current.display = value
    forceUpdate()
  }, [true])

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

    if (["All"].includes(data.current.display)) {
      tables.push(
        <Table
          key="base"
          title="vCenter Server Base Information"
          LIcon={ HddStack }
          compare={ true }
          content={ [
            ["hostname"].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.vcname }`)),
            ["version" ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.version }`)),
            ["build"   ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.build }`)),
            ["uptime"  ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.uptime }`))
          ] }
        />
      )
    }

    const vsan = data.current.vcs.reduce((acc, cur) => (acc && cur))
    if (["All", "vSAN"].includes(data.current.display) && vsan) {
      tables.push(
        <Table
          key="vsan-base"
          title="vSAN Base Information"
          LIcon={ HddStack }
          compare={ true }
          content={ [
            ["cluster"       ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.vsan.name }`)),
            ["# of nodes"    ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.vsan.nodes.length }`)),
            ["# of cap disks"].concat(data.current.vcs.map((vcInfo: VCenterInfo) => `${ vcInfo.vsan.disks.filter((disk: VSanDiskInfo) => (disk.tier === "Capacity")).length }`)),
            ["total capacity"].concat(data.current.vcs.map((vcInfo: VCenterInfo) => {
              let size = 0
              vcInfo.vsan.disks.filter((disk: VSanDiskInfo) => (disk.tier === "Capacity")).forEach((disk: VSanDiskInfo) => {
                size += disk.size
              })
              return `${ size } GB`
            })),
            ["total usage"   ].concat(data.current.vcs.map((vcInfo: VCenterInfo) => {
              let size = 0
              let usage = 0
              vcInfo.vsan.disks.filter((disk: VSanDiskInfo) => (disk.tier === "Capacity")).forEach((disk: VSanDiskInfo) => {
                size += disk.size
                usage += disk.size * disk.usage / 100
              })
              return `${ Math.round(usage / size * 10000) / 100 } %`
            }))
          ] }
        />
      )
    }

    if (["All", "vSAN"].includes(data.current.display) && vsan) {
      TableLayout(data.current.vcs.map((vcInfo: VCenterInfo) => vcInfo.vsan.nodes), "name")
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `vsan-node-${ index }` }
            title={ `vSAN Node Information - ${ index }` }
            LIcon={ Hdd }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    if (["All", "vSAN"].includes(data.current.display) && vsan) {
      TableLayout(data.current.vcs.map((vcInfo: VCenterInfo) => vcInfo.vsan.disks), "path", undefined, {size: "GB", usage: "%"})
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `vsan-disk-${ index }` }
            title={ `vSAN Physical Disk Information - ${ index }` }
            LIcon={ Server }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    return tables
  }

  return (
    <div className={ className }>
      {  status.current.progress &&   <Spinner /> }
      { !status.current.progress &&  !data.current.vcs.length && <CenterText text="No Data" /> }
      { !status.current.progress && !!data.current.vcs.length &&
        <LayerFrame
          head={
            <SelectForm
              className="my-2"
              label={ <Display /> }
              options={ OPTIONS }
              onChange={ handleChangeDisplay }
            />
          }
          body={ <>{ render() }</> }
        />
      }
    </div>
  )
})

export default VCenterInfoBox
