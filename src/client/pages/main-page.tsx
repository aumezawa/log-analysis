import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { ChatRightText, HourglassSplit, HourglassTop, InfoCircle, Person, QuestionCircle, ReplyAllFill } from "react-bootstrap-icons"
import { Box, Display, FileEarmarkMedical, FileEarmarkText, HddStack, Search } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"
import * as Path from "path"

import Environment from "../lib/environment"
import ProjectPath from "../lib/project-path"
import UniqueId from "../lib/unique-id"

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

import FunctionalTableBox from "../components/complexes/functional-table-box"
import TerminalBox from "../components/complexes/terminal-box"

import HostInfoBox from "../components/specifics/vmlog/host-info-box"
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
  const [reloadBundleList,  updateBundleList]  = useReducer(x => x + 1, 0)

  const ref = useRef({
    files   : React.createRef<HTMLAnchorElement>(),
    search  : React.createRef<HTMLAnchorElement>(),
    vms     : React.createRef<HTMLAnchorElement>(),
    zdumps  : React.createRef<HTMLAnchorElement>(),
    host    : React.createRef<HTMLAnchorElement>(),
    vm      : React.createRef<HTMLAnchorElement>(),
    zdump   : React.createRef<HTMLAnchorElement>(),
    viewer  : React.createRef<HTMLAnchorElement>(),
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
    vmname    : null,
    dumpname  : null,
    filepath  : null,
    filename  : null,
    line      : null,
    filter    : null,
    date_from : null,
    date_to   : null,
    terminal  : false,
    action    : "delete"
  })

  const updateAddressBar = () => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.bundle,
      data.current.filepath,
      data.current.line,
      data.current.filter,
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
    const filter = params.get("filter")
    const date_from = params.get("date_from")
    const date_to = params.get("date_to")

    if (domain) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle, filepath) }`

      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.domain     = domain
        data.current.project    = domain && project
        data.current.bundle     = domain && project && bundle
        data.current.filepath   = domain && project && bundle && filepath
        data.current.filename   = domain && project && bundle && filepath && Path.basename(filepath)
        data.current.line       = domain && project && bundle && filepath && line      && Number(line)
        data.current.filter     = domain && project && bundle && filepath && filter    && filter
        data.current.date_from  = domain && project && bundle && filepath && date_from && date_from
        data.current.date_to    = domain && project && bundle && filepath && date_to   && date_to
        if (filepath) {
          ref.current.files.current.click()
          ref.current.viewer.current.click()
        }
        forceUpdate()
        updateAddressBar()
        return
      })
      .catch((err: AxiosError) => {
        alert(`No resource: ${ uri }`)
        updateAddressBar()
        return
      })
    } else {
      updateAddressBar()
    }

    if ((Cookie.get("whatsnew") || "") !== "false") {
      ref.current.whatsnew.current.click()
    }
  }, [true])

  const handleDoneTokenUpdate = useCallback(() => {
    updateTokenStatus()
  }, [true])

  const handleChangeDomain = useCallback((domainName: string) => {
    data.current.domain = domainName
    data.current.project = null
    data.current.bundle = null
    data.current.vmname = null
    data.current.dumpname = null
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    data.current.filter = null
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleChangeProject = useCallback((projectName: string) => {
    data.current.project = projectName
    data.current.bundle = null
    data.current.vmname = null
    data.current.dumpname = null
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    data.current.filter = null
    data.current.date_from = null
    data.current.date_to = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleChangeBundle = useCallback((bundleId: string) => {
    data.current.bundle = bundleId
    data.current.vmname = null
    data.current.dumpname = null
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    data.current.filter = null
    data.current.date_from = null
    data.current.date_to = null
    ref.current.host.current.click()
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSelectVm = useCallback((value: string) => {
    data.current.vmname = value
    ref.current.vm.current.click()
    forceUpdate()
  }, [true])

  const handleSelectZdump = useCallback((value: string) => {
    data.current.dumpname = value
    ref.current.zdump.current.click()
    forceUpdate()
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string, option: any) => {
    ref.current.viewer.current.click()
    data.current.filepath = value
    data.current.filename = Path.basename(value)
    data.current.line = null
    data.current.date_from = null
    data.current.date_to = null
    if (option && option.search !== "") {
      data.current.filter = option.search
    } else {
      data.current.filter = null
    }
    if (action === "terminal") {
      data.current.terminal = true
      setTimeout(() => forceUpdate(), 1000)
    } else {
      data.current.terminal = false
      forceUpdate()
    }
    updateAddressBar()
  }, [true])

  const handleChangeTableLine = useCallback((line: number) => {
    data.current.line = line
    updateAddressBar()
  }, [true])

  const handleChangeTableTextFilter = useCallback((text_filter: string) => {
    data.current.filter = text_filter
    updateAddressBar()
  }, [true])

  const handleChangeTableDateFilter = useCallback((date_from: string, date_to: string) => {
    data.current.date_from = date_from
    data.current.date_to = date_to
    updateAddressBar()
  }, [true])

  const handleClickLogout = useCallback((targetValue: string, parentValue: string) => {
    Cookie.remove("token")
    Cookie.remove("whatsnew")
    location.href = Environment.getBaseUrl()
  }, [true])

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
                privilege={ privilege }
                domains={ domains }
                domain={ data.current.domain }
                project={ data.current.project }
                bundle={ data.current.bundle }
                filename={ data.current.filename }
                onChangeDomain={ handleChangeDomain }
                onChangeProject={ handleChangeProject }
                onChangeBundle={ handleChangeBundle }
              />
            }
            left={
              <TabFrame
                labels={ ["Files", "Search", "VMs", "Dumps"] }
                LIcons={ [ FileEarmarkText, Search, Box, FileEarmarkMedical ] }
                items={ [
                  <FileExplorerBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    onSelect={ handleSelectFile }
                  />,
                  <FileSearchBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
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
              />
            }
            right={
              <TabFrame
                labels={ ["Host", "VM", "Dump", "Viewer"] }
                LIcons={ [ HddStack, Box, FileEarmarkMedical, Display ] }
                items={ [
                  <HostInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                  />,
                  <VmInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    vm={ data.current.vmname }
                  />,
                  <ZdumpInfoBox
                    domain={ data.current.domain }
                    project={ data.current.project }
                    bundle={ data.current.bundle }
                    zdump={ data.current.dumpname }
                  />,
                  <>
                    { !data.current.terminal &&
                      <FunctionalTableBox
                        path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }
                        line={ data.current.line }
                        textFilter={ data.current.filter }
                        dateFrom={ data.current.date_from }
                        dateTo={ data.current.date_to }
                        onChangeLine={ handleChangeTableLine }
                        onChangeTextFilter={ handleChangeTableTextFilter }
                        onChangeDateFilter={ handleChangeTableDateFilter }
                      />
                    }
                    { data.current.terminal &&
                      <TerminalBox
                        app="term"
                        path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }
                        disabled={ !data.current.terminal }
                      />
                    }
                  </>
                ] }
                refs={ [ref.current.host, ref.current.vm, ref.current.zdump, ref.current.viewer] }
              />
            }
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
