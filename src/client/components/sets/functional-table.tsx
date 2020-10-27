import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import ModalFrame from "../frames/modal-frame"
import TextFilterForm from "../sets/text-filter-form"
import DateFilterForm from "../sets/date-filter-form"
import EmbeddedButton from "../parts/embedded-button"
import SelectForm from "../parts/select-form"
import Pagination from "../parts/pagination"
import TextForm from "../parts/text-form"

import Escape from "../../lib/escape"
import UniqueId from "../../lib/unique-id"

type FunctionalTableProps = {
  className?      : string,
  content?        : TableContent,
  line?           : number,
  filter?         : string,
  copy?           : boolean,
  onChangeLine?   : (line: number) => void,
  onChangeFilter? : (filter: string) => void
}

const DEFAULT_ROW = 100
const ROWS = [String(DEFAULT_ROW), "500", "1000", "5000"]

const FunctionalTable = React.memo<FunctionalTableProps>(({
  className       = "",
  content         = null,
  line            = null,
  filter          = null,
  copy            = false,
  onChangeLine    = undefined,
  onChangeFilter  = undefined
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
    page    : 1,
    maxRow  : DEFAULT_ROW,
    rows    : 0,
    line    : 1,
    label   : null,
    filters : {} as FilterSettings
  })

  const input = useRef({
    line    : null
  })

  useEffect(() => {
    let scrollLine: number
    if (content) {
      env.current.line = (line > 0) ? line : 1
      env.current.maxRow = DEFAULT_ROW
      env.current.label = null
      if (filter) {
        scrollLine = 1
        env.current.page = 1
        env.current.filters = {
          Content : {
            type      : "text",
            mode      : "Be included",
            sensitive : true,
            condition : decodeURI(filter)
          }
        }
      } else {
        scrollLine = env.current.line
        env.current.page = Math.ceil(env.current.line / env.current.maxRow)
        env.current.filters = {} as FilterSettings
      }

      ref.current.select.current.value = String(DEFAULT_ROW)
      ref.current.text.current.value = ""
      input.current.line = null
      forceUpdate()
      scrollToLine(scrollLine)
    }
  }, [content, line, filter])

  const scrollToLine = (line: number) => {
    setImmediate(() => {
      const lines = ref.current.table.current.tBodies[0].childNodes
      const toLine = (line - 1) % env.current.maxRow
      const offsetTop = (toLine > 0 && toLine < lines.length) ? (lines[toLine - 1] as HTMLElement).offsetTop : 0
      ref.current.parent.current.scrollTo(0, offsetTop)
    })
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
      if (onChangeFilter) {
        if ((env.current.label === "Content") && (mode === "Be included") && (sensitive === true)) {
          onChangeFilter(encodeURI(condition))
        } else {
          onChangeFilter(null)
        }
      }
      forceUpdate()
      scrollToLine(1)
    }
  }, [true])

  const handleCancelTextFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      env.current.page = Math.ceil(env.current.line / env.current.maxRow)
      if (onChangeFilter) {
        onChangeFilter(null)
      }
      forceUpdate()
      scrollToLine(env.current.line)
    }
  }, [true])

  const handleSubmitDateFilter = useCallback((from: Date, to: Date) => {
    if (env.current.label) {
      env.current.page = 1
      env.current.filters[env.current.label] = {
        type      : "date",
        from      : from,
        to        : to
      }
      if (onChangeFilter) {
        onChangeFilter(null)
      }
      forceUpdate()
      scrollToLine(1)
    }
  }, [true])

  const handleCancelDateFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      env.current.page = Math.ceil(env.current.line / env.current.maxRow)
      if (onChangeFilter) {
        onChangeFilter(null)
      }
      forceUpdate()
      scrollToLine(env.current.line)
    }
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
    env.current.page = Math.ceil(env.current.line / env.current.maxRow)
    forceUpdate()
    scrollToLine(env.current.line)
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

  const renderHeader = () => {
    if (content) {
      let header: Array<JSX.Element> = []
      if (content.format.hasHeader) {
        if (content.format.hasIndex) {
          header.push(<th key="index" scope="col">#</th>)
        }
        for (let label in content.format.label) {
          header.push(
            <th key={ label } scope="col" title={ label }>
              { label }
              <EmbeddedButton
                key={ label }
                label="filter"
                on={ label in env.current.filters }
                toggle="modal"
                target={ content.format.label[label] === "text" ? id.current.textFilter : id.current.dateFilter }
                onClick={ handleClickFilter }
              />
            </th>
          )
        }
      }
      return <tr>{ header }</tr>
    } else {
      return <tr><th>{ "#" }</th></tr>
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
              { highlight(datum, label) }
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
      return <tr><td>{ "No content" }</td></tr>
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
        const at = new Date(datum[label])
        if (at.toString() === "Invalid Date") {
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

  return (
    <div className={ `flex-container-column ${ className }` }>
      <div ref={ ref.current.parent } className="flex-main-area flex-main-overflow table-responsive">
        <ModalFrame
          id={ id.current.textFilter }
          title="Text Filter"
          message="Input a condition, or press [Clear] to reset."
          body={
            <TextFilterForm
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
        <SelectForm
          ref={ ref.current.select }
          className="flex-area-left"
          label="rows"
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
          className="flex-area-right"
          label="line"
          button="GoTo"
          size={ 4 }
          valid={ input.current.line > 0 && input.current.line <= env.current.rows }
          validation={ false }
          disabled={ !!Object.keys(env.current.filters).length }
          onChange={ handleChangeLine }
          onSubmit={ handleClickGoToLine }
        />
      </div>
    </div>
  )
})

export default FunctionalTable
