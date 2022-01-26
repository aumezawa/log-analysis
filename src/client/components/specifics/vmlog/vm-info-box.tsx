import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Box, Diagram3, Display, Gear, JournalCheck, Server } from "react-bootstrap-icons"

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

type VmInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  vmname?   : string,
  vms?      : string
}

const OPTIONS = ["All", "System", "Network", "SCSI & Disk", "Passthrough"]

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
    display : OPTIONS[0],
    bundles : [],
    vms     : []
  })

  const status = useRef({
    progress: false
  })

  useEffect(() => {
    data.current.display = OPTIONS[0]
    data.current.bundles = []
    data.current.vms = []

    if (domain && project && bundle && vmname && !vms) {
      status.current.progress = true
      forceUpdate()
      Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.bundles = [ { name: res.data.name, description: res.data.description } ]
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/vms/${ vmname }`, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        data.current.vms = [res.data.vm]
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.bundles = []
        data.current.vms = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else if (domain && project && vms) {
      status.current.progress = true
      forceUpdate()
      Promise.all(vms.split(",").map((vm: string) => {
        return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, vm.split(":")[0]) }`, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      }))
      .then((reses: Array<AxiosResponse>) => {
        data.current.bundles = reses.map((res: AxiosResponse) => ({ name: res.data.name, description: res.data.description }))
        return Promise.all(vms.split(",").map((vm: string) => {
          return Axios.get(`${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, vm.split(":")[0]) }/vms/${ vm.split(":")[1] }`, {
            headers : { "X-Access-Token": Cookies.get("token") || "" },
            data    : {}
          })
        }))
      })
      .then((reses: Array<AxiosResponse>) => {
        data.current.vms = reses.map((res: AxiosResponse) => res.data.vm)
        status.current.progress = false
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        data.current.bundles = []
        data.current.vms = []
        status.current.progress = false
        forceUpdate()
        return
      })
    } else {
      status.current.progress = false
      forceUpdate()
    }
  }, [domain, project, bundle, vmname, vms])

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

    if (["All", "System"].includes(data.current.display)) {
      tables.push(
        <Table
          key="base"
          title="VM Base Information"
          LIcon={ Box }
          compare={ true }
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
    }

    if (["All", "System"].includes(data.current.display)) {
      tables.push(
        <Table
          key="options"
          title="VM Options"
          LIcon={ Gear }
          compare={ true }
          content={ [
            ["uefi.secureBoot.enabled"                  ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.uefi_secureBoot_enabled }`)),
            ["cpuid.coresPerSocket"                     ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.cpuid_coresPerSocket }`)),
            ["numa.nodeAffinity"                        ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_nodeAffinity }`)),
            ["numa.vcpu.maxPerMachineNode"              ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_vcpu_maxPerMachineNode }`)),
            ["numa.vcpu.maxPerVirtualNode"              ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_vcpu_maxPerVirtualNode }`)),
            ["numa.autosize"                            ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_autosize }`)),
            ["numa.autosize.vcpu.maxPerVirtualNode"     ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.numa_autosize_vcpu_maxPerVirtualNode }`)),
            ["sched.cpu.affinity"                       ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_affinity }`)),
            ["sched.cpu.latencySensitivity"             ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_latencySensitivity }`)),
            ["sched.cpu.min"                            ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_cpu_min }`)),
            ["sched.mem.pin"                            ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.sched_mem_pin }`)),
            ["latency.enforceCpuMin"                    ].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.latency_enforceCpuMin }`)),
            ["timeTracker.apparentTimeIgnoresInterrupts"].concat(data.current.vms.map((vmInfo: VmInfo) => `${ vmInfo.options.timeTracker_apparentTimeIgnoresInterrupts }`))
          ] }
        />
      )
    }

    if (["All", "Network"].includes(data.current.display)) {
      TableLayout(data.current.vms.map((vmInfo: VmInfo) => vmInfo.nics), "slot")
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `vnic-${ index }` }
            title={ `vNIC Information - ${ index }` }
            LIcon={ Diagram3 }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    if (["All", "SCSI & Disk"].includes(data.current.display)) {
      TableLayout(data.current.vms.map((vmInfo: VmInfo) => vmInfo.scsis), "slot")
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `scsi-${ index }` }
            title={ `vSCSI Information - ${ index }` }
            LIcon={ Server }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    if (["All", "SCSI & Disk"].includes(data.current.display)) {
      TableLayout(data.current.vms.map((vmInfo: VmInfo) => vmInfo.disks), "name", null, {size: "GB"})
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `disk-${ index }` }
            title={ `vDisk Information - ${ index }` }
            LIcon={ Server }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    if (["All", "Passthrough"].includes(data.current.display)) {
      TableLayout(data.current.vms.map((vmInfo: VmInfo) => vmInfo.dpios), "slot")
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `dpio-${ index }` }
            title={ `DPIO Information - ${ index }` }
            LIcon={ Server }
            compare={ true }
            content={ content }
          />
        )
      })
    }

    if (["All", "Network", "Passthrough"].includes(data.current.display)) {
      TableLayout(data.current.vms.map((vmInfo: VmInfo) => vmInfo.vfs), "slot")
      .forEach((content: Array<Array<string>>, index: number) => {
        tables.push(
          <Table
            key={ `vf-${ index }` }
            title={ `SR-IOV VF Information - ${ index }` }
            LIcon={ Diagram3 }
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
      { !status.current.progress &&  !data.current.vms.length && <CenterText text="No Data" /> }
      { !status.current.progress && !!data.current.vms.length &&
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

export default VmInfoBox
