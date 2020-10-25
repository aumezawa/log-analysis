import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"
import UniqueId from "../../lib/unique-id"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type ProjectSelectButtonProps = {
  className?: string,
  domain?   : string,
  project?  : string,
  status?   : string,
  onSubmit? : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className = "",
  domain    = null,
  project   = null,
  status    = "open",
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const ref = useRef({
    text  : React.createRef<HTMLInputElement>()
  })

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    filter      : "",
    project     : null,
    projects    : []
  })

  const input = useRef({
    project     : null
  })

  useEffect(() => {
    data.current.filter = ref.current.text.current.value = ""
    data.current.project = (domain && project) ? project : null
    input.current.project = null
    forceUpdate()
  }, [domain, project])

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleClick = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain) }/projects`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.projects = res.data.projects
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      data.current.projects = []
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [domain])

  const handleSelectProject = useCallback((value: string) => {
    input.current.project = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    data.current.project = input.current.project
    if (onSubmit) {
      onSubmit(data.current.project)
    }
    forceUpdate()
  }, [onSubmit])

  const listLabel = () => (
    data.current.projects.filter((project: ProjectInfo) => (
      project.status === status
    )).filter((project: ProjectInfo) => (
      project.name.includes(data.current.filter) || project.description.includes(data.current.filter)
    )).map((project: ProjectInfo) => (
      project.name
    ))
  )

  const listTitle = () => (
    data.current.projects.filter((project: ProjectInfo) => (
      project.status === status
    )).filter((project: ProjectInfo) => (
      project.name.includes(data.current.filter) || project.description.includes(data.current.filter)
    )).map((project: ProjectInfo) => (
      project.description
    ))
  )

  return (
    <>
      <ModalFrame
        id={ id.current.modal }
        title="Project"
        message="Select a project."
        center={ false }
        body={
          <>
            <TextForm
              ref={ ref.current.text }
              className="mb-3"
              valid={ true }
              label="Filter"
              onChange={ handleChangeFilter }
            />
            <ListForm
              labels={ listLabel() }
              titles={ listTitle() }
              onChange={ handleSelectProject }
            />
          </>
        }
        foot={
          <ButtonSet
            submit="Select"
            cancel="Close"
            valid={ !!input.current.project }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ className } ${ data.current.project ? "btn-success" : "btn-secondary" }` }
        type="button"
        disabled={ !["public", "private"].includes(domain) }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
        onClick={ handleClick }
      >
        { data.current.project || "Select Project" }
      </button>
    </>
  )
})

export default ProjectSelectButton
