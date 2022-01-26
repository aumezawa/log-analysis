import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type ProjectSelectModalProps = {
  privilege?: string,
  id        : string,
  domain?   : string,
  action?   : string,   // NOTE: "open" | "delete" | "reopen" | "close"
  reload?   : number,
  onSubmit? : (projectName: string) => void
}

const ProjectSelectModal = React.memo<ProjectSelectModalProps>(({
  privilege = "none",
  id        = null,
  domain    = null,
  action    = "open",
  reload    = 0,
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    text  : React.createRef<HTMLInputElement>(),
    list  : useRef({} as ListFormReference)
  })

  const data = useRef({
    filter      : "",
    project     : null,
    projects    : []
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    if (privilege === "none") {
      return
    }
    reloadProject()
    data.current.filter = refs.current.text.current.value = ""
    data.current.project = null
    refs.current.list.current.clear()
  }, [privilege, domain, action, reload])

  const reloadProject = useCallback(() => {
    if (domain) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain) }/projects`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.projects = res.data.projects
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.projects = []
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    } else {
      data.current.projects = []
      forceUpdate()
    }
  }, [domain])

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleSelectProject = useCallback((value: string) => {
    data.current.project = value.split(" ")[0]
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (action === "open") {
      if (onSubmit) {
        onSubmit(data.current.project)
      }
      return
    }

    const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, data.current.project) }`
    status.current.processing = true
    forceUpdate()

    if (action === "delete") {
      Axios.delete(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.project)
        }
        data.current.project = null
        status.current.processing = false
        reloadProject()
        return
      })
      .catch((err: Error | AxiosError) => {
        status.current.processing = false
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    }

    if (action === "reopen" || action === "close") {
      Axios.put(uri, {
        status  : (action === "reopen") ? "open" : "close"
      }, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.project)
        }
        data.current.project = null
        status.current.processing = false
        reloadProject()
        return
      })
      .catch((err: Error | AxiosError) => {
        status.current.processing = false
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    }
  }, [domain, action, onSubmit])

  const listLabel = () => (
    data.current.projects.filter((project: ProjectInfo) => (
      (action === "open" && project.status === "open")
      || (action === "delete")
      || (action === "reopen" && project.status === "close")
      || (action === "close" && project.status === "open")
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
      size="modal-lg"
      center={ false }
      body={
        <>
          <TextForm
            ref={ refs.current.text }
            className="mb-3"
            label={ <Search /> }
            valid={ true }
            onChange={ handleChangeFilter }
          />
          <ListForm
            ref={ refs.current.list }
            labels={ listLabel() }
            onChange={ handleSelectProject }
          />
        </>
      }
      foot={
        <ButtonSet
          submit={ `${ action.charAt(0).toUpperCase() + action.slice(1) } Project` }
          cancel="Close"
          valid={ data.current.project && !status.current.processing }
          dismiss="modal"
          keep={ action !== "open" }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default ProjectSelectModal
