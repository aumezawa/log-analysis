import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { Clock, Download, Hash, ListOl, Reply, Search } from "react-bootstrap-icons"

import ModalFrame from "../frames/modal-frame"
import TextFilterForm from "../sets/text-filter-form"
import DateFilterForm from "../sets/date-filter-form"
import EmbeddedIconButton from "../parts/embedded-icon-button"
import EmbeddedButton from "../parts/embedded-button"
import SelectForm from "../parts/select-form"
import Pagination from "../parts/pagination"
import TextForm from "../parts/text-form"
import Button from "../parts/button"

import Escape from "../../lib/escape"
import UniqueId from "../../lib/unique-id"
import * as LocalDate from "../../lib/local-date"

type FunctionalTableProps = {
  className?          : string,
  content?            : TableContent,
  line?               : number,
  textFilter?         : string,
  textSensitive?      : boolean,
  dateFrom?           : string,
  dateTo?             : string,
  copy?               : boolean,
  onChangeLine?       : (line: number) => void,
  onChangeTextFilter? : (textFilter: string, textSensitive: boolean) => void,
  onChangeDateFilter? : (dateFrom: string, dateTo: string) => void,
  onClickReload?      : (format: string) => void,
  onClickDownload?    : (textFilter: string, textSensitive: boolean, dateFrom: string, dateTo: string) => void
}

const DEFAULT_ROW = 100
const ROWS = [String(DEFAULT_ROW), "500", "1000", "5000"]

