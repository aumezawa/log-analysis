import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import LayerFrame from "../component/frame/layer-frame"
import TFrame from "../component/frame/t-frame"
import TabFrame from "../component/frame/tab-frame"

import NavigatorBar from "../component/set/navigator-bar"

import DropdownHeader from "../component/part/dropdown-header"

import FileExplorerBox from "../component/complex/file-explorer-box"

import DomainSelectButton from "../component/complex/domain-select-button"
import ProjectSelectButton from "../component/complex/project-select-button"
import BundleSelectButton from "../component/complex/bundle-select-button"

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
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    files : React.createRef<HTMLAnchorElement>()
  })

  const data = useRef({
    domain  : "public",
    project : null,
    bundle  : null,
    path    : null
  })

  const handleSubmitDomain = useCallback((value: string) => {
    data.current.domain = value
    data.current.project = null
    data.current.bundle = null
    data.current.path = null
    forceUpdate()
  } , [true])

  const handleSubmitProject = useCallback((value: string) => {
    data.current.project = value
    data.current.bundle = null
    data.current.path = null
    forceUpdate()
  } , [true])

  const handleSubmitBundle = useCallback((value: string) => {
    data.current.bundle = value
    data.current.path = `/log/${ data.current.domain }/projects/${ data.current.project }/bundles/${ data.current.bundle }/files`
    forceUpdate()
  } , [true])

  return (
    <div className="container-fluid">
      <LayerFrame
        head={
          <NavigatorBar
            title={ project }
            items={ [<DropdownHeader key="header" label={ `Version: ${ version }` } />] }
          />
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
                <ProjectSelectButton
                  domain={ data.current.domain }
                  onSubmit={ handleSubmitProject }
                />
                { " >> " }
                <BundleSelectButton
                  domain={ data.current.domain }
                  project={ data.current.project }
                  onSubmit={ handleSubmitBundle }
                />
              </>
            }
            left={
              <TabFrame
                labels={ ["Files"] }
                items={ [<FileExplorerBox path={ data.current.path } />] }
                refs={ [refs.current.files] }
              />
            }
            right={ <></> }
          />
        }
        foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
        overflow={ false }
      />
    </div>
  )
}

export default MainPage