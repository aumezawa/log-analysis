import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { ChatRightText, HourglassSplit, HourglassTop, InfoCircle, Key, Person, QuestionCircle, ReplyAllFill } from "react-bootstrap-icons"
import { Box, Display, FileEarmarkMedical, FileEarmarkText, HddStack, Search, Terminal } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"
import * as Path from "path"

import Environment from "../lib/environment"
import ProjectPath from "../lib/project-path"
import UniqueId from "../lib/unique-id"

import CenterFrame from "../components/frames/center-frame"
import LayerFrame from "../components/frames/layer-frame"
import TFrame from "../components/frames/t-frame"
import TabFrame from "../components/frames/tab-frame"

import NavigatorBar from "../components/sets/navigator-bar"
import DropdownHeader from "../components/parts/dropdown-header"
import DropdownDivider from "../components/parts/dropdown-divider"
import DropdownItem from "../components/parts/dropdown-item"
import TokenStatusModal from "../components/complexes/token-status-modal"
import TokenUpdateModal from "../components/complexes/token-update-modal"
import WhatsNewModal from "../components/complexes/whatsnew-modal"

import ProjectNavigator from "../components/complexes/project-navigator"

import FileExplorerBox from "../components/complexes/file-explorer-box"
import FileSearchBox from "../components/complexes/file-search-box"

import MarkdownViewer from "../components/parts/markdown-viewer"
import FunctionalTableBox from "../components/complexes/functional-table-box"
import TerminalBox from "../components/complexes/terminal-box"

import ServerInfoBox from "../components/specifics/vmlog/server-info-box"
import VmExplorerBox from "../components/specifics/vmlog/vm-explorer-box"
import VmInfoBox from "../components/specifics/vmlog/vm-info-box"
import ZdumpExplorerBox from "../components/specifics/vmlog/zdump-explorer-box"
import ZdumpInfoBox from "../components/specifics/vmlog/zdump-info-box"

type MainPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  alias?    : string,
  privilege?: string,
  domains?  : string,
  query?    : string,
}

