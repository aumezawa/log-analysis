import * as React from "react"

import LayerFrame from "../component/frame/layer-frame"

import NavigatorBar from "../component/set/navigator-bar"

import DropdownHeader from "../component/part/dropdown-header"

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
}) => (
  <div className="container-fluid">
    <LayerFrame
      head={
        <NavigatorBar
          title={ project }
          items={ [<DropdownHeader key="header" label={ `Version: ${ version }` } />] }
        />
      }
      body={ <div>This is the main page.</div> }
      foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
      overflow={ false }
    />
  </div>
)

export default MainPage
