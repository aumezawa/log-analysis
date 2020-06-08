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

type ProjectDeleteModalProps = {
  id        : string,
  className?: string,
  domain?   : string,
  reload?   : number,
  onSubmit? : (value: string) => void
}

const ProjectDeleteModal = React.memo<ProjectDeleteModalProps>(({
  id        = null,
  className = "",
  domain    = null,
  reload    = 0,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    doing   : false,
    filter  : "",
    project : null,
    projects: []
  })

  useEffect(() => {
    reloadProject()
  }, [reload])

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
        data.current.projects = []
        forceUpdate()
        alert(err.response.data.msg)
        return
      })
    }
  }

  const handleChangeFilter = useCallback((value: string) => {
    data.current.filter = value
    forceUpdate()
  }, [true])

  const handleSelectProject = useCallback((value: string) => {
    data.current.project = value
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    data.current.doing = true
    forceUpdate()
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, data.current.project) }`
    Axios.delete(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      if (onSubmit) {
        onSubmit(data.current.project)
      }
      data.current.project = null
      data.current.doing = false
      reloadProject()
      return
    })
    .catch((err: AxiosError) => {
      data.current.doing = false
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [domain, onSubmit])

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
    <ModalFrame
      id={ id }
      title="Project"
      message="Select to delete a project."
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
          submit="Delete"
          cancel="Close"
          valid={ !!data.current.project && !data.current.doing }
          dismiss="modal"
          keep={ true }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default ProjectDeleteModal