const MainPage: React.FC<MainPageProps> = ({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "none",
  domains   = "public,private",
  query     = ""
}) => {
  const [ignored,           forceUpdate]       = useReducer(x => x + 1, 0)
  const [reloadTokenStatus, updateTokenStatus] = useReducer(x => x + 1, 0)

  const ref = useRef({
    files   : React.createRef<HTMLAnchorElement>(),
    search  : React.createRef<HTMLAnchorElement>(),
    vms     : React.createRef<HTMLAnchorElement>(),
    zdumps  : React.createRef<HTMLAnchorElement>(),
    start   : React.createRef<HTMLAnchorElement>(),
    server  : React.createRef<HTMLAnchorElement>(),
    vm      : React.createRef<HTMLAnchorElement>(),
    zdump   : React.createRef<HTMLAnchorElement>(),
    viewer  : React.createRef<HTMLAnchorElement>(),
    terminal: React.createRef<HTMLAnchorElement>(),
    whatsnew: React.createRef<HTMLButtonElement>()
  })

  const id = useRef({
    bundleDelete  : "modal-" + UniqueId(),
    tokenStatus   : "modal-" + UniqueId(),
    tokenUpdate   : "modal-" + UniqueId(),
    whatsnew      : "modal-" + UniqueId()
  })

  const data = useRef({
    domain    : domains.split(",")[0],
    project   : "",
    bundle    : "",
    type      : "",
    hosts     : "",
    vms       : "",
    vmname    : "",
    dumpname  : "",
    filepath  : "",
    filename  : "",
    termpath  : "",
    terminal  : "",
    focus     : "",
    line      : 0,
    mark      : "",
    filter    : "",
    search    : "",
    sensitive : true,
    date_from : "",
    date_to   : "",
    merge     : ""
  })

  const env = useRef({
    state     : "INIT", // "INIT", "MAIN"
    menu      : false,
    terminal  : 0
  })

  const updateAddressBar = (sticky: boolean = true) => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.bundle,
      data.current.filepath,
      data.current.line,
      data.current.mark,
      data.current.filter,
      data.current.search,
      data.current.sensitive,
      data.current.date_from,
      data.current.date_to,
      data.current.merge
    ), !sticky)

    if (sticky) {
      Environment.updateTitle(`${ Environment.getSubPath() } - ${ project }`)
    }
  }

  const updatePage = () => {
    const domain    = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "domain")
    const project   = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "project")
    const bundle    = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "bundle")
    const filepath  = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "filepath")
    const line      = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "line")
    const mark      = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "mark")
    const filter    = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "filter")
    const search    = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "search")
    const sensitive = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "sensitive")
    const date_from = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "date_from")
    const date_to   = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "date_to")
    const merge     = ProjectPath.decode(Environment.getSubPath(), Environment.getParams(), "merge")

    if (domain) {
      const uri1 = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle, filepath) }`
      const uri2 = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`

      Axios.get(uri1, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        return Axios.get(uri2, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        data.current.domain     =  domain
        data.current.project    =  domain && project
        data.current.bundle     =  domain && project && bundle
        data.current.type       =  domain && project && bundle && res      && res.data.type
        data.current.filepath   =  domain && project && bundle && filepath
        data.current.filename   =  domain && project && bundle && filepath && Path.basename(filepath)
        data.current.line       = (domain && project && bundle && filepath && line) ? Number(line) : 0
        data.current.mark       =  domain && project && bundle && filepath && mark
        data.current.filter     =  domain && project && bundle && filepath && filter
        data.current.search     =  domain && project && bundle && filepath && search
        data.current.sensitive  = (domain && project && bundle && filepath && sensitive) ? false : true
        data.current.date_from  =  domain && project && bundle && filepath && date_from
        data.current.date_to    =  domain && project && bundle && filepath && date_to
        data.current.merge      =  domain && project && bundle && filepath && merge
        if (domain && project && bundle) {
          env.current.state     = "MAIN"
          env.current.menu      = true
          ref.current.server.current?.click()
        }
        if (filepath) {
          setTimeout(() => {
            ref.current.files.current?.click()
            ref.current.viewer.current?.click()
          }, 200)
        }
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        alert(`No resource: ${ uri1 } or ${ uri2 }`)
        return
      })
    } else {
      alert(`Unexpected error...`)
    }
  }

  useEffect(() => {
    const domain    = Environment.getUrlParam(query, "domain")
    const project   = Environment.getUrlParam(query, "project")
    const bundle    = Environment.getUrlParam(query, "bundle")
    const filepath  = Environment.getUrlParam(query, "filepath")
    const line      = Environment.getUrlParam(query, "line")
    const mark      = Environment.getUrlParam(query, "mark")
    const filter    = Environment.getUrlParam(query, "filter")
    const search    = Environment.getUrlParam(query, "search")
    const sensitive = Environment.getUrlParam(query, "sensitive")
    const date_from = Environment.getUrlParam(query, "date_from")
    const date_to   = Environment.getUrlParam(query, "date_to")
    const merge     = Environment.getUrlParam(query, "merge")

    if (domain) {
      const uri1 = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle, filepath) }`
      const uri2 = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle) }`

      Axios.get(uri1, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        return Axios.get(uri2, {
          headers : { "X-Access-Token": Cookies.get("token") || "" },
          data    : {}
        })
      })
      .then((res: AxiosResponse) => {
        data.current.domain     =  domain
        data.current.project    =  domain && project
        data.current.bundle     =  domain && project && bundle
        data.current.type       =  domain && project && bundle && res      && res.data.type
        data.current.filepath   =  domain && project && bundle && filepath
        data.current.filename   =  domain && project && bundle && filepath && Path.basename(filepath)
        data.current.line       = (domain && project && bundle && filepath && line) ? Number(line) : 0
        data.current.mark       =  domain && project && bundle && filepath && mark
        data.current.filter     =  domain && project && bundle && filepath && filter
        data.current.search     =  domain && project && bundle && filepath && search
        data.current.sensitive  = (domain && project && bundle && filepath && sensitive) ? false : true
        data.current.date_from  =  domain && project && bundle && filepath && date_from
        data.current.date_to    =  domain && project && bundle && filepath && date_to
        data.current.merge      =  domain && project && bundle && filepath && merge
        if (domain && project && bundle) {
          env.current.state     = "MAIN"
          env.current.menu      = true
          ref.current.server.current?.click()
        }
        if (filepath) {
          setTimeout(() => {
            ref.current.files.current?.click()
            ref.current.viewer.current?.click()
          }, 200)
        }
        forceUpdate()
        updateAddressBar()
        return
      })
      .catch((err: Error | AxiosError) => {
        alert(`No resource: ${ uri1 } or ${ uri2 }`)
        updateAddressBar()
        return
      })
    } else {
      updateAddressBar()
    }

    if ((Cookies.get("whatsnew") || "") !== "false") {
      ref.current.whatsnew.current?.click()
    }

    Environment.addPageBackForwardEvent(updatePage)

    return () => {
      Environment.removePageBackForwardEvent(updatePage)
    }
  }, [true])

  const handleDoneTokenUpdate = useCallback(() => {
    updateTokenStatus()
  }, [true])

  const handleChangeMenu = useCallback((enabled: boolean) => {
    env.current.menu = enabled
    forceUpdate()
  }, [true])

  const handleChangeDomain = useCallback((domainName: string) => {
    data.current.domain = domainName
    data.current.project = ""
    data.current.bundle = ""
    data.current.type = ""
    data.current.hosts = ""
    data.current.vms = ""
    data.current.vmname = ""
    data.current.dumpname = ""
    data.current.filepath = ""
    data.current.filename = ""
    data.current.termpath = ""
    data.current.terminal = ""
    data.current.focus = ""
    data.current.line = 0
    data.current.filter = ""
    data.current.search = ""
    data.current.sensitive = true
    data.current.date_from = ""
    data.current.date_to = ""
    data.current.merge = ""
    env.current.state = "INIT"
    env.current.menu = false
    ref.current.start.current?.click()
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleChangeProject = useCallback((projectName: string) => {
    data.current.project = projectName
    data.current.bundle = ""
    data.current.type = ""
    data.current.hosts = ""
    data.current.vms = ""
    data.current.vmname = ""
    data.current.dumpname = ""
    data.current.filepath = ""
    data.current.filename = ""
    data.current.termpath = ""
    data.current.terminal = ""
    data.current.focus = ""
    data.current.line = 0
    data.current.filter = ""
    data.current.search = ""
    data.current.sensitive = true
    data.current.date_from = ""
    data.current.date_to = ""
    data.current.merge = ""
    env.current.state = "INIT"
    env.current.menu = false
    ref.current.start.current?.click()
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleChangeBundle = useCallback((bundleId: string, bundleType: string) => {
    data.current.bundle = bundleId
    data.current.type = bundleType
    data.current.hosts = ""
    data.current.vms = ""
    data.current.vmname = ""
    data.current.dumpname = ""
    data.current.filepath = ""
    data.current.filename = ""
    data.current.termpath = ""
    data.current.terminal = ""
    data.current.focus = ""
    data.current.line = 0
    data.current.filter = ""
    data.current.search = ""
    data.current.sensitive = true
    data.current.date_from = ""
    data.current.date_to = ""
    data.current.merge = ""
    if (bundleId) {
      env.current.state = "MAIN"
      env.current.menu = true
      ref.current.server.current?.click()
    } else {
      env.current.state = "INIT"
      env.current.menu = false
      ref.current.start.current?.click()
    }
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleChangeHosts = useCallback((hosts: string) => {
    data.current.hosts = hosts
    ref.current.server.current?.click()
    forceUpdate()
  }, [true])

  const handleChangeVms = useCallback((vms: string) => {
    data.current.vms = vms
    ref.current.vm.current?.click()
    forceUpdate()
  }, [true])

  const handleSelectVm = useCallback((action: string, value: string) => {
    if (action === "vminfo") {
      data.current.vms = ""
      data.current.vmname = value
      ref.current.vm.current?.click()
    }
    if (action === "vmx") {
      data.current.filepath = value
      data.current.filename = Path.basename(value)
      data.current.line = 0
      data.current.filter = ""
      data.current.sensitive = true
      data.current.date_from = ""
      data.current.date_to = ""
      ref.current.viewer.current?.click()
    }
    if (action === "vmlog") {
      data.current.filepath = value
      data.current.filename = Path.basename(value)
      data.current.line = 0
      data.current.filter = ""
      data.current.sensitive = true
      data.current.date_from = ""
      data.current.date_to = ""
      ref.current.viewer.current?.click()
    }
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSelectZdump = useCallback((value: string) => {
    data.current.dumpname = value
    ref.current.zdump.current?.click()
    forceUpdate()
  }, [true])

  const handleClickOpenConsole = useCallback(() => {
    ref.current.terminal.current?.click()
    data.current.termpath = ""
    data.current.terminal = "Console"
    env.current.terminal = env.current.terminal + 1
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string, option: any) => {
    if (action === "terminal") {
      ref.current.terminal.current?.click()
      data.current.termpath = value
      data.current.terminal = Path.basename(value)
      env.current.terminal = env.current.terminal + 1
    } else if (action === "merge") {
      if (value !== data.current.filename) {
        ref.current.viewer.current?.click()
        data.current.line = 0
        data.current.mark = ""
        data.current.filter = ""
        data.current.search = ""
        data.current.sensitive = true
        data.current.date_from = ""
        data.current.date_to = ""
        data.current.merge = value
      } else {
        alert("Cannot open the same file...")
      }
    } else {
      ref.current.viewer.current?.click()
      data.current.filepath = value
      data.current.filename = Path.basename(value)
      data.current.line = 0
      data.current.mark = ""
      data.current.filter = (option && option.search !== "") ? option.search : ""
      data.current.search = ""
      data.current.sensitive = true
      data.current.date_from = (option && option.data_from) || ""
      data.current.date_to = (option && option.data_to) || ""
      data.current.merge = ""
      updateAddressBar()
    }
  }, [true])

  const handleChangeTableLine = useCallback((line: number) => {
    data.current.line = line
    updateAddressBar(false)
  }, [true])

  const handleChangeTableMark = useCallback((mark: string) => {
    data.current.mark = mark
    updateAddressBar(false)
  }, [true])

  const handleChangeTableTextFilter = useCallback((textFilter: string, textSensitive: boolean) => {
    data.current.filter = textFilter
    data.current.search = ""
    data.current.sensitive = textSensitive
    updateAddressBar(false)
  }, [true])

  const handleChangeTableTextSearch = useCallback((textSearch: string, textSensitive: boolean) => {
    data.current.filter = ""
    data.current.search = textSearch
    data.current.sensitive = textSensitive
    updateAddressBar(false)
  }, [true])

  const handleChangeTableDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    data.current.date_from = dateFrom
    data.current.date_to = dateTo
    updateAddressBar(false)
  }, [true])

  const handleClickLogout = useCallback((targetValue: string, parentValue: string) => {
    Cookies.remove("token")
    Cookies.remove("whatsnew")
    location.href = Environment.getBaseUrl()
  }, [true])

  const handleClickHost = useCallback(() => {
    data.current.focus = "host"
    forceUpdate()
  }, [true])

  const handleClickVm = useCallback(() => {
    data.current.focus = "vm"
    forceUpdate()
  }, [true])

  const handleClickDump = useCallback(() => {
    data.current.focus = "dump"
    forceUpdate()
  }, [true])

  const handleClickViewer = useCallback(() => {
    data.current.focus = "filename"
    forceUpdate()
  }, [true])

  const handleClickTerminal = useCallback(() => {
    data.current.focus = "terminal"
    setTimeout(() => forceUpdate(), 1000)
  }, [true])

  const startMessage = `
  # Welcome to ${ project }!

  ***

  ### How to use

  ##### Step 1

  Press **[New Project]** to create a new project ***or*** press **[Select Project]** to open an existing one.

  ##### Step 2

  Press **[Upload Bundle]** to upload a new log bundle ***or*** press **[Select Bundle]** to open an existing one.
  `

  return (
    <div className="container-fluid">
      <LayerFrame
        head={
          <>
            <TokenStatusModal
              id={ id.current.tokenStatus }
              reload={ reloadTokenStatus }
            />
            <TokenUpdateModal
              id={ id.current.tokenUpdate }
              user={ user }
              onDone={ handleDoneTokenUpdate }
            />
            <WhatsNewModal
              id={ id.current.whatsnew }
            />
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
                />,
                <DropdownDivider key="divider-2" />,
                <DropdownItem
                  key="token-status"
                  label="Show Token Status"
                  LIcon={ HourglassSplit }
                  toggle="modal"
                  target={ id.current.tokenStatus }
                />,
                <DropdownItem
                  key="token-update"
                  label="Update Token"
                  LIcon={ HourglassTop }
                  toggle="modal"
                  target={ id.current.tokenUpdate }
                />,
                <DropdownDivider key="divider-3" />,
                <DropdownItem
                  ref={ ref.current.whatsnew }
                  key="whatsnew"
                  label="Show What's New"
                  LIcon={ ChatRightText }
                  toggle="modal"
                  target={ id.current.whatsnew }
                />,
                <DropdownDivider key="divider-4" />,
                <DropdownItem
                  key="logout"
                  label="Logout"
                  LIcon={ ReplyAllFill }
                  onClick={ handleClickLogout }
                />
              ] }
            />
          </>
        }
        body={
          <TFrame
            head={
              <ProjectNavigator
                menu={ env.current.menu }
                privilege={ privilege }
                domains={ domains }
                domain={ data.current.domain }
                project={ data.current.project }
                bundle={ data.current.bundle }
                filename={ data.current.filename }
                merge={ data.current.merge }
                terminal={ data.current.terminal }
                host={ data.current.type === "vm-support" ? "ESXi Server" : "vCenter Server" }
                vm={ data.current.vmname }
                dump={ data.current.dumpname }
                focus={ data.current.focus }
                onChangeMenu={ handleChangeMenu }
                onChangeDomain={ handleChangeDomain }
                onChangeProject={ handleChangeProject }
                onChangeBundle={ handleChangeBundle }
                onChangeHosts={ handleChangeHosts }
                onChangeVms={ handleChangeVms }
                onClickConsole={ handleClickOpenConsole }
              />
            }
            left={
              <TabFrame
                labels={ ["Files", "Search", "VMs", "Dumps"] }
                LIcons={ [FileEarmarkText, Search, Box, FileEarmarkMedical] }
                items={ [
                  <FileExplorerBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    viewfile={ data.current.filename }
                    onSelect={ handleSelectFile }
                  />,
                  <FileSearchBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    viewfile={ data.current.filename }
                    onSelect={ handleSelectFile }
                  />,
                  <VmExplorerBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    onSelect={ handleSelectVm }
                  />,
                  <ZdumpExplorerBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    onSelect={ handleSelectZdump }
                  />
                ] }
                refs={ [ref.current.files, ref.current.search, ref.current.vms, ref.current.zdump] }
                hiddens={ [false, false, data.current.type !== "vm-support", data.current.type !== "vm-support"] }
              />
            }
            right={
              <TabFrame
                labels={ ["Get Started", "Server", "VM", "Dump", "Viewer", "Terminal"] }
                LIcons={ [InfoCircle, HddStack, Box, FileEarmarkMedical, Display, Terminal] }
                items={ [
                  <CenterFrame
                    body={ <MarkdownViewer content={ startMessage } /> }
                    overflow={ true }
                  />,
                  <ServerInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    type={ data.current.type }
                    hosts={ data.current.hosts }
                  />,
                  <VmInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    vmname={ data.current.vmname }
                    vms={ data.current.vms }
                  />,
                  <ZdumpInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    zdump={ data.current.dumpname }
                  />,
                  <FunctionalTableBox
                    path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }
                    line={ data.current.line }
                    mark={ data.current.mark }
                    textFilter={ data.current.filter }
                    textSearch={ data.current.search }
                    textSensitive={ data.current.sensitive }
                    dateFrom={ data.current.date_from }
                    dateTo={ data.current.date_to }
                    merge={ data.current.merge }
                    onChangeLine={ handleChangeTableLine }
                    onChangeMark={ handleChangeTableMark }
                    onChangeTextFilter={ handleChangeTableTextFilter }
                    onChangeTextSearch={ handleChangeTableTextSearch }
                    onChangeDateFilter={ handleChangeTableDateFilter }
                  />,
                  <TerminalBox
                    app="term"
                    path={ ProjectPath.encode(data.current.domain, data.current.project, data.current.bundle, data.current.termpath) }
                    disabled={ data.current.terminal === null }
                    focus={ data.current.focus === "terminal" }
                    reload={ env.current.terminal }
                  />
                ] }
                refs={ [ref.current.start, ref.current.server, ref.current.vm, ref.current.zdump, ref.current.viewer, ref.current.terminal] }
                hiddens={ [env.current.state !== "INIT", env.current.state !== "MAIN", env.current.state !== "MAIN" || data.current.type !== "vm-support", env.current.state !== "MAIN" || data.current.type !== "vm-support", env.current.state !== "MAIN", env.current.state !== "MAIN"] }
                onClicks={ [() => {}, handleClickHost, handleClickVm, handleClickDump, handleClickViewer, handleClickTerminal] }
              />
            }
            hiddenL={ !env.current.menu }
            border={ true }
          />
        }
        foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
        overflow={ false }
      />
    </div>
  )
}

export default MainPage
