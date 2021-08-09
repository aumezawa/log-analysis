import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"
import { Clock, Display, Download, Fonts, Terminal } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import LayerFrame from "../frames/layer-frame"
import TextForm from "../parts/text-form"
import MultiDateForm from "../sets/multi-date-form"
import FileTreeRoot from "../sets/file-tree-root"
import DropdownItem from "../parts/dropdown-item"
import Spinner from "../parts/spinner"

type FileSearchBoxProps = {
  className?: string,
  path?     : string,
  onSelect? : (action: string, value: string, option: any) => void
}

const FileSearchBox = React.memo<FileSearchBoxProps>(({
  className = "",
  path      = null,
  onSelect  = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const refs = useRef({
    text  : React.createRef<HTMLInputElement>(),
    date  : useRef({} as MultiDateFormReference)
  })

  const data = useRef({
    searchmode: "text",
    searchable: false,
    searchtext: "",
    searchfrom: null,
    searchto  : null,
    done      : true,
    files : {
      name    : "",
      file    : false,
      children: []
    }
  })

  const status = useRef({
    processing: false
  })

  useEffect(() => {
    data.current.searchable = false
    data.current.searchtext = refs.current.text.current.value = ""
    data.current.done = true
    data.current.files = {
      name    : "",
      file    : false,
      children: []
    }
    forceUpdate()
  }, [path])

  const handleChangeMode = useCallback(() => {
    data.current.searchmode = (data.current.searchmode === "text") ? "date" : "text"
    data.current.searchable = false
    data.current.searchtext = ""
    data.current.searchfrom = null
    data.current.searchto   = null
    data.current.files = {
      name    : "",
      file    : false,
      children: []
    }
    forceUpdate()
  }, [true])

  const handleChangeText = useCallback((value: string) => {
    data.current.searchable = (value.length >= 2)
    data.current.searchtext = value
    forceUpdate()
  }, [true])

  const handleChangeDate = useCallback((from: string, to: string) => {
    data.current.searchable = (!!from || !!to)
    data.current.searchfrom = from
    data.current.searchto   = to
    forceUpdate()
  }, [true])

  const handleClickSubmit = useCallback(() => {
    let uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }`
    if (data.current.searchmode === "text") {
      uri = uri + `?search=${ encodeURIComponent(data.current.searchtext) }`
    }
    if (data.current.searchmode === "date") {
      let param = "?"
      if (data.current.searchfrom) {
        uri = uri + `${ param }date_from=${ encodeURIComponent(data.current.searchfrom) }`
        param = "&"
      }
      if (data.current.searchto) {
        uri = uri + `${ param }date_to=${ encodeURIComponent(data.current.searchto) }`
      }
    }

    data.current.done = false
    status.current.processing = true
    forceUpdate()
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.files = res.data.files
      data.current.done = true
      status.current.processing = false
      forceUpdate()
      return
    })
    .catch((err: AxiosError) => {
      data.current.done = true
      data.current.files = {
        name    : "",
        file    : false,
        children: []
      }
      status.current.processing = false
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [path])

  const handleClickView = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("view", Escape.root(parentValue), {
        search    : data.current.searchtext,
        data_from : data.current.searchfrom,
        data_to   : data.current.searchto
      })
    }
  }, [onSelect])

  const handleClickTerminal = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("terminal", Escape.root(parentValue), null)
    }
  }, [onSelect])

  const handleClickDownload = useCallback((targetValue: string, parentValue: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }/${ Escape.root(parentValue) }?mode=download&gzip=true`
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {},
      responseType: "blob"
    })
    .then((res: AxiosResponse) => {
      const blob = new Blob([res.data], { type: res.data.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      let filename: string
      const match = res.headers["content-disposition"].match(/filename="(.*)"(;|$)/)
      if (match) {
        filename = match[1]
        const matchUTF8 = res.headers["content-disposition"].match(/filename[*]=UTF-8''(.*)(;|$)/)
        if (matchUTF8) {
          filename = decodeURIComponent(matchUTF8[1])
        }
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      return
    })
    .catch((err: AxiosError) => {
      return
    })
  }, [path])

  return (
    <LayerFrame
      className={ `${ className } text-left text-monospace` }
      head={
        <>
          { data.current.searchmode === "text" &&
            <TextForm
              ref={ refs.current.text }
              className="mb-2"
              label={ <Fonts /> }
              button={ <Search /> }
              valid={ data.current.searchable }
              disabled={ !path || !data.current.done }
              onChange={ handleChangeText }
              onSubmit={ handleClickSubmit }
              onSubChange={ handleChangeMode }
            />
          }
          { data.current.searchmode === "date" &&
            <MultiDateForm
              ref={ refs.current.date }
              className="mb-2"
              label={ <Clock /> }
              button={ <Search /> }
              valid={ data.current.searchable }
              disabled={ !path || !data.current.done }
              onChange={ handleChangeDate }
              onSubmit={ handleClickSubmit }
              onSubChange={ handleChangeMode }
            />
          }
        </>
      }
      body={
        <>
          {  status.current.processing && <Spinner /> }
          { !status.current.processing &&
            <FileTreeRoot
              root={ data.current.files }
              filter="FILEONLY"
              actions={ [
                <DropdownItem
                  key="view"
                  label="view"
                  LIcon={ Display }
                  onClick={ handleClickView }
                />,
                <DropdownItem
                  key="terminal"
                  label="legacy view"
                  LIcon={ Terminal }
                  onClick={ handleClickTerminal }
                />,
                <DropdownItem
                  key="download"
                  label="download"
                  LIcon={ Download }
                  onClick={ handleClickDownload }
                />
              ] }
            />
          }
        </>
      }
    />
  )
})

export default FileSearchBox
