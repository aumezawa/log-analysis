import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Search } from "react-bootstrap-icons"
import { Display, Download, Terminal } from "react-bootstrap-icons"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import Escape from "../../lib/escape"
import * as LocalDate from "../../lib/local-date"

import LayerFrame from "../frames/layer-frame"
import TextForm from "../parts/text-form"
import SwitchForm from "../parts/switch-form"
import DateForm from "../parts/date-form"
import Button from "../parts/button"
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
    text: {
      enable: React.createRef<HTMLInputElement>(),
      input : React.createRef<HTMLInputElement>()
    },
    from: {
      enable: React.createRef<HTMLInputElement>(),
      date  : React.createRef<HTMLInputElement>()
    },
    to: {
      enable: React.createRef<HTMLInputElement>(),
      date  : React.createRef<HTMLInputElement>()
    }
  })

  const data = useRef({
    text: {
      valid   : false,
      enable  : false,
      input   : ""
    },
    from: {
      valid   : false,
      enable  : false,
      date    : LocalDate.now()
    },
    to: {
      valid   : false,
      enable  : false,
      date    : LocalDate.now()
    },
    files : {
      name    : "",
      file    : false,
      children: []
    }
  })

  const status = useRef({
    done      : true,
    processing: false
  })

  useEffect(() => {
    data.current.text.valid = false
    data.current.text.enable = refs.current.text.enable.current.checked = false
    data.current.text.input = refs.current.text.input.current.value = ""
    data.current.from.valid = false
    data.current.from.enable = refs.current.from.enable.current.checked = false
    data.current.to.valid = false
    data.current.to.enable = refs.current.to.enable.current.checked = false
    data.current.files.name = ""
    data.current.files.file = false
    data.current.files.children = []

    status.current.done = true
    status.current.processing = false

    if (path) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path.split("/").slice(0,-1).join("/")) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.from.valid = true
        data.current.from.date = LocalDate.shiftDate(res.data.date, false, 3)
        refs.current.from.date.current.value = LocalDate.toInputFormat(data.current.from.date)
        data.current.to.valid = true
        data.current.to.date = res.data.date
        refs.current.to.date.current.value = LocalDate.toInputFormat(data.current.to.date)
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.from.valid = true
        data.current.from.date = LocalDate.shiftDate(LocalDate.now(), false, 3)
        refs.current.from.date.current.value = LocalDate.toInputFormat(data.current.from.date)
        data.current.to.valid = true
        data.current.to.date = LocalDate.now()
        refs.current.to.date.current.value = LocalDate.toInputFormat(data.current.to.date)
        forceUpdate()
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        return
      })
    } else {
      data.current.from.date = null
      refs.current.from.date.current.value = null
      data.current.to.date = null
      refs.current.to.date.current.value = null
      forceUpdate()
    }
  }, [path])

  const handleChangeCheckText = useCallback((value: boolean) => {
    data.current.text.enable = value
    forceUpdate()
  }, [true])

  const handleChangeCheckFrom = useCallback((value: boolean) => {
    data.current.from.enable = value
    forceUpdate()
  }, [true])

  const handleChangeCheckTo = useCallback((value: boolean) => {
    data.current.to.enable = value
    forceUpdate()
  }, [true])

  const handleChangeText = useCallback((value: string) => {
    data.current.text.valid = (value.length >= 2)
    data.current.text.input = value
    forceUpdate()
  }, [true])

  const handleChangeDateFrom = useCallback((value: string) => {
    data.current.from.valid = LocalDate.isDate(value)
    data.current.from.date = LocalDate.fromInputFormat(value)
    forceUpdate()
  }, [true])

  const handleChangeDateTo = useCallback((value: string) => {
    data.current.to.valid = LocalDate.isDate(value)
    data.current.to.date = LocalDate.fromInputFormat(value)
    forceUpdate()
  }, [true])

  const handleClickSubmit = useCallback(() => {
    let uri = `${ Environment.getBaseUrl() }/api/v1/${ Escape.root(path) }`
    let param = "?"
    if (data.current.text.enable && data.current.text.valid) {
      uri = uri + `${ param }search=${ encodeURIComponent(data.current.text.input) }`
      param = "&"
    }
    if (data.current.from.enable && data.current.from.valid) {
      uri = uri + `${ param }date_from=${ encodeURIComponent(data.current.from.date) }`
      param = "&"
    }
    if (data.current.to.enable && data.current.to.valid) {
      uri = uri + `${ param }date_to=${ encodeURIComponent(data.current.to.date) }`
    }

    status.current.done = false
    status.current.processing = true
    forceUpdate()
    Axios.get(uri, {
      headers : { "X-Access-Token": Cookies.get("token") || "" },
      data    : {}
    })
    .then((res: AxiosResponse) => {
      data.current.files = res.data.files
      status.current.done = true
      status.current.processing = false
      forceUpdate()
      return
    })
    .catch((err: Error | AxiosError) => {
      data.current.files = {
        name    : "",
        file    : false,
        children: []
      }
      status.current.done = true
      status.current.processing = false
      forceUpdate()
      if (Axios.isAxiosError(err)) {
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
      return
    })
  }, [path])

  const handleClickView = useCallback((targetValue: string, parentValue: string) => {
    if (onSelect) {
      onSelect("view", Escape.root(parentValue), {
        search    : (data.current.text.enable) ? data.current.text.input : null,
        data_from : (data.current.from.enable) ? data.current.from.date  : null,
        data_to   : (data.current.to.enable)   ? data.current.to.date    : null
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
      headers : { "X-Access-Token": Cookies.get("token") || "" },
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
    .catch((err: Error | AxiosError) => {
      if (Axios.isAxiosError(err)) {
        alert(err.response.data.msg)
      } else {
        console.log(err)
      }
      return
    })
  }, [path])

  return (
    <LayerFrame
      className={ `${ className } text-left text-monospace` }
      head={
        <>
          <div className="form-row align-items-center mb-2">
            <SwitchForm
              ref={ refs.current.text.enable }
              className="col-3"
              label="Text"
              disabled={ !path || !status.current.done }
              onChange={ handleChangeCheckText }
            />
            <TextForm
              ref={ refs.current.text.input }
              className="col-9"
              label={ null }
              valid={ !data.current.text.enable || data.current.text.valid }
              disabled={ !path || !status.current.done || !data.current.text.enable }
              onChange={ handleChangeText }
            />
          </div>
          <div className="form-row align-items-center mb-2">
            <SwitchForm
              ref={ refs.current.from.enable }
              className="col-3"
              label="From"
              disabled={ !path || !status.current.done }
              onChange={ handleChangeCheckFrom }
            />
            <DateForm
              ref={ refs.current.from.date }
              className="col-9"
              label={ null }
              valid={ !data.current.from.enable || data.current.from.valid }
              disabled={ !path || !status.current.done || !data.current.from.enable }
              defaultValue={ LocalDate.toInputFormat(data.current.from.date) }
              onChange={ handleChangeDateFrom }
            />
          </div>
          <div className="form-row align-items-center mb-2">
            <SwitchForm
              ref={ refs.current.to.enable }
              className="col-3"
              label="To"
              disabled={ !path || !status.current.done }
              onChange={ handleChangeCheckTo }
            />
            <DateForm
              ref={ refs.current.to.date }
              className="col-9"
              label={ null }
              valid={ !data.current.to.enable || data.current.to.valid }
              disabled={ !path || !status.current.done || !data.current.to.enable }
              defaultValue={ LocalDate.toInputFormat(data.current.to.date) }
              onChange={ handleChangeDateTo }
            />
          </div>
          <Button
            className="mb-2"
            label="Search"
            LIcon={ Search }
            disabled={ !path || !status.current.done
              || (!data.current.text.enable && !data.current.from.enable && !data.current.to.enable)
              || (data.current.text.enable && !data.current.text.valid)
              || (data.current.from.enable && !data.current.from.valid)
              || (data.current.to.enable && !data.current.to.valid)
            }
            onClick={ handleClickSubmit }
          />
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
