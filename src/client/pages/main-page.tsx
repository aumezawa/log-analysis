import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

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

import DomainSelectButton from "../components/complexes/domain-select-button"
import ProjectCreateButton from "../components/complexes/project-create-button"
import ProjectSelectButton from "../components/complexes/project-select-button"
import BundleUploadButton from "../components/complexes/bundle-upload-button"
import BundleSelectButton from "../components/complexes/bundle-select-button"
import InformationButton from "../components/parts/information-button"

import FileExplorerBox from "../components/complexes/file-explorer-box"

import FunctionalTableBox from "../components/complexes/functional-table-box"

import TerminalBox from "../components/complexes/terminal-box"

type MainPageProps = {
  project?  : string,
  author?   : string,
  version?  : string,
  user?     : string,
  alias?    : string,
  privilege?: string,
  query?    : string,
}

const MainPage: React.FC<MainPageProps> = ({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous",
  alias     = "anonymous",
  privilege = "user",
  query     = ""
}) => {
  const [ignored,   forceUpdate]  = useReducer(x => x + 1, 0)
  const [statusKey, reloadStatus] = useReducer(x => x + 1, 0)

  const refs = useRef({
    files : React.createRef<HTMLAnchorElement>(),
    viewer: React.createRef<HTMLAnchorElement>()
  })

  const id = useRef({
    tokenStatus : "modal-" + UniqueId(),
    tokenUpdate : "modal-" + UniqueId()
  })

  const data = useRef({
    domain  : "public",
    project : null,
    bundle  : null,
    filepath: null,
    filename: null,
    terminal: false
  })

  const updateAddressBar = () => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.bundle,
      data.current.filepath
    ))
  }

  useEffect(() => {
    const params = new URLSearchParams(query)
    const domain = params.get("domain")
    const project = params.get("project")
    const bundle = params.get("bundle")
    const filepath = params.get("filepath")

    if (domain && project) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, bundle, filepath) }`

      Axios.get(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.domain   = domain
        data.current.project  = domain && project
        data.current.bundle   = domain && project && bundle
        data.current.filepath = domain && project && bundle && filepath
        data.current.filename = domain && project && bundle && filepath && Path.basename(filepath)
        forceUpdate()
        updateAddressBar()
        return
      })
      .catch((err: AxiosError) => {
        alert(`No resource: ${ uri }`)
        data.current.domain   = "public"
        data.current.project  = null
        data.current.bundle   = null
        data.current.filepath = null
        data.current.filename = null
        forceUpdate()
        updateAddressBar()
        return
      })
    } else {
      data.current.domain   = "public"
      data.current.project  = null
      data.current.bundle   = null
      data.current.filepath = null
      data.current.filename = null
      forceUpdate()
      updateAddressBar()
    }
  }, [query])

  const handleDoneTokenUpdate = useCallback(() => {
    reloadStatus()
  }, [true])

  const handleSubmitDomain = useCallback((value: string) => {
    data.current.domain = value
    data.current.project = null
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSubmitProject = useCallback((value: string) => {
    data.current.project = value
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSubmitBundle = useCallback((value: string) => {
    data.current.bundle = value
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string) => {
    refs.current.viewer.current.click()
    data.current.filepath = value
    data.current.filename = Path.basename(value)
    data.current.terminal = (action == "terminal")
    setTimeout(() => forceUpdate(), 1000)
    updateAddressBar()
  }, [true])

  return (
    <div className="container-fluid">
      <LayerFrame
        head={
          <>
            <TokenStatusModal id={ id.current.tokenStatus } key={ statusKey } />
            <TokenUpdateModal id={ id.current.tokenUpdate } onDone={ handleDoneTokenUpdate } />
            <NavigatorBar
              title={ project }
              items={ [
                <DropdownHeader key="header" label={ `Version: ${ version }` } />,
                <DropdownDivider key="divider-1" />,
                <DropdownHeader key="user" label={ `User: ${ decodeURI(alias) }` } />,
                <DropdownDivider key="divider-2" />,
                <DropdownItem key="status" label="Token Status" toggle="modal" target={ id.current.tokenStatus } />,
                <DropdownItem key="update" label="Token Update" toggle="modal" target={ id.current.tokenUpdate } />
              ] }
            />
          </>
        }
        body={
          <TFrame
            head={
              <>
                <DomainSelectButton
                  defaultValue={ data.current.domain }
                  onSubmit={ handleSubmitDomain }
                />
                { " >> " }
                <ProjectCreateButton
                  domain={ data.current.domain }
                />
                { " | " }
                <ProjectSelectButton
                  domain={ data.current.domain }
                  defaultValue={ data.current.project }
                  onSubmit={ handleSubmitProject }
                />
                { " >> " }
                <BundleUploadButton
                  domain={ data.current.domain }
                  project={ data.current.project }
                />
                { " | " }
                <BundleSelectButton
                  domain={ data.current.domain }
                  project={ data.current.project }
                  defaultValue={ data.current.bundle }
                  onSubmit={ handleSubmitBundle }
                />
                { " >> " }
                <InformationButton
                  label={ data.current.filename }
                  display={ !!data.current.filename }
                  defaultValue={ "Select File" }
                />
              </>
            }
            left={
              <TabFrame
                labels={ ["Files"] }
                items={ [
                  <FileExplorerBox
                    path={ ProjectPath.strictEncodeFiles(data.current.domain, data.current.project, data.current.bundle) }
                    onSelect={ handleSelectFile }
                  />
                ] }
                refs={ [refs.current.files] }
              />
            }
            right={
              <TabFrame
                labels={ ["Viewer"] }
                items={ [
                  <>
                    { !data.current.terminal && <FunctionalTableBox path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }/> }
                    {  data.current.terminal && <TerminalBox app="term" path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) } disabled={ !data.current.terminal } /> }
                  </>
                ] }
                refs={ [refs.current.viewer] }
              />
             }
          />
        }
        foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
        overflow={ false }
      />
    </div>
  )
}

export default MainPage
