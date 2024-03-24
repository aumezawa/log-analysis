import * as React from "react"

import HostInfoBox from "../../../components/specifics/vmlog/host-info-box"
import VCenterInfoBox from "../../../components/specifics/vmlog/vcenter-info-box"

type ServerInfoBoxProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  type?     : string,
  bundle?   : string,
  hosts?    : string
}

const ServerInfoBox = React.memo<ServerInfoBoxProps>(({
  className = "px-2",
  domain    = "",
  project   = "",
  bundle    = "",
  type      = "",
  hosts     = ""
}) => (
  <>
    { type === "vm-support" &&
      <HostInfoBox
        className={ className }
        domain={ domain }
        project={ project }
        bundle={ bundle }
        hosts={ hosts }
      />
    }
    { type === "vc-support" &&
      <VCenterInfoBox
        className={ className }
        domain={ domain }
        project={ project }
        bundle={ bundle }
      />
    }
  </>
))

export default ServerInfoBox
