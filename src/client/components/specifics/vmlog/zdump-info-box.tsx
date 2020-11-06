import * as React from "react"
import { useEffect, useRef, useReducer } from "react"

import { FileEarmarkMedical, FileText, SortUp } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../../lib/environment"
import ProjectPath from "../../../lib/project-path"

import Table from "../../../components/parts/table"
import CenterText from "../../../components/parts/center-text"
import Spinner from "../../../components/parts/spinner"

type ZdumpInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  bundle?   : string,
  zdump?    : string
}

const ZdumpInfoBox = React.memo<ZdumpInfoBoxProps>(({
  className = "px-2",
  domain    = null,
  project   = null,
  bundle    = null,
  zdump     = null
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const zdumpInfo = useRef<ZdumpInfo>(null)
  const status = useRef({
    progress: false
  })

  useEffect(() => {
    if (domain && project && bundle && zdump) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }/zdumps/${ zdump }`
      status.current.progress = true
      zdumpInfo.current = null
      forceUpdate()
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        status.current.progress = false
        zdumpInfo.current = res.data.zdump
        forceUpdate()
        return
      })
      .catch((err: AxiosError) => {
        status.current.progress = false
        zdumpInfo.current = null
        forceUpdate()
        return
      })
    } else {
      status.current.progress = false
      zdumpInfo.current = null
      forceUpdate()
    }
  }, [domain, project, bundle, zdump])

  const render = () => {
    const tables: Array<JSX.Element> = []

    tables.push(
      <Table
        key="base"
        className="my-2"
        title="Zdump Base Information"
        LIcon={ FileEarmarkMedical }
        content={ [
          ["name",          `${ zdump }`],
          ["build",         `${ zdumpInfo.current.build }`],
          ["uptime",        `${ zdumpInfo.current.uptime }`],
          ["panic-date",    `${ zdumpInfo.current.panic_date }`],
          ["panic-message", `${ zdumpInfo.current.panic_msg }`]
        ] }
      />
    )

    tables.push(
      <Table
        key="trace"
        className="my-2"
        title="Back Trace"
        LIcon={ SortUp }
        content={ zdumpInfo.current.trace.map((line: string) => [line]) }
      />
    )

    tables.push(
      <Table
        key="log"
        className="my-2"
        title="Kernel Log (latest 3 days)"
        LIcon={ FileText }
        content={ zdumpInfo.current.log.map((line: string) => [line]) }
      />
    )

    return tables
  }

  return (
    <div className={ className }>
      {  status.current.progress &&   <Spinner /> }
      { !status.current.progress &&  !zdumpInfo.current && <CenterText text="No Data" /> }
      { !status.current.progress && !!zdumpInfo.current && render() }
    </div>
  )
})

export default ZdumpInfoBox
