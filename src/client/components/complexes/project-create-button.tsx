import * as React from "react"
import { useRef } from "react"

import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import ProjectCreateBox from "../complexes/project-create-box"

type ProjectCreateButtonProps = {
  className?: string,
  domain?   : string
}

const ProjectCreateButton = React.memo<ProjectCreateButtonProps>(({
  className = "",
  domain    = null
}) => {
  const id = useRef({
    modal: "modal-" + UniqueId()
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
