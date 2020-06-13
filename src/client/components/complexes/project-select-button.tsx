import * as React from "react"
import { useState, useEffect, useRef, useCallback, useReducer } from "react"

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
  onSubmit? : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className = "",
  domain    = null,
  project   = null,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    filter      : "",
    project     : null,
    projectName : null,
    projects    : []
  })

  useEffect(() => {
    if (domain && project) {
      data.current.project = project
      data.current.projectName = project
      forceUpdate()
    } else {
      data.current.project = null
      data.current.projectName = null
      forceUpdate()
    }
  }, [domain, project])

  const handleChangeFilter = useCallback((value: string) => {
    data.current.filter = value
    forceUpdate()
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
    data.current.project = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.project)
    }
    data.current.projectName = data.current.project
    forceUpdate()
  }, [onSubmit])

  const listLabel = () => (
    data.current.projects.filter((project: ProjectInfo) => (
      project.name.includes(data.current.filter) || project.description.includes(data.current.filter)
    )).map((project: ProjectInfo) => (
      project.name
    ))
  )

  const listTitle = () => (
    data.current.projects.filter((project: ProjectInfo) => (
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
            valid={ !!data.current.project }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ className } ${ data.current.projectName ? "btn-success" : "btn-secondary" }` }
        type="button"
        disabled={ !["public", "private"].includes(domain) }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
        onClick={ handleClick }
      >
        { data.current.projectName || "Select Project" }
      </button>
    </>
  )
})

export default ProjectSelectButton
