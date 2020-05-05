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
  <div className={ `${ className } flex-container-column` }>
    <div className="mt-2 mb-1">
      { head }
    </div>
    <div className="flex-main-area mt-1 mb-2">
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
