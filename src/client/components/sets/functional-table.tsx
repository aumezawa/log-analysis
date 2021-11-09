import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import { BookmarksFill, CaretDownFill, CaretUpFill, FunnelFill, Search } from "react-bootstrap-icons"
import { BookmarkCheck, BookmarkX, Clock, Download, Hash, ListOl, Reply } from "react-bootstrap-icons"

import ModalFrame from "../frames/modal-frame"
import TextFilterForm from "../sets/text-filter-form"
import DateFilterForm from "../sets/date-filter-form"
import ThreeButtons from "../sets/three-buttons"
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
  mark?               : string,
  textFilter?         : string,
  textSensitive?      : boolean,
  dateFrom?           : string,
  dateTo?             : string,
  //copy?               : boolean,
  onChangeLine?       : (line: number) => void,
  onChangeMark?       : (mark: string) => void,
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
  mark                = null,
  textFilter          = null,
  textSensitive       = true,
  dateFrom            = null,
  dateTo              = null,
  //copy                = false,
  onChangeLine        = undefined,
  onChangeMark        = undefined,
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
    first     : 0,
    marks     : [],
    label     : null,
    operation : "filter",
    filters   : {} as FilterSettings,
    searches  : {} as SearchSettings,
    localtime : false
  })

  const input = useRef({
    line      : null
  })

  useEffect(() => {
    let scroll: boolean
    if (content) {
      env.current.format = (Object.values(content.format.label).includes("date")) ? "date" : "plain"
      env.current.page = 1
      env.current.maxRow = DEFAULT_ROW
      env.current.rows = 0
      env.current.line = (line > 0) ? line : 1
      env.current.first = 0
      env.current.marks = mark ? mark.split("_").map((e: string) => Number(e)) : []
      env.current.label = null
      env.current.operation = "filter"
      env.current.filters = {} as FilterSettings
      env.current.searches = {} as SearchSettings
      env.current.localtime = false
      scroll = true

      if (textFilter) {
        if (Object.keys(content.format.label).includes("Content")) {
          env.current.filters["Content"] = {
            type      : "text",
            mode      : "Be included",
            sensitive : textSensitive,
            condition : textFilter
          }
          scroll = false
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
          env.current.filters["Date"] = {
            type      : "date",
            from      : from,
            to        : to
          }
          scroll = false
        }

        if (onChangeDateFilter) {
          onChangeDateFilter(from && from.toISOString(), to && to.toISOString())
        }
      }

      ref.current.select.current.value = String(DEFAULT_ROW)
      ref.current.text.current.value = ""
      input.current.line = null

      if (scroll) {
        scrollToLine(env.current.line)
      } else {
        forceUpdate()
      }
    }
  }, [content, line, textFilter, textSensitive, dateFrom, dateTo, onChangeTextFilter, onChangeDateFilter])

  const scrollToPageTop = () => {
    forceUpdate()
    setTimeout(() => {
      ref.current.parent.current.scrollTo(0, 0)
    }, 0)
  }

  const scrollToLine = (line: number) => {
    env.current.page = Math.ceil(line / env.current.maxRow)
    forceUpdate()
    setTimeout(() => {
      const lines = ref.current.table.current.tBodies[0].childNodes
      const toLine = (line - 1) % env.current.maxRow
      const offsetTop = (toLine > 0 && toLine < lines.length) ? (lines[toLine - 1] as HTMLElement).offsetTop : 0
      ref.current.parent.current.scrollTo(0, offsetTop)
    }, 0)
  }

  const isSearching = (label: string) => {
    if (label in env.current.searches) {
      return true
    }
    return false
  }

  const isLineMovable = () => {
    for (let label in env.current.filters) {
      return false
    }
    return true
  }

  const handleClickMarkFilter = useCallback(() => {
    if ("Mark" in env.current.filters) {
      delete env.current.filters["Mark"]
      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    } else {
      env.current.filters["Mark"] = {
        type  : "mark",
        mode  : "head-to-tail",
        head  : env.current.marks[0],
        tail  : env.current.marks.slice(-1)[0]
      }
      scrollToLine(1)
    }
  }, [true])

  const handleClickFilter = useCallback((targetValue: string, parentValue: string) => {
    env.current.label = parentValue
    env.current.operation = "filter"
    forceUpdate()
  }, [true])

  const handleClickSearch = useCallback((targetValue: string, parentValue: string) => {
    env.current.label = parentValue
    env.current.operation = "search"
    forceUpdate()
  }, [true])

  const handleSubmitTextFilter = useCallback((mode: string, sensitive: boolean, condition: string) => {
    if (env.current.operation === "filter") {
      env.current.filters[env.current.label] = {
        type      : "text",
        mode      : mode,
        sensitive : sensitive,
        condition : condition
      }

      delete env.current.searches[env.current.label]

      if ((env.current.label === "Content") && (mode === "Be included")) {
        if (onChangeTextFilter) {
          onChangeTextFilter(condition, sensitive)
        }
      } else {
        if (onChangeTextFilter) {
          onChangeTextFilter(null, null)
        }
      }

      scrollToLine(1)
    } else if (env.current.operation === "search") {
      env.current.searches[env.current.label] = {
        type      : "text",
        mode      : mode,
        sensitive : sensitive,
        condition : condition,
        founds    : []
      }

      delete env.current.filters[env.current.label]

      if (onChangeTextFilter) {
        onChangeTextFilter(null, null)
      }

      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    }
  }, [onChangeTextFilter])

  const handleCancelTextFilter = useCallback(() => {
    if (env.current.operation === "filter") {
      delete env.current.filters[env.current.label]

      if (onChangeTextFilter) {
        onChangeTextFilter(null, null)
      }

      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    } else if (env.current.operation === "search") {
      delete env.current.searches[env.current.label]
    }
  }, [onChangeTextFilter])

  const handleSubmitDateFilter = useCallback((from: string, to: string) => {
    if (env.current.operation === "filter") {
      env.current.filters[env.current.label] = {
        type      : "date",
        from      : LocalDate.isDate(from) ? new Date(from) : null,
        to        : LocalDate.isDate(to)   ? new Date(to)   : null
      }

      if (onChangeDateFilter) {
        onChangeDateFilter(from, to)
      }

      scrollToLine(1)
    }
  }, [onChangeDateFilter])

  const handleCancelDateFilter = useCallback(() => {
    if (env.current.operation === "filter") {
      delete env.current.filters[env.current.label]

      if (onChangeDateFilter) {
        onChangeDateFilter(null, null)
      }

      scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
    }
  }, [onChangeDateFilter])

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
    if (copy) {
      const textarea = document.createElement("textarea")
      textarea.value = (e.currentTarget as HTMLElement).innerText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }
    */
  }, [onChangeLine])

  const handleDoubleClickContent = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    env.current.line = Number((e.currentTarget.parentNode as HTMLElement).title)
    handleClickMark()
    if (onChangeLine) {
      onChangeLine(env.current.line)
    }
  }, [onChangeLine])

  const handleClickCaretUp = useCallback((targetValue: string, parentValue: string) => {
    for (let label in env.current.searches) {
      if (label === parentValue) {
        for (let line of env.current.searches[label].founds.slice().reverse()) {
          if (env.current.line > line) {
            env.current.line = line
            if (onChangeLine) {
              onChangeLine(env.current.line)
            }
            scrollToLine(env.current.line - env.current.first + 1)
            return
          }
        }
      }
    }
  }, [onChangeLine])

  const handleClickCaretDown = useCallback((targetValue: string, parentValue: string) => {
    for (let label in env.current.searches) {
      if (label === parentValue) {
        for (let line of env.current.searches[label].founds) {
          if (env.current.line < line) {
            env.current.line = line
            if (onChangeLine) {
              onChangeLine(env.current.line)
            }
            scrollToLine(env.current.line - env.current.first + 1)
            return
          }
        }
      }
    }
  }, [onChangeLine])

  const handleChangeMaxRow = useCallback((value: string) => {
    env.current.maxRow = Number(value)
    scrollToLine(Object.keys(env.current.filters).length ? 1 : env.current.line)
  }, [true])

  const handleChangePage = useCallback((value: string) => {
    env.current.page = Number(value)
    scrollToPageTop()
  }, [true])

  const handleChangeLine = useCallback((value: string) => {
    input.current.line = value.match(/^[0-9]+$/) ? Number(value) : null
    forceUpdate()
  }, [true])

  const handleClickMoveLine = useCallback(() => {
    env.current.line = input.current.line
    if (onChangeLine) {
      onChangeLine(env.current.line)
    }
    scrollToLine(env.current.line)
  }, [onChangeLine])

  const handleClickReload = useCallback(() => {
    if (onClickReload) {
      onClickReload(env.current.format === "date" ? "plain" : "date")
    }
  }, [onClickReload])

  const handleClickMark = useCallback(() => {
    if (env.current.marks.includes(env.current.line)) {
      env.current.marks = env.current.marks.filter((e: number) => (e != env.current.line))
    } else {
      env.current.marks.push(env.current.line)
      env.current.marks.sort((a: number, b: number) => (a - b))
    }
    if (onChangeMark) {
      onChangeMark(env.current.marks.join("_"))
    }
    forceUpdate()
  }, [onChangeMark])

  const handleClickMarkUp = useCallback(() => {
    for (let line of env.current.marks.slice().reverse()) {
      if (env.current.line > line) {
        env.current.line = line
        if (onChangeLine) {
          onChangeLine(env.current.line)
        }
        scrollToLine(env.current.line - env.current.first + 1)
        return
      }
    }
  }, [onChangeLine])

  const handleClickMarkDown = useCallback(() => {
    for (let line of env.current.marks) {
      if (env.current.line < line) {
        env.current.line = line
        if (onChangeLine) {
          onChangeLine(env.current.line)
        }
        scrollToLine(env.current.line - env.current.first + 1)
        return
      }
    }
  }, [onChangeLine])

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
          header.push(
            <th key="index" scope="col" className="text-right">
              #
              <EmbeddedIconButton
                LIcon={ BookmarksFill }
                color={ ("Mark" in env.current.filters) ? "success" : "light" }
                disabled={ env.current.marks.length < 2 && !("Mark" in env.current.filters) }
                onClick={ handleClickMarkFilter }
              />
            </th>
          )
        }
        for (let label in content.format.label) {
          header.push(
            <th key={ label } scope="col" title={ label }>
              { label }
              <EmbeddedIconButton
                LIcon={ FunnelFill }
                color={ (label in env.current.filters) ? "success" : "light" }
                toggle="modal"
                target={ content.format.label[label] === "text" ? id.current.textFilter : id.current.dateFilter }
                onClick={ handleClickFilter }
              />
              {
                (content.format.label[label] === "text") &&
                <EmbeddedIconButton
                  LIcon={ Search }
                  color={ (label in env.current.searches) ? "success" : "light" }
                  toggle="modal"
                  target={ id.current.textFilter }
                  onClick={ handleClickSearch }
                />
              }
              {
                isSearching(label) &&
                <>
                  <EmbeddedIconButton
                    LIcon={ CaretUpFill }
                    color="light"
                    onClick={ handleClickCaretUp }
                  />
                  <EmbeddedIconButton
                    LIcon={ CaretDownFill }
                    color="light"
                    onClick={ handleClickCaretDown }
                  />
                </>
              }
              {
                (content.format.label[label] === "date") &&
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
      env.current.first = 0
      for (let label in env.current.searches) {
        env.current.searches[label].founds = []
      }
      return content.data.map((datum: TableData, index: number) => {
        for (let label in content.format.label) {
          if (!isFiltered(datum, label) || !isMarkFiltered(index + 1)) {
            return
          }
          if (foundSearchText(datum, label)) {
            env.current.searches[label].founds.push(index + 1)
          }
        }

        env.current.rows++
        env.current.first = (env.current.first) ? env.current.first : index + 1
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
              onDoubleClick={ handleDoubleClickContent }
            >
              { (env.current.localtime && label === "Date") ? convertToLocalTime(datum) : highlight(datum, label) }
            </td>
          )
        }
        return (
          <tr
            key={ "row" + index }
            className={ `${
              env.current.marks.includes(index + 1) ? "table-warning" :
              (index + 1 === env.current.line)     ? "table-success" : ""
            }` }
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

  const isMarkFiltered = (index: number) => {
    if (!("Mark" in env.current.filters)) {
      return true
    }

    if (index < env.current.filters["Mark"].head) {
      return false
    }

    if (index > env.current.filters["Mark"].tail) {
      return false
    }

    return true
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

  const foundSearchText = (datum: TableData, label: string) => {
    if (!(label in env.current.searches)) {
      return false
    }

    switch (env.current.searches[label].type) {
      case "text":
        switch (env.current.searches[label].mode) {
          case "Be included":
            if (env.current.searches[label].sensitive) {
              return datum[label].includes(env.current.searches[label].condition)
            } else {
              return datum[label].toUpperCase().includes(env.current.searches[label].condition.toUpperCase())
            }

          default:
            return false
        }

      default:
        return false
    }
  }

  const highlight = (datum: TableData, label: string) => {
    let setting: FilterSetting | SearchSetting

    if (label in env.current.filters) {
      setting = env.current.filters[label]
    } else if (label in env.current.searches) {
      setting = env.current.searches[label]
    } else {
      return datum[label]
    }

    switch (setting.type) {
      case "text":
        let condition = setting.condition
        let option = setting.sensitive ? "g" : "gi"
        switch (setting.mode) {
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
          title={ `Text ${ env.current.operation.charAt(0).toUpperCase() + env.current.operation.slice(1) }` }
          message="Input a condition, or press [Clear] to reset."
          body={
            <TextFilterForm
              operation={ env.current.operation }
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
          label={ env.current.format !== "date" ? "ON" : "OFF" }
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
          disabled={ !isLineMovable() }
          onChange={ handleChangeLine }
          onSubmit={ handleClickMoveLine }
        />
        <ThreeButtons
          className="flex-area-center"
          label={ env.current.marks.includes(env.current.line) ? "unmark"  : "mark" }
          LIcon={ env.current.marks.includes(env.current.line) ? BookmarkX : BookmarkCheck }
          type="btn-outline"
          color="secondary"
          direction="vertical"
          onClickCenter={ handleClickMark }
          onClickLeft={ handleClickMarkUp }
          onClickRight={ handleClickMarkDown }
        />
        <Button
          className="flex-area-right"
          label="download"
          LIcon={ Download }
          type="btn-outline"
          color="secondary"
          onClick={ handleClickDownload }
        />
      </div>
    </div>
  )
})

export default FunctionalTable
