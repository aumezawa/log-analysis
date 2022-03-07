import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path-stats"

import ModalFrame from "../frames/modal-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type StatsSelectModalProps = {
  id        : string,
  domain?   : string,
  project?  : string,
  stats?    : string,
  action?   : string,   // NOTE: "open" | "delete" | "download"
  reload?   : number,
  onSubmit? : (statsId: string, statsName: string) => void,
  onUpdate? : (statsName: string) => void
}

const StatsSelectModal = React.memo<StatsSelectModalProps>(({
  id        = null,
  domain    = null,
  project   = null,
  stats     = null,
  action    = "open",
  reload    = 0,
  onSubmit  = undefined,
  onUpdate  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    text  : React.createRef<HTMLInputElement>(),
    list  : useRef({} as ListFormReference)
  })

  const data = useRef({
    filter      : "",
    statsId     : null,
    statsName   : null,
    statsList   : []
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    reloadStats()
    data.current.filter = refs.current.text.current.value = ""
    data.current.statsId = null
    data.current.statsName = null
    refs.current.list.current.clear()
  }, [domain, project, reload])

  useEffect(() => {
    if (domain && project && stats) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, stats) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        onUpdate(res.data.name)
        return
      })
      .catch((err: Error | AxiosError) => {
        onSubmit(null, null)
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        return
      })
    }
  }, [domain, project, stats, onSubmit, onUpdate])

  const reloadStats = useCallback(() => {
    if (domain && project) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project) }/stats`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.statsList = res.data.stats
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.statsList = []
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        return
      })
    } else {
      data.current.statsList = []
      forceUpdate()
    }
  }, [domain, project])

  const handleChangeFilter = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter = value
      forceUpdate()
    }
  }, [true])

  const handleSelectStats = useCallback((value: string) => {
    data.current.statsId = data.current.statsList.find((stat: StatsInfo) => (stat.name === value.split(" ")[0])).id.toString()
    data.current.statsName = value.split(" ")[0]
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (action === "open") {
      if (onSubmit) {
        onSubmit(data.current.statsId, data.current.statsName)
      }
      return
    }

    let uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, data.current.statsId) }`
    status.current.processing = true
    forceUpdate()

    if (action === "delete") {
      Axios.delete(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        if (onSubmit) {
          onSubmit(data.current.statsId, data.current.statsName)
        }
        data.current.statsId = null
        data.current.statsName = null
        status.current.processing = false
        reloadStats()
        return
      })
      .catch((err: Error | AxiosError) => {
        if (Axios.isAxiosError(err)) {
          alert(err.response.data.msg)
        } else {
          console.log(err)
        }
        status.current.processing = false
        forceUpdate()
        return
      })
    }

  }, [domain, project, action, onSubmit])

  const listLabel = () => (
    data.current.statsList.filter((stat: StatsInfo) => (
      (action === "open" && stat.available)
      || (action === "delete" && stat.available)
    )).filter((stat: StatsInfo) => (
      (stat.name.includes(data.current.filter) || stat.description.includes(data.current.filter))
    )).map((stat: StatsInfo) => (
      stat.name + ((!!stat.description) ? ` [ ${ stat.description } ]` : "")
    ))
  )

  return (
    <ModalFrame
      id={ id }
      title="Log Bundle"
      message={ `Select to ${ action } a log bundle.` }
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
            onChange={ handleSelectStats }
          />
        </>
      }
      foot={
        <ButtonSet
          submit={ `${ action.charAt(0).toUpperCase() + action.slice(1) } Bundle` }
          cancel="Close"
          valid={ data.current.statsId && !status.current.processing }
          dismiss="modal"
          keep={ action !== "open" }
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default StatsSelectModal
