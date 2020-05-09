import * as React from "react"

import LayerFrame from "../components/frames/layer-frame"
import CenterFrame from "../components/frames/center-frame"

import NavigatorBar from "../components/sets/navigator-bar"
import DropdownHeader from "../components/parts/dropdown-header"

import LoginBox from "../components/complexes/login-box"

type LoginPageProps = {
  project?  : string,
  author?   : string,
  version?  : string
}

const LoginPage: React.FC<LoginPageProps> = ({
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
      body={ <CenterFrame body={ <LoginBox /> } /> }
      foot={ <div className="text-light text-right bg-dark text-box-margin">Coded by { author }, powered by React</div> }
      overflow={ false }
    />
  </div>
)

export default LoginPage
