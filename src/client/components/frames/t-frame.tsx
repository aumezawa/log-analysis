import * as React from "react"

type TFrameProps = {
  className?: string,
  head?     : JSX.Element,
  left?     : JSX.Element,
  right?    : JSX.Element,
  overflowL?: boolean,
  overflowR?: boolean,
  border?   : boolean
}

const TFrame: React.FC<TFrameProps> = ({
  className = "",
  head      = <></>,
  left      = <></>,
  right     = <></>,
  overflowL = true,
  overflowR = true,
  border    = false
}) => (
  <div className={ `flex-container-column ${ className }` }>
    <div className="flex-area-top">
      { head }
    </div>
    <div className="flex-main-area flex-area-bottom">
      <div className="flex-main-inner">
        <div className="grid-container-center row">
          <div className={ `grid-area-left col-3 ${ overflowL && "grid-area-overflow" } ${ border && "border-right" }` }>
            { left }
          </div>
          <div className={ `grid-area-right col-9 ${ overflowR && "grid-area-overflow" } ${ border && "border-left" }` }>
            { right }
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default TFrame
