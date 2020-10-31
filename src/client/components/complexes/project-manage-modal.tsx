import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type ProjectManageModalProps = {
  id        : string,
  domain?   : string,
  action?   : string,   // NOTE: "delete" | "open" | "close"
  reload?   : number,
  onSubmit? : (value: string) => void
}

const ProjectManageModal = React.memo<ProjectManageModalProps>(({
  id        = null,
  domain    = null,
  action    = "delete",
  reload    = 0,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const ref = useRef({
    text  : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    processing: false,
    filter    : "",
    project   : null,
    projects  : []
  })

  useEffect(() => {
    reloadProject()
  }, [reload])

  useEffect(() => {
    data.current.filter = ref.current.text.current.value = ""
    data.current.project = null
    data.current.projects = []
  }, [domain])

  const reloadProject = () => {
    if (domain) {
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
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      forceUpdate()
    }
  }

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleSelectProject = useCallback((value: string) => {
    data.current.project = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, data.current.project) }`

    data.current.processing = true
    forceUpdate()

    if (action === "delete") {
      Axios.delete(uri, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.project)
        }
        data.current.project = null
        data.current.processing = false
        reloadProject()
        return
      })
      .catch((err: AxiosError) => {
        data.current.processing = false
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    } else {
      Axios.put(uri, {
        status  : action
      }, {
        headers : { "X-Access-Token": Cookie.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.project)
        }
        data.current.project = null
        data.current.processing = false
        reloadProject()
        return
      })
      .catch((err: AxiosError) => {
        data.current.processing = false
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    }
  }, [domain, action, onSubmit])

  const listLabel = () => (
    data.current.projects.filter((project: ProjectInfo) => (
      (action === "delete") || (action !== project.status)
    )).filter((project: ProjectInfo) => (
      project.name.includes(data.current.filter) || project.description.includes(data.current.filter)
    )).map((project: ProjectInfo) => (
      project.name + ((!!project.description) ? ` [ ${ project.description } ]` : "")
    ))
  )

  return (
    <ModalFrame
      id={ id }
      title="Project"
      message={ `Select to ${ action } a project.` }
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
            onChange={ handleSelectProject }
          />
        </>
      }
      foot={
        <ButtonSet
          submit={ `${ action.charAt(0).toUpperCase() + action.slice(1) } Project` }
          cancel="Close"
          valid={ !!data.current.project && !data.current.processing }
          dismiss="modal"
          keep={ true }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default ProjectManageModal
