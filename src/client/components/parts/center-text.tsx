import * as React from "react"

type CenterTextProps = {
  text?     : string
}

const CenterText = React.memo<CenterTextProps>(({
  text      = ""
}) => (
  <div className="flex-container-column justify-content-center">
    <div className="align-self-center text-center text-monospace">
      { text }
    </div>
  </div>
))

export default CenterText
