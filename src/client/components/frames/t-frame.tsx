import * as React from "react"

type TFrameProps = {
  className?: string,
  head?     : JSX.Element,
  left?     : JSX.Element,
  right?    : JSX.Element,
  overflowL?: boolean,
  overflowR?: boolean,
  hiddenL?  : boolean,
  hiddenR?  : boolean,
  border?   : boolean
}

const TFrame: React.FC<TFrameProps> = ({
  className = "",
  head      = <></>,
  left      = <></>,
  right     = <></>,
  overflowL = true,
  overflowR = true,
  hiddenL   = false,
  hiddenR   = false,
  border    = false
}) => (
  <div className={ `flex-container-column ${ className }` }>
    <div className="flex-area-top">
      { head }
    </div>
    <div className="flex-main-area flex-area-bottom">
      <div className="flex-main-inner">
        <div className="grid-container-center row">
          <div className={ `grid-area-left ${ hiddenL && "d-none" } ${ !hiddenR ? "col-3" : "col-12" } ${ overflowL && "grid-area-overflow" } ${ border && !hiddenR && "border-right" }` }>
            { left }
          </div>
          <div className={ `grid-area-right ${ hiddenR && "d-none" } ${ !hiddenL ? "col-9" : "col-12" } ${ overflowR && "grid-area-overflow" } ${ border && !hiddenL && "border-left" }` }>
            { right }
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default TFrame
