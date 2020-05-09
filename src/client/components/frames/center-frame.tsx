import * as React from "react"

type CenterFrameProps = {
  className?: string,
  body?     : JSX.Element,
  overflow? : boolean
}

const CenterFrame: React.FC<CenterFrameProps> = ({
  className = "",
  body      = <></>,
  overflow  = true
}) => (
  <div className={ `${ className } grid-container-center row` }>
    <div className={ `grid-area col-6 ${ overflow && "grid-area-overflow" }` }>
      { body }
    </div>
  </div>
)

export default CenterFrame
