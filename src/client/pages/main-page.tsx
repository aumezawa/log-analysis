import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { ChatRightText, HourglassSplit, HourglassTop, InfoCircle, Key, Person, QuestionCircle, ReplyAllFill } from "react-bootstrap-icons"
import { Display, FileEarmarkText, Search, Terminal } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
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
  const [reloadBundleList,  updateBundleList]  = useReducer(x => x + 1, 0)

  const ref = useRef({
    files   : React.createRef<HTMLAnchorElement>(),
    search  : React.createRef<HTMLAnchorElement>(),
    start   : React.createRef<HTMLAnchorElement>(),
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
    project   : null,
    bundle    : null,
    filepath  : null,
    filename  : null,
    termpath  : null,
    terminal  : null,
    focus     : null,
    line      : null,
    mark      : null,
    filter    : null,
    sensitive : true,
    date_from : null,
    date_to   : null,
    action    : "delete"
  })

  const env = useRef({
    state     : "INIT", // "INIT", "MAIN"
    menu      : false,
    terminal  : 0
  })

  const updateTitle = () => {
    let append: string
    append = (data.current.filename) ? ` - ${ data.current.filename }`            : ""
    append = (data.current.bundle)   ? `${ append } - ${ data.current.bundle }`   : append
    append = (data.current.project)  ? `${ append } - ${ data.current.project }`  : append
    Environment.updateTitle(project + append)
  }

  const updateAddressBar = () => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.bundle,
      data.current.filepath,
      data.current.line,
      data.current.mark,
      data.current.filter,
      data.current.sensitive,
      data.current.date_from,
      data.current.date_to
    ))
  }

  useEffect(() => {
    const params = new URLSearchParams(decodeURIComponent(query))
    const domain = params.get("domain")
    const project = params.get("project")
    const bundle = params.get("bundle")
    const filepath = params.get("filepath")
    const line = params.get("line")
    const mark = params.get("mark")
    const filter = params.get("filter")
    const sensitive = params.get("sensitive")
    const date_from = params.get("date_from")
    const date_to = params.get("date_to")

    if (domain) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle, filepath) }`

      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.domain     =  domain
        data.current.project    =  domain && project
        data.current.bundle     =  domain && project && bundle
        data.current.filepath   =  domain && project && bundle && filepath
        data.current.filename   =  domain && project && bundle && filepath && Path.basename(filepath)
        data.current.line       =  domain && project && bundle && filepath && line       && Number(line)
        data.current.mark       =  domain && project && bundle && filepath && mark
        data.current.filter     =  domain && project && bundle && filepath && filter
        data.current.sensitive  = (domain && project && bundle && filepath && sensitive) ? false : true
        data.current.date_from  =  domain && project && bundle && filepath && date_from
        data.current.date_to    =  domain && project && bundle && filepath && date_to
        if (domain && project && bundle) {
          env.current.state     = "MAIN"
          env.current.menu      = true
        }
        if (filepath) {
          ref.current.files.current.click()
          ref.current.viewer.current.click()
        }
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

    if ((Cookie.get("whatsnew") || "") !== "false") {
      ref.current.whatsnew.current.click()
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
    data.current.project = null
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    data.current.termpath = null
    data.current.terminal = null
    data.current.focus = null
    data.current.line = null
    data.current.filter = null
    data.current.sensitive = true
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeProject = useCallback((projectName: string) => {
    data.current.project = projectName
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    data.current.termpath = null
    data.current.terminal = null
    data.current.focus = null
    data.current.line = null
    data.current.filter = null
    data.current.sensitive = true
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeBundle = useCallback((bundleId: string) => {
    data.current.bundle = bundleId
    data.current.filepath = null
    data.current.filename = null
    data.current.termpath = null
    data.current.terminal = null
    data.current.focus = null
    data.current.line = null
    data.current.filter = null
    data.current.sensitive = true
    data.current.date_from = null
    data.current.date_to = null
    if (bundleId) {
      env.current.state = "MAIN"
      env.current.menu = true
      ref.current.viewer.current.click()
    } else {
      env.current.state = "INIT"
      env.current.menu = false
    }
    forceUpdate()
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleClickOpenConsole = useCallback(() => {
    ref.current.terminal.current.click()
    data.current.termpath = null
    data.current.terminal = "Console"
    env.current.terminal = env.current.terminal + 1
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string, option: any) => {
    if (action === "terminal") {
      ref.current.terminal.current.click()
      data.current.termpath = value
      data.current.terminal = Path.basename(value)
      env.current.terminal = env.current.terminal + 1
    } else {
      ref.current.viewer.current.click()
      data.current.filepath = value
      data.current.filename = Path.basename(value)
      data.current.line = null
      data.current.filter = (option && option.search !== "") ? option.search : null
      data.current.sensitive = true
      data.current.date_from = (option && option.data_from) || null
      data.current.date_to = (option && option.data_to) || null
    }
    updateTitle()
    updateAddressBar()
  }, [true])

  const handleChangeTableLine = useCallback((line: number) => {
    data.current.line = line
    updateAddressBar()
  }, [true])

  const handleChangeTableMark = useCallback((mark: string) => {
    data.current.mark = mark
    updateAddressBar()
  }, [true])

  const handleChangeTableTextFilter = useCallback((textFilter: string, textSensitive: boolean) => {
    data.current.filter = textFilter
    data.current.sensitive = textSensitive
    updateAddressBar()
  }, [true])

  const handleChangeTableDateFilter = useCallback((dateFrom: string, dateTo: string) => {
    data.current.date_from = dateFrom
    data.current.date_to = dateTo
    updateAddressBar()
  }, [true])

  const handleClickLogout = useCallback((targetValue: string, parentValue: string) => {
    Cookie.remove("token")
    Cookie.remove("whatsnew")
    location.href = Environment.getBaseUrl()
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
                menu={ env.current.menu ? "on" : "off" }
                privilege={ privilege }
                domains={ domains }
                domain={ data.current.domain }
                project={ data.current.project }
                bundle={ data.current.bundle }
                filename={ data.current.filename }
                terminal={ data.current.terminal }
                focus={ data.current.focus }
                onChangeMenu={ handleChangeMenu }
                onChangeDomain={ handleChangeDomain }
                onChangeProject={ handleChangeProject }
                onChangeBundle={ handleChangeBundle }
                onClickConsole={ handleClickOpenConsole }
              />
            }
            left={
              <TabFrame
                labels={ ["Files", "Search"] }
                LIcons={ [FileEarmarkText, Search] }
                items={ [
                  <FileExplorerBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    onSelect={ handleSelectFile }
                  />,
                  <FileSearchBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    onSelect={ handleSelectFile }
                  />
                ] }
                refs={ [ref.current.files, ref.current.search] }
              />
            }
            right={
              <TabFrame
                labels={ ["Get Started", "Viewer", "Terminal"] }
                LIcons={ [InfoCircle, Display, Terminal] }
                items={ [
                  <CenterFrame
                    body={ <MarkdownViewer content={ startMessage } /> }
                    overflow={ true }
                  />,
                  <FunctionalTableBox
                    path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }
                    line={ data.current.line }
                    mark={ data.current.mark }
                    textFilter={ data.current.filter }
                    textSensitive={ data.current.sensitive }
                    dateFrom={ data.current.date_from }
                    dateTo={ data.current.date_to }
                    onChangeLine={ handleChangeTableLine }
                    onChangeMark={ handleChangeTableMark }
                    onChangeTextFilter={ handleChangeTableTextFilter }
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
                refs={ [ref.current.start, ref.current.viewer, ref.current.terminal] }
                hiddens={ [env.current.state !== "INIT", env.current.state !== "MAIN", env.current.state !== "MAIN"] }
                onClicks={ [null, handleClickViewer, handleClickTerminal] }
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
