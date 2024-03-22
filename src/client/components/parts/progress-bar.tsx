import * as React from "react"

type ProgressBarProps = {
  className?: string,
  progress? : number
}


const ProgressBar = React.memo<ProgressBarProps>(({
  className = "",
  progress  = 0
}) => (
  <div className={ `progress ${ className }` }>
    <div
      className={ `progress-bar progress-bar-striped ${ (progress === 100) ? "" : "progress-bar-animated" }` }
      role="progressbar"
      aria-valuenow={ progress }
      aria-valuemin={ 0 }
      aria-valuemax={ 100 }
      style={ { width: progress + "%" } }
    >
    </div>
  </div>
))

export default ProgressBar
