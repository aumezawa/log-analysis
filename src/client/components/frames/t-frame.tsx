import * as React from "react"

type TFrameProps = {
  className?: string,
  head?     : JSX.Element,
  left?     : JSX.Element,
  right?    : JSX.Element,
  overflowL?: boolean,
  overflowR?: boolean
}

const TFrame: React.FC<TFrameProps> = ({
  className = "",
  head      = <></>,
  left      = <></>,
  right     = <></>,
  overflowL = true,
  overflowR = true
}) => (
  <div className={ `flex-container-column ${ className }` }>
    <div className="flex-area-top">
      { head }
    </div>
    <div className="flex-main-area flex-area-bottom">
      <div className="flex-main-inner">
        <div className="grid-container-center row">
          <div className={ `grid-area-left col-3 ${ overflowL && "grid-area-overflow" }` }>
            { left }
          </div>
          <div className={ `grid-area-right col-9 ${ overflowR && "grid-area-overflow" }` }>
            { right }
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default TFrame
