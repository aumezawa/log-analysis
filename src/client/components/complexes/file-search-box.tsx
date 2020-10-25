import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import * as Cookie from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"

import TextForm from "../parts/text-form"
import FileTreeRoot from "../sets/file-tree-root"
import DropdownItem from "../parts/dropdown-item"

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

  const ref = useRef({
    text  : React.createRef<HTMLInputElement>()
  })

  const data = useRef({
    searchable: false,
    searchtext: "",
    done      : true,
    files : {
      name    : "",
      file    : false,
      children: []
    }
  })

  useEffect(() => {
    data.current.searchable = false
    data.current.searchtext = ref.current.text.current.value = ""
    data.current.done = true
    data.current.files = {
      name    : "",
      file    : false,
      children: []
    }
    forceUpdate()
  }, [path])

  const handleChangeText = useCallback((value: string) => {
    data.current.searchable = (value.length >= 2)
    data.current.searchtext = value
    forceUpdate()
  }, [true])

  const handleClickSubmit = useCallback(() => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }?search=${ encodeURI(data.current.searchtext) }`

    data.current.done = false
    forceUpdate()
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookie.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.files = res.data.files
      data.current.done = true
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
      forceUpdate()
      alert(err.response.data.msg)
      return
    })
  }, [path])

  const handleClickView = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("view", Escape.root(parentValue), { search: data.current.searchtext })
    }
  }, [onSelect])

  const handleClickTerminal = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("terminal", Escape.root(parentValue), null)
    }
  }, [onSelect])

  const handleClickDownload = useCallback((targetValue: string, parentValue: string) => {
    const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }/${ Escape.root(parentValue) }?mode=download`
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
    <div className={ `${ className } text-left text-monospace` }>
      <TextForm
        ref={ ref.current.text }
        className="mb-3"
        label="Search"
        button="Go"
        valid={ data.current.searchable }
        disabled={ !path || !data.current.done }
        onChange={ handleChangeText }
        onSubmit={ handleClickSubmit }
      />
      <FileTreeRoot
        root={ data.current.files }
        filter="FILEONLY"
        actions={ [
          <DropdownItem
            key="view"
            label="view"
            onClick={ handleClickView }
          />,
          <DropdownItem
            key="terminal"
            label="legacy view"
            onClick={ handleClickTerminal }
          />,
          <DropdownItem
            key="download"
            label="download"
            onClick={ handleClickDownload }
          />
        ] }
      />
    </div>
  )
})

export default FileSearchBox
