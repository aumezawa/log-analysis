import * as React from "react"

import CenterFrame from "../component/frame/center-frame"
import LayerFrame from "../component/frame/layer-frame"

import NavigatorBar from "../component/set/navigator-bar"

import DropdownHeader from "../component/part/dropdown-header"

import ErrorBox from "../component/complex/error-box"

type ErrorPageProps = {
  project?  : string,
  author?   : string,
  version?  : string
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  project   = "unaffiliated",
  author    = "unnamed",
  version   = "none"
}) => (
  <div className="container-fluid">
    <LayerFrame
      head={
        <NavigatorBar
          title={ project }
          items={ [<DropdownHeader key="header" label={ `Version: ${ version }` } />] }
        />
      }
      body={ <CenterFrame body={ <ErrorBox /> } /> }
      foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
      overflow={ false }
    />
  </div>
)

export default ErrorPage
