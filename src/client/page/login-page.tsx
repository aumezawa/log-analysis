import * as React from "react"

import CenterFrame from "../component/frame/center-frame"
import LayerFrame from "../component/frame/layer-frame"

import NavigatorBar from "../component/set/navigator-bar"

import DropdownHeader from "../component/part/dropdown-header"

import LoginBox from "../component/complex/login-box"

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
