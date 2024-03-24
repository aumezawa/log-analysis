import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"
import { NodePlus } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path-stats"

import ModalFrame from "../frames/modal-frame"
import TabFrame from "../frames/tab-frame"
import LayerFrame from "../frames/layer-frame"
import TextForm from "../parts/text-form"
import ListForm from "../parts/list-form"
import ButtonSet from "../sets/button-set"

type StatsSelectModalProps = {
  id        : string,
  domain    : string,
  project   : string,
  stats     : string,
  counter   : string,
  onSubmit? : (counter: string) => void
}

const StatsSelectModal = React.memo<StatsSelectModalProps>(({
  id        = "",
  domain    = "",
  project   = "",
  stats     = "",
  counter   = "",
  onSubmit  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    main    : React.createRef<HTMLAnchorElement>(),
    sub     : React.createRef<HTMLAnchorElement>(),
    counter : React.createRef<HTMLAnchorElement>(),
    text1   : React.createRef<HTMLInputElement>(),
    text2   : React.createRef<HTMLInputElement>(),
    text3   : React.createRef<HTMLInputElement>(),
    list1   : useRef({} as ListFormReference),
    list2   : useRef({} as ListFormReference),
    list3   : useRef({} as ListFormReference)
  })

  const data = useRef({
    group       : "",
    subgroup    : "",
    counter     : "",
    filter1     : "",
    filter2     : "",
    filter3     : "",
    counterInfo : {} as CounterInfo
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    data.current.group = ""
    data.current.subgroup = ""
    data.current.counter = ""
    data.current.filter1 = refs.current.text1.current!.value = ""
    data.current.filter2 = refs.current.text2.current!.value = ""
    data.current.filter3 = refs.current.text3.current!.value = ""
    refs.current.list1.current.clear()
    refs.current.list2.current.clear()
    refs.current.list3.current.clear()

    if (domain && project && stats) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, stats) }/counters?option=zonzero`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.counterInfo = (res.data.counters as CounterInfo)
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.counterInfo = {}
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        forceUpdate()
        return
      })
    } else {
      data.current.counterInfo = {}
      forceUpdate()
    }
  }, [domain, project, stats])

  useEffect(() => {
    forceUpdate()
  }, [counter])

  const handleChangeFilter1 = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter1 = value
      forceUpdate()
    }
  }, [true])

  const handleChangeFilter2 = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter2 = value
      forceUpdate()
    }
  }, [true])

  const handleChangeFilter3 = useCallback((value: string) => {
    if (value.length !== 1) {
      data.current.filter3 = value
      forceUpdate()
    }
  }, [true])

  const handleSelectGroup = useCallback((value: string) => {
    data.current.group = value
    data.current.subgroup = ""
    data.current.counter = ""
    data.current.filter2 = refs.current.text2.current!.value = ""
    data.current.filter3 = refs.current.text3.current!.value = ""
    refs.current.list2.current.clear()
    refs.current.list3.current.clear()
    forceUpdate()
  }, [true])

  const handleSelectSubGroup = useCallback((value: string) => {
    data.current.subgroup = value
    data.current.counter = ""
    data.current.filter3 = refs.current.text3.current!.value = ""
    refs.current.list3.current.clear()
    forceUpdate()
  }, [true])

  const handleSelectCounter = useCallback((value: string) => {
    data.current.counter = `${ data.current.group }->${ data.current.subgroup }->${ value }`
    forceUpdate()
  }, [true])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(data.current.counter)
    }
  }, [onSubmit])

  const listLabel1 = () => {
    if (!data.current.counterInfo) {
      return []
    }
    return Object.keys(data.current.counterInfo).filter((val: string) => (val.toUpperCase().includes(data.current.filter1.toUpperCase())))
  }

  const listLabel2 = () => {
    if (!data.current.counterInfo || !data.current.group) {
      return []
    }
    return Object.keys(data.current.counterInfo[data.current.group]).filter((val: string) => (val.toUpperCase().includes(data.current.filter2.toUpperCase())))
  }

  const listLabel3 = () => {
    if (!data.current.counterInfo || !data.current.group || !data.current.subgroup) {
      return []
    }
    return data.current.counterInfo[data.current.group][data.current.subgroup].filter((val: string) => (val.toUpperCase().includes(data.current.filter3.toUpperCase())))
  }

  return (
    <ModalFrame
      id={ id }
      title="Counter"
      message="Select to add a counter."
      size="modal-lg"
      center={ false }
      body={
        <TabFrame
          className="text-left text-monospace"
          labels={ ["Group", "Sub Group", "Counter"] }
          LIcons={ [NodePlus, NodePlus, NodePlus] }
          items={ [
            <LayerFrame
              head={
                <TextForm
                  ref={ refs.current.text1 }
                  className="mb-2"
                  label={ <Search /> }
                  valid={ true }
                  onChange={ handleChangeFilter1 }
                />
              }
              body={
                <ListForm
                  ref={ refs.current.list1 }
                  labels={ listLabel1() }
                  onChange={ handleSelectGroup }
                />
              }
              inmodal={ true }
            />,
            <LayerFrame
              head={
                <TextForm
                  ref={ refs.current.text2 }
                  className="mb-2"
                  label={ <Search /> }
                  valid={ true }
                  onChange={ handleChangeFilter2 }
                />
              }
              body={
                <ListForm
                  ref={ refs.current.list2 }
                  labels={ listLabel2() }
                  onChange={ handleSelectSubGroup }
                />
              }
              inmodal={ true }
            />,
            <LayerFrame
              head={
                <TextForm
                  ref={ refs.current.text3 }
                  className="mb-2"
                  label={ <Search /> }
                  valid={ true }
                  onChange={ handleChangeFilter3 }
                />
              }
              body={
                <ListForm
                  ref={ refs.current.list3 }
                  labels={ listLabel3() }
                  onChange={ handleSelectCounter }
                />
              }
              inmodal={ true }
            />
          ] }
          refs={ [refs.current.main, refs.current.sub, refs.current.counter] }
          inmodal={ true }
        />
      }
      foot={
        <ButtonSet
          submit="Add Counter"
          cancel="Cancel"
          valid={ !!data.current.counter && (!counter || !counter.split(",").includes(data.current.counter)) && !status.current.processing }
          dismiss="modal"
          onSubmit={ handleSubmit }
        />
      }
    />
  )
})

export default StatsSelectModal