const FunctionalTable = React.memo<FunctionalTableProps>(({
  className           = "",
  content             = null,
  line                = null,
  textFilter          = null,
  textSensitive       = true,
  dateFrom            = null,
  dateTo              = null,
  copy                = false,
  onChangeLine        = undefined,
  onChangeTextFilter  = undefined,
  onChangeDateFilter  = undefined,
  onClickReload       = undefined,
  onClickDownload     = undefined
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const ref = useRef({
    parent: React.createRef<HTMLDivElement>(),
    table : React.createRef<HTMLTableElement>(),
    select: React.createRef<HTMLSelectElement>(),
    text  : React.createRef<HTMLInputElement>()
  })

  const id = useRef({
    textFilter: "modal-" + UniqueId(),
    dateFilter: "modal-" + UniqueId()
  })

  const env = useRef({
    format    : "plain",
    page      : 1,
    maxRow    : DEFAULT_ROW,
    rows      : 0,
    line      : 1,
    label     : null,
    filters   : {} as FilterSettings,
    localtime : false,
    dlable    : false
  })

  const input = useRef({
    line      : null
  })

  useEffect(() => {
    let scrollLine: number
    if (content) {
      env.current.format = Object.keys(content.format.label).includes("Date") ? "date" : "plain"
      env.current.line = (line > 0) ? line : 1
      env.current.maxRow = DEFAULT_ROW
      env.current.label = null
      env.current.page = Math.ceil(env.current.line / env.current.maxRow)
      env.current.filters = {} as FilterSettings
      env.current.localtime = false
      env.current.dlable = true
      scrollLine = env.current.line

      if (textFilter) {
        if (Object.keys(content.format.label).includes("Content")) {
          env.current.page = 1
          env.current.filters["Content"] = {
            type      : "text",
            mode      : "Be included",
            sensitive : textSensitive,
            condition : textFilter
          }
          scrollLine = 1
        } else {
          if (onChangeTextFilter) {
            onChangeTextFilter(null, null)
          }
        }
      }

      if (dateFrom || dateTo) {
        const from = LocalDate.isDate(dateFrom) ? new Date(dateFrom) : null
        const to   = LocalDate.isDate(dateTo)   ? new Date(dateTo)   : null
        if (Object.keys(content.format.label).includes("Date")) {
          env.current.page = 1
          env.current.filters["Date"] = {
            type      : "date",
            from      : from,
            to        : to
          }
          scrollLine = 1
        }

        if (onChangeDateFilter) {
          onChangeDateFilter(from && from.toISOString(), to && to.toISOString())
        }
      }

      ref.current.select.current.value = String(DEFAULT_ROW)
      ref.current.text.current.value = ""
      input.current.line = null
      forceUpdate()
      scrollToLine(scrollLine)
    }
  }, [content, line, textFilter, textSensitive, dateFrom, dateTo, onChangeTextFilter, onChangeDateFilter])

  const scrollToLine = (line: number) => {
    setTimeout(() => {
      const lines = ref.current.table.current.tBodies[0].childNodes
      const toLine = (line - 1) % env.current.maxRow
      const offsetTop = (toLine > 0 && toLine < lines.length) ? (lines[toLine - 1] as HTMLElement).offsetTop : 0
      ref.current.parent.current.scrollTo(0, offsetTop)
    }, 0)
  }

  const handleClickFilter = useCallback((targetValue: string, parentValue: string) => {
    env.current.label = parentValue
  }, [true])

  const handleSubmitTextFilter = useCallback((mode: string, sensitive: boolean, condition: string) => {
    if (env.current.label) {
      env.current.page = 1
      env.current.filters[env.current.label] = {
        type      : "text",
        mode      : mode,
        sensitive : sensitive,
        condition : condition
      }
      if ((env.current.label === "Content") && (mode === "Be included")) {
        env.current.dlable = true
        if (onChangeTextFilter) {
          onChangeTextFilter(condition, sensitive)
        }
      } else {
        env.current.dlable = false
        if (onChangeTextFilter) {
          onChangeTextFilter(null, null)
        }
      }
      forceUpdate()
      scrollToLine(1)
    }
  }, [true])

  const handleCancelTextFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      env.current.page = Object.keys(env.current.filters).length ? 1 : Math.ceil(env.current.line / env.current.maxRow)
      env.current.dlable = true
      if (onChangeTextFilter) {
        onChangeTextFilter(null, null)
      }
      forceUpdate()
      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    }
  }, [true])

  const handleSubmitDateFilter = useCallback((from: string, to: string) => {
    if (env.current.label) {
      env.current.page = 1
      env.current.filters[env.current.label] = {
        type      : "date",
        from      : LocalDate.isDate(from) ? new Date(from) : null,
        to        : LocalDate.isDate(to)   ? new Date(to)   : null
      }
      if (onChangeDateFilter) {
        onChangeDateFilter(from, to)
      }
      forceUpdate()
      scrollToLine(1)
    }
  }, [true])

  const handleCancelDateFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      env.current.page = Object.keys(env.current.filters).length ? 1 : Math.ceil(env.current.line / env.current.maxRow)
      if (onChangeDateFilter) {
        onChangeDateFilter(null, null)
      }
      forceUpdate()
      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    }
  }, [true])

  const handleClickLocalTime = useCallback(() => {
    env.current.localtime = !env.current.localtime
    forceUpdate()
  }, [true])

  const handleClickContent = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    env.current.line = Number((e.currentTarget.parentNode as HTMLElement).title)
    forceUpdate()
    if (onChangeLine) {
      onChangeLine(env.current.line)
    }
    // TODO: Automatically copy by click
    /*
    const textarea = document.createElement("textarea")
    textarea.value = (e.currentTarget as HTMLElement).innerText
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    textarea.remove()
    */
  }, [onChangeLine])

  const handleChangeMaxRow = useCallback((value: string) => {
    env.current.maxRow = Number(value)
    env.current.page = Object.keys(env.current.filters).length ? 1 : Math.ceil(env.current.line / env.current.maxRow)
    forceUpdate()
    scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
  }, [true])

  const handleChangePage = useCallback((value: string) => {
    env.current.page = Number(value)
    forceUpdate()
    scrollToLine(1)
  }, [true])

  const handleChangeLine = useCallback((value: string) => {
    input.current.line = value.match(/^[0-9]+$/) ? Number(value) : null
    forceUpdate()
  }, [true])

  const handleClickGoToLine = useCallback(() => {
    env.current.line = input.current.line
    env.current.page = Math.ceil(env.current.line / env.current.maxRow)
    forceUpdate()
    scrollToLine(env.current.line)
    if (onChangeLine) {
      onChangeLine(env.current.line)
    }
  }, [onChangeLine])

  const handleClickReload = useCallback(() => {
    if (onClickReload) {
      onClickReload(env.current.format === "date" ? "plain" : "date")
    }
  }, [onClickReload])

  const handleClickDownload = useCallback(() => {
    const textFilter  = env.current.filters["Content"]
    const text        = (textFilter && (textFilter.mode === "Be included") && textFilter.condition) || null
    const sensitive   = (textFilter && (textFilter.mode === "Be included") && textFilter.sensitive) || true
    const dateFilter  = env.current.filters["Date"]
    const dateFrom    = (dateFilter && dateFilter.from && dateFilter.from.toISOString()) || null
    const dateTo      = (dateFilter && dateFilter.to   && dateFilter.to.toISOString())   || null
    if (onClickDownload) {
      onClickDownload(text, sensitive, dateFrom, dateTo)
    }
  }, [onClickDownload])

  const renderHeader = () => {
    if (content) {
      let header: Array<JSX.Element> = []
      if (content.format.hasHeader) {
        if (content.format.hasIndex) {
          header.push(<th key="index" scope="col" className="text-right">#</th>)
        }
        for (let label in content.format.label) {
          header.push(
            <th key={ label } scope="col" title={ label }>
              { label }
              <EmbeddedIconButton
                LIcon={ Search }
                color={ (label in env.current.filters) ? "success" : "light" }
                toggle="modal"
                target={ content.format.label[label] === "text" ? id.current.textFilter : id.current.dateFilter }
                onClick={ handleClickFilter }
              />
              {
                (label === "Date") &&
                <EmbeddedButton
                  label={ LocalDate.getOffset() === 9 ? "JST" : "Local" }
                  color={ (env.current.localtime) ? "success" : "light" }
                  onClick={ handleClickLocalTime }
                />
              }
            </th>
          )
        }
      }
      return <tr>{ header }</tr>
    } else {
      return <></>
    }
  }

  const renderBody = () => {
    if (content) {
      env.current.rows = 0
      return content.data.map((datum: TableData, index: number) => {
        for (let label in content.format.label) {
          if (!isFiltered(datum, label)) {
            return
          }
        }

        env.current.rows++
        if (env.current.rows <= (env.current.page - 1) * env.current.maxRow || env.current.rows > env.current.page * env.current.maxRow) {
          return
        }

        let row: Array<JSX.Element> = []
        if (content.format.hasIndex) {
          row.push(<th key="index" className="text-right" scope="row">{ `${ index + 1 }:` }</th>)
        }
        for (let label in content.format.label) {
          row.push(
            <td
              key={ label }
              title=""
              className={ `${ (label === content.format.contentKey) ? "table-main-content" : "table-sub-content" }` }
              onClick={ handleClickContent }
            >
              { (env.current.localtime && label === "Date") ? convertToLocalTime(datum) : highlight(datum, label) }
            </td>
          )
        }
        return (
          <tr
            key={ "row" + index }
            className={ `${ index + 1 === env.current.line ? "table-success" : "" }` }
            title={ `${ index + 1 }` }
          >
            { row }
          </tr>
        )
      })
    } else {
      return <tr><td className="text-center">{ "No content" }</td></tr>
    }
  }

  const isFiltered = (datum: TableData, label: string) => {
    if (!(label in env.current.filters)) {
      return true
    }

    switch (env.current.filters[label].type) {
      case "text":
        switch (env.current.filters[label].mode) {
          case "Be included":
            if (env.current.filters[label].sensitive) {
              return datum[label].includes(env.current.filters[label].condition)
            } else {
              return datum[label].toUpperCase().includes(env.current.filters[label].condition.toUpperCase())
            }

          case "Not be included":
            if (env.current.filters[label].sensitive) {
              return !datum[label].includes(env.current.filters[label].condition)
            } else {
              return !datum[label].toUpperCase().includes(env.current.filters[label].condition.toUpperCase())
            }

          case "Regex (unstable)":
            const option = env.current.filters[label].sensitive ? "g" : "gi"
            const regex = new RegExp(env.current.filters[label].condition, option)
            return !!datum[label].match(regex)

          default:
            return false
        }

      case "date":
        const at = LocalDate.isDate(datum[label]) ? new Date(datum[label]) : null
        if (!at) {
          return false
        }
        if (env.current.filters[label].from && env.current.filters[label].from > at) {
          return false
        }
        if (env.current.filters[label].to   && env.current.filters[label].to   < at) {
          return false
        }
        return true

      default:
        return true
    }
  }

  const highlight = (datum: TableData, label: string) => {
    if (!(label in env.current.filters)) {
      return datum[label]
    }

    switch (env.current.filters[label].type) {
      case "text":
        let condition = env.current.filters[label].condition
        let option = env.current.filters[label].sensitive ? "g" : "gi"
        switch (env.current.filters[label].mode) {
          case "Be included":
            condition = Escape.regex(condition)

          // TODO:
          //case "Regex (unstable)":
            const regex = new RegExp(`(${ condition })`, option)
            return (
              <>
                {
                  datum[label].split(regex).map((chunk, index) => {
                    if (index % 2 === 0) {
                      return chunk
                    } else {
                      return <span key={ `${ index }` } className="text-highlight">{ chunk }</span>
                    }
                  })
                }
              </>
            )

          default:
            return datum[label]
        }

      default:
        return datum[label]
    }
  }

  const convertToLocalTime = (datum: TableData) => {
    return LocalDate.localize(datum["Date"])
  }

  return (
    <div className={ `flex-container-column ${ className }` }>
      <div ref={ ref.current.parent } className="flex-main-area flex-main-overflow table-responsive">
        <ModalFrame
          id={ id.current.textFilter }
          title="Text Filter"
          message="Input a condition, or press [Clear] to reset."
          body={
            <TextFilterForm
              sensitive={ env.current.filters["Content"] && env.current.filters["Content"].sensitive }
              condition={ env.current.filters["Content"] && env.current.filters["Content"].condition }
              dismiss="modal"
              onSubmit={ handleSubmitTextFilter }
              onCancel={ handleCancelTextFilter }
            />
          }
        />
        <ModalFrame
          id={ id.current.dateFilter }
          title="Date Filter"
          message="Input a condition, or press [Clear] to reset."
          body={
            <DateFilterForm
              from={ env.current.filters["Date"] ? (env.current.filters["Date"].from && env.current.filters["Date"].from.toISOString()) : (content && content.data.length > 0 && content.data[0]["Date"]) || null }
              to={ env.current.filters["Date"] ? (env.current.filters["Date"].to && env.current.filters["Date"].to.toISOString()) : (content && content.data.length > 2 && content.data.slice(-2)[0]["Date"]) || null }
              local={ env.current.localtime }
              dismiss="modal"
              onSubmit={ handleSubmitDateFilter }
              onCancel={ handleCancelDateFilter }
            />
          }
        />
        <table ref={ ref.current.table } className="table table-hover table-header-fixed text-monospace">
          <thead className="thead-dark">{ renderHeader() }</thead>
          <tbody>{ renderBody() }</tbody>
          <tfoot></tfoot>
        </table>
      </div>
      <div className="flex-area-bottom-0 flex-container-row justify-content-center">
        <Button
          className="flex-area-left"
          label={ env.current.format === "date" ? "OFF" : "ON" }
          LIcon={ Clock }
          type="btn-outline"
          color="secondary"
          onClick={ handleClickReload }
        />
        <SelectForm
          ref={ ref.current.select }
          className="flex-area-center"
          label={ <ListOl /> }
          options={ ROWS }
          onChange={ handleChangeMaxRow }
        />
        <Pagination
          className="flex-area-center"
          current={ env.current.page }
          last={ Math.ceil(env.current.rows / env.current.maxRow) }
          onChange={ handleChangePage }
        />
        <TextForm
          ref={ ref.current.text }
          className="flex-area-center"
          label={ <Hash /> }
          button={ <Reply /> }
          size={ 4 }
          valid={ input.current.line > 0 && input.current.line <= env.current.rows }
          validation={ false }
          disabled={ !!Object.keys(env.current.filters).length }
          onChange={ handleChangeLine }
          onSubmit={ handleClickGoToLine }
        />
        <Button
          className="flex-area-right"
          label="download"
          LIcon={ Download }
          type="btn-outline"
          color="secondary"
          disabled={ !env.current.dlable }
          onClick={ handleClickDownload }
        />
      </div>
    </div>
  )
})

export default FunctionalTable
