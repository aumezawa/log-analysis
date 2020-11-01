import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { CaretRight, CaretRightFill, Dot } from "react-bootstrap-icons"

import DomainSelectButton from "../complexes/domain-select-button"
import ProjectCreateButton from "../complexes/project-create-button"
import ProjectSelectButton from "../complexes/project-select-button"
import BundleUploadButton from "../complexes/bundle-upload-button"
import BundleSelectButton from "../complexes/bundle-select-button"
import InformationButton from "../parts/information-button"

type ProjectNavigatorProps = {
  domains         : string,
  domain          : string,
  project         : string,
  bundle          : string,
  filename        : string,
  onChangeDomain  : (value: string) => void,
  onChangeProject : (value: string) => void,
  onChangeBundle  : (value: string) => void
}

const ProjectNavigator = React.memo<ProjectNavigatorProps>(({
  domains         = "public,private",
  domain          = null,
  project         = null,
  bundle          = null,
  filename        = null,
  onChangeDomain  = undefined,
  onChangeProject = undefined,
  onChangeBundle  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const doneProject   = (domain &&  project)
  const borderProject = (domain && !project)            ? "border border-info" : ""
  const borderBundle  = (domain &&  project && !bundle) ? "border border-info" : ""

  const handleChangeDomain = useCallback((value: string) => {
    if (onChangeDomain) {
      onChangeDomain(value)
    }
  }, [onChangeDomain])

  const handleChangeProject = useCallback((value: string) => {
    if (onChangeProject) {
      onChangeProject(value)
    }
  }, [onChangeProject])

  const handleChangeBundle = useCallback((value: string) => {
    if (onChangeBundle) {
      onChangeBundle(value)
    }
  }, [onChangeBundle])

  return (
    <div className="flex-container-row align-items-center">
      <div className="borderable">
        <DomainSelectButton
          domains={ domains }
          domain={ domain }
          onSubmit={ handleChangeDomain }
        />
      </div>
      <CaretRightFill />
      <div className={ `${ borderProject } borderable` }>
        <ProjectCreateButton
          domain={ domain }
        />
        <Dot />
        <ProjectSelectButton
          domain={ domain }
          project={ project }
          onSubmit={ handleChangeProject }
        />
      </div>
      { !doneProject ? <CaretRight /> : <CaretRightFill /> }
      <div className={ `${ borderBundle } borderable` }>
        <BundleUploadButton
          domain={ domain }
          project={ project }
        />
        <Dot />
        <BundleSelectButton
          domain={ domain }
          project={ project }
          bundle={ bundle }
          onSubmit={ handleChangeBundle }
        />
      </div>
      { filename &&
        <>
          <CaretRightFill />
          <div className="borderable">
            <InformationButton
              label={ filename }
            />
          </div>
        </>
      }
    </div>
  )
})

export default ProjectNavigator
