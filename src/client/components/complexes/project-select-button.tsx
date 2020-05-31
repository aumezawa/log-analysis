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
  className?    : string,
  domain?       : string,
  defaultValue? : string,
  onSubmit?     : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className     = "",
  domain        = null,
  defaultValue  = null,
  onSubmit      = undefined
}) => {
  const [project, setProject] = useState<string>(null)
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + UniqueId()
  })

  const data = useRef({
    filter  : "",
    project : null,
    projects: []
  })

  useEffect(() => {
    if (domain && defaultValue) {
      data.current.project = defaultValue
      setProject(defaultValue)
    } else {
      data.current.project = null
      setProject(null)
    }
  }, [domain, defaultValue])

  const filter = useCallback((label: string) => {
    return label.includes(data.current.filter)
  }, [true])

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

  const handleChange = useCallback((value: string) => {
    data.current.project = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit && data.current.project) {
      onSubmit(data.current.project)
    }
    setProject(data.current.project)
  }, [onSubmit])

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
              labels={ data.current.projects.map((project: any) => (project.name)) }
              titles={ data.current.projects.map((project: any) => (project.description)) }
              filter={ filter }
              onChange={ handleChange }
            />
          </>
        }
        foot={
          <ButtonSet
            cancel="Close"
            valid={ !!data.current.project }
            dismiss="modal"
            onSubmit={ handleSubmit }
          />
        }
      />
      <button
        className={ `btn ${ (project && "btn-success") || "btn-secondary" }` }
        type="button"
        disabled={ !["public", "private"].includes(domain) }
        data-toggle="modal"
        data-target={ "#" + id.current.modal }
        onClick={ handleClick }
      >
        { project || "Select Project" }
      </button>
    </>
  )
})

export default ProjectSelectButton
