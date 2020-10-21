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
import ProjectDeleteModal from "../components/complexes/project-delete-modal"
import BundleUploadButton from "../components/complexes/bundle-upload-button"
import BundleSelectButton from "../components/complexes/bundle-select-button"
import BundleDeleteModal from "../components/complexes/bundle-delete-modal"
import InformationButton from "../components/parts/information-button"

import FileExplorerBox from "../components/complexes/file-explorer-box"

import MarddownViewerBox from "../components/complexes/markdown-viewer-box"
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
  privilege = "none",
  query     = ""
}) => {
  const [ignored,           forceUpdate]       = useReducer(x => x + 1, 0)
  const [reloadTokenStatus, updateTokenStatus] = useReducer(x => x + 1, 0)
  const [reloadProjectList, updateProjectList] = useReducer(x => x + 1, 0)
  const [reloadBundleList,  updateBundleList]  = useReducer(x => x + 1, 0)

  const ref = useRef({
    files   : React.createRef<HTMLAnchorElement>(),
    whatsnew: React.createRef<HTMLAnchorElement>(),
    viewer  : React.createRef<HTMLAnchorElement>()
  })

  const id = useRef({
    projectDelete : "modal-" + UniqueId(),
    bundleDelete  : "modal-" + UniqueId(),
    tokenStatus   : "modal-" + UniqueId(),
    tokenUpdate   : "modal-" + UniqueId()
  })

  const data = useRef({
    domain  : "public",
    project : null,
    bundle  : null,
    filepath: null,
    filename: null,
    line    : null,
    terminal: false
  })

  const updateAddressBar = () => {
    Environment.updateAddressBar("/main/" + ProjectPath.encode(
      data.current.domain,
      data.current.project,
      data.current.bundle,
      data.current.filepath,
      data.current.line
    ))
  }

  useEffect(() => {
    const params = new URLSearchParams(query)
    const domain = params.get("domain")
    const project = params.get("project")
    const bundle = params.get("bundle")
    const filepath = params.get("filepath")
    const line = params.get("line")

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
        data.current.line     = domain && project && bundle && filepath && Number(line)
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
  }, [true])

  const handleDoneTokenUpdate = useCallback(() => {
    updateTokenStatus()
  }, [true])

  const handleSubmitDomainSelect = useCallback((value: string) => {
    data.current.domain = value
    data.current.project = null
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSubmitProjectSelect = useCallback((value: string) => {
    data.current.project = value
    data.current.bundle = null
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSubmitProjectDelete = useCallback((value: string) => {
    if (data.current.project === value) {
      data.current.project = null
      data.current.bundle = null
      data.current.filepath = null
      data.current.filename = null
      data.current.line = null
      forceUpdate()
      updateAddressBar()
    }
  }, [true])

  const handleSubmitBundleSelect = useCallback((value: string) => {
    data.current.bundle = value
    data.current.filepath = null
    data.current.filename = null
    data.current.line = null
    forceUpdate()
    updateAddressBar()
  }, [true])

  const handleSubmitBundleDelete = useCallback((value: string) => {
    if (data.current.bundle === value) {
      data.current.bundle = null
      data.current.filepath = null
      data.current.filename = null
      data.current.line = null
      forceUpdate()
      updateAddressBar()
    }
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string) => {
    ref.current.viewer.current.click()
    data.current.filepath = value
    data.current.filename = Path.basename(value)
    data.current.line = null
    data.current.terminal = (action === "terminal")
    setTimeout(() => forceUpdate(), 1000)
    updateAddressBar()
  }, [true])

  const handleClickDeleteProject = useCallback((targetValue: string, parentValue: string) => {
    updateProjectList()
  }, [true])

  const handleClickDeleteBundle = useCallback((targetValue: string, parentValue: string) => {
    updateBundleList()
  }, [true])

  const handleChangeTableLine = useCallback((line: number) => {
    data.current.line = line
    updateAddressBar()
  }, [true])

  return (
    <div className="container-fluid">
      <LayerFrame
        head={
          <>
            <ProjectDeleteModal
              id={ id.current.projectDelete }
              domain={ data.current.domain }
              reload={ reloadProjectList }
              onSubmit={ handleSubmitProjectDelete }
            />
            <BundleDeleteModal
              id={ id.current.bundleDelete }
              domain={ data.current.domain }
              project={ data.current.project }
              reload={ reloadBundleList }
              onSubmit={ handleSubmitBundleDelete }
            />
            <TokenStatusModal
              id={ id.current.tokenStatus }
              reload={ reloadTokenStatus }
            />
            <TokenUpdateModal
              id={ id.current.tokenUpdate }
              user={ user }
              onDone={ handleDoneTokenUpdate }
            />
            <NavigatorBar
              title={ project }
              items={ [
                <DropdownHeader
                  key="header"
                  label={ `Version: ${ version }` }
                />,
                <DropdownDivider key="divider-1" />,
                <DropdownHeader
                  key="user"
                  label={ `User: ${ decodeURI(alias) }` }
                />,
                <DropdownDivider key="divider-2" />,
                <DropdownItem
                  key="delete-project"
                  label="Delete Project"
                  disabled={ !data.current.domain || (data.current.domain === "public" && privilege !== "root") }
                  toggle="modal"
                  target={ id.current.projectDelete }
                  onClick={ handleClickDeleteProject }
                />,
                <DropdownItem
                  key="delete-bundle"
                  label="Delete Bundle"
                  disabled={ !data.current.domain || !data.current.project || (data.current.domain === "public" && privilege != "root") }
                  toggle="modal"
                  target={ id.current.bundleDelete }
                  onClick={ handleClickDeleteBundle }
                />,
                <DropdownDivider key="divider-3" />,
                <DropdownItem
                  key="token-status"
                  label="Show Token Status"
                  toggle="modal"
                  target={ id.current.tokenStatus }
                />,
                <DropdownItem
                  key="token-update"
                  label="Update Token"
                  toggle="modal"
                  target={ id.current.tokenUpdate }
                />
              ] }
            />
          </>
        }
        body={
          <TFrame
            head={
              <>
                <DomainSelectButton
                  domain={ data.current.domain }
                  onSubmit={ handleSubmitDomainSelect }
                />
                { " >> " }
                <ProjectCreateButton
                  domain={ data.current.domain }
                />
                { " | " }
                <ProjectSelectButton
                  domain={ data.current.domain }
                  project={ data.current.project }
                  onSubmit={ handleSubmitProjectSelect }
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
                  bundle={ data.current.bundle }
                  onSubmit={ handleSubmitBundleSelect }
                />
                { (!!data.current.filename) ? " >> " : "" }
                <InformationButton
                  label={ data.current.filename }
                  hide={ true }
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
                refs={ [ref.current.files] }
              />
            }
            right={
              <TabFrame
                labels={ ["What's New", "Viewer"] }
                items={ [
                  <MarddownViewerBox />,
                  <>
                    { !data.current.terminal &&
                      <FunctionalTableBox
                        path={ ProjectPath.strictEncodeFilepath(data.current.domain, data.current.project, data.current.bundle, data.current.filepath) }
                        line={ data.current.line }
                        onChange={ handleChangeTableLine }
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
                refs={ [ref.current.whatsnew, ref.current.viewer] }
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
