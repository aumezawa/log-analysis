import * as React from "react"
import { useState, useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import uniqueId from "../../lib/uniqueId"

import ModalFrame from "../frame/modal-frame"

import ButtonSet from "../set/button-set"

import ListForm from "../part/list-form"

type ProjectSelectButtonProps = {
  className?: string,
  domain?   : string,
  onSubmit? : (value: string) => void
}

const ProjectSelectButton = React.memo<ProjectSelectButtonProps>(({
  className = "",
  domain    = null,
  onSubmit  = undefined
}) => {
  const [project, setProject] = useState<string>(null)
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const id = useRef({
    modal: "modal-" + uniqueId()
  })

  const data = useRef({
    project: null,
    projects: []
  })

  useEffect(() => {
    data.current.project = null
    setProject(null)
  }, [domain])

  const handleClick = useCallback(() => {
    const uri = `${ location.protocol }//${ location.host }/api/v1/log/${ domain }/projects`
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
      return
    })
  }, [domain])

  const handleChange = useCallback((value: string) => {
    data.current.project = value
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
        body={
          <ListForm
            labels={ data.current.projects }
            onChange={ handleChange }
          />
        }
        foot={
          <ButtonSet
            cancel="Close"
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
