import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import * as Path from "path"

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
  user?     : string
}

const MainPage: React.FC<MainPageProps> = ({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none",
  user      = "anonymous"
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
    path    : null,
    filepath: null,
    filename: null,
    terminal: false
  })

  const handleDoneTokenUpdate = useCallback(() => {
    reloadStatus()
  }, [true])

  const handleSubmitDomain = useCallback((value: string) => {
    data.current.domain = value
    data.current.project = null
    data.current.bundle = null
    data.current.path = null
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
  }, [true])

  const handleSubmitProject = useCallback((value: string) => {
    data.current.project = value
    data.current.bundle = null
    data.current.path = null
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
  }, [true])

  const handleSubmitBundle = useCallback((value: string) => {
    data.current.bundle = value
    data.current.path = `/log/${ data.current.domain }/projects/${ data.current.project }/bundles/${ data.current.bundle }/files`
    data.current.filepath = null
    data.current.filename = null
    forceUpdate()
  }, [true])

  const handleSelectFile = useCallback((action: string, value: string) => {
    refs.current.viewer.current.click()
    data.current.filepath = `${ data.current.path }/${ value }`
    data.current.filename = Path.basename(value)
    data.current.terminal = (action == "terminal")
    setTimeout(() => forceUpdate(), 1000)
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
                <DropdownDivider key="divider" />,
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
                  onSubmit={ handleSubmitBundle }
                />
                { " >> " }
                <InformationButton
                  label={ data.current.filename }
                  defaultValue={ "Select File" }
                />
              </>
            }
            left={
              <TabFrame
                labels={ ["Files"] }
                items={ [<FileExplorerBox path={ data.current.path } onSelect={ handleSelectFile } />] }
                refs={ [refs.current.files] }
              />
            }
            right={
              <TabFrame
                labels={ ["Viewer"] }
                items={ [
                  <>
                    { !data.current.terminal && <FunctionalTableBox path={ data.current.filepath }/> }
                    {  data.current.terminal && <TerminalBox app="term" path={ data.current.filepath } disabled={ !data.current.terminal } /> }
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
