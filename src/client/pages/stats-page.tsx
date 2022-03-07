import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { InfoCircle, Key, Person, QuestionCircle } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../lib/environment"
import ProjectPath from "../lib/project-path-stats"

import LayerFrame from "../components/frames/layer-frame"
import TFrame from "../components/frames/t-frame"

import NavigatorBar from "../components/sets/navigator-bar"
import DropdownHeader from "../components/parts/dropdown-header"
import DropdownDivider from "../components/parts/dropdown-divider"

import ProjectNavigatorStats from "../components/complexes/project-navigator-stats"
import StatsChartBox from "../components/complexes/stats-chart-box"

type StatsPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  alias?    : string,
  privilege?: string,
  domains?  : string,
  query?    : string
}

const StatsPage = React.memo<StatsPageProps>(({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "none",
  domains   = "public,private",
  query     = ""
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    domain    : domains.split(",")[0],
    project   : null,
    stats     : null,
    counter   : null,
    date_from : null,
    date_to   : null
  })

  const updateTitle = () => {
    let append: string
    append = (data.current.stats)    ? ` - ${ data.current.stats }`               : ""
    append = (data.current.project)  ? `${ append } - ${ data.current.project }`  : append
    Environment.updateTitle(project + append)
  }

  const updateAddressBar = () => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.stats,
      data.current.counter,
      data.current.date_from,
      data.current.date_to
    ))
  }

  useEffect(() => {
    const params = new URLSearchParams(decodeURIComponent(query))
    const domain = params.get("domain")
    const project = params.get("project")
    const stats = params.get("stats")
    const counter = params.get("counter")
    const date_from = params.get("date_from")
    const date_to = params.get("date_to")

    if (domain) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, stats, counter) }`

      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.domain     =  domain
        data.current.project    =  domain && project
        data.current.stats      =  domain && project && stats
        data.current.counter    =  domain && project && stats && counter
        data.current.date_from  =  domain && project && stats && counter && date_from
        data.current.date_to    =  domain && project && stats && counter && date_to
        forceUpdate()
        updateTitle()
        updateAddressBar()
        return
      })
      .catch((err: Error | AxiosError) => {
        alert(`No resource: ${ uri }`)
        updateTitle()
        updateAddressBar()
        return
      })
    } else {
      updateTitle()
      updateAddressBar()
    }
  }, [true])

  const handleChangeDomain = useCallback((domainName: string) => {
    data.current.domain = domainName
    data.current.project = null
    data.current.stats = null
    data.current.counter = null
    data.current.date_from = null
    data.current.date_to = null
    updateTitle()
    updateAddressBar()
    forceUpdate()
  }, [true])

  const handleChangeProject = useCallback((projectName: string) => {
    data.current.project = projectName
    data.current.stats = null
    data.current.counter = null
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeStats = useCallback((statsId: string) => {
    data.current.stats = statsId
    data.current.counter = null
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeCounter = useCallback((counter: string) => {
    data.current.counter = counter
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeRange = useCallback((from: string, to: string) => {
    data.current.date_from = from
    data.current.date_to = to
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  return (
    <div className="container-fluid">
      <LayerFrame
        head={
          <NavigatorBar
            title={ project }
            label="Help"
            LIcon={ QuestionCircle }
            items={ [
              <DropdownHeader
                key="header"
                label={ `version: ${ version }` }
                LIcon={ InfoCircle }
              />,
              <DropdownDivider key="divider-1" />,
              <DropdownHeader
                key="user"
                label={ decodeURIComponent(alias) }
                LIcon={ Person }
              />,
              <DropdownHeader
                key="privilege"
                label={ privilege }
                LIcon={ Key }
              />
            ] }
          />
        }
        body={
          <TFrame
            head={
              <ProjectNavigatorStats
                privilege={ privilege }
                domains={ domains }
                domain={ data.current.domain }
                project={ data.current.project }
                stats={ data.current.stats }
                counter={ data.current.counter }
                onChangeDomain={ handleChangeDomain }
                onChangeProject={ handleChangeProject }
                onChangeStats={ handleChangeStats }
                onChangeCounter={ handleChangeCounter }
              />
            }
            left={
              <StatsChartBox
                domain={ data.current.domain }
                project={ data.current.project }
                stats={ data.current.stats }
                counter={ data.current.counter }
                date_from={ data.current.date_from }
                date_to={ data.current.date_to }
                onChangeRange={ handleChangeRange }
            />
            }
            right={
              <></>
            }
            hiddenR={ true }
            border={ true }
          />
        }
        foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
        overflow={ false }
      />
    </div>
  )
})

export default StatsPage
