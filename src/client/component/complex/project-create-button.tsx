import * as React from "react"
import { useRef } from "react"

import uniqueId from "../../lib/uniqueId"

import ProjectCreateBox from "../complex/project-create-box"

import ModalFrame from "../frame/modal-frame"

type ProjectCreateButtonProps = {
  className?: string,
  domain?   : string
}

const ProjectCreateButton = React.memo<ProjectCreateButtonProps>(({
  className = "",
  domain    = null
}) => {
  const id = useRef({
    modal: "modal-" + uniqueId()
  })

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Project"
        message="Create a project."
        body={
          <ProjectCreateBox
            domain={ domain }
          />
        }
      />
      <button
        className="btn btn-info"
        type="button"
        disabled={ !["public", "private"].includes(domain) }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
      >
        { "New Project" }
      </button>
    </>
  )
})

export default ProjectCreateButton
