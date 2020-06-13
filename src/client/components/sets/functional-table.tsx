import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import ModalFrame from "../frames/modal-frame"
import TextFilterForm from "../sets/text-filter-form"
import DateFilterForm from "../sets/date-filter-form"
import EmbeddedButton from "../parts/embedded-button"
import SelectForm from "../parts/select-form"
import Pagination from "../parts/pagination"

import Escape from "../../lib/escape"
import UniqueId from "../../lib/unique-id"

type FunctionalTableProps = {
  className?: string,
  content?  : TableContent,
}

const ROWS = ["100", "500", "1000", "5000"]

const FunctionalTable = React.memo<FunctionalTableProps>(({
  className = "",
  content   = null
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const id = useRef({
    textFilter: "modal-" + UniqueId(),
    dateFilter: "modal-" + UniqueId()
  })

  const env = useRef({
    page    : 1,
    maxRow  : Number(ROWS[0]),
    rows    : 0,
    label   : null,
    filters : {} as FilterSettings
  })

  useEffect(() => {
    env.current.page = 1
    env.current.maxRow = Number(ROWS[0])
    env.current.label = null
    env.current.filters = {} as FilterSettings
    forceUpdate()
  }, [content])

  const handleClickFilter = useCallback((targetValue: string, parentValue: string) => {
    env.current.label = parentValue
  }, [true])

  const handleSubmitTextFilter = useCallback((mode: string, sensitive: boolean, condition: string) => {
    if (env.current.label) {
      env.current.filters[env.current.label] = {
        type      : "text",
        mode      : mode,
        sensitive : sensitive,
        condition : condition
      }
      forceUpdate()
    }
  }, [true])

  const handleCancelTextFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      forceUpdate()
    }
  }, [true])

  const handleSubmitDateFilter = useCallback((from: Date, to: Date) => {
    if (env.current.label) {
      env.current.filters[env.current.label] = {
        type      : "date",
        from      : from,
        to        : to
      }
      forceUpdate()
    }
  }, [true])

  const handleCancelDateFilter = useCallback(() => {
    if (env.current.label) {
      delete env.current.filters[env.current.label]
      forceUpdate()
    }
  }, [true])

  const handleChangeMaxRow = useCallback((value: string) => {
    env.current.page = 1
    env.current.maxRow = Number(value)
    forceUpdate()
  }, [true])

  const handleChangePage = useCallback((value: string) => {
    env.current.page = Number(value)
    forceUpdate()
  }, [true])

  const renderHeader = () => {
    if (content) {
      let header: Array<JSX.Element> = []
      if (content.format.hasHeader) {
        if (content.format.hasIndex) {
          header = [<th key="index" scope="col">#</th>]
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
          row = [<th key="index" className="text-right" scope="row" >{ `${ index + 1 }:` }</th>]
        }
        for (let label in content.format.label) {
          row.push(
            <td
              key={ label }
              className={ `${ (label === content.format.contentKey) ? "text-wrap text-break" : "text-nowrap" }` }
            >
              { highlight(datum, label) }
            </td>
          )
        }
        return <tr key={ "row" + index }>{ row }</tr>
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
      <div className="flex-main-area flex-main-overflow table-responsive">
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
        <table className="table table-hover table-header-fixed text-monospace">
          <thead className="thead-dark">{ renderHeader() }</thead>
          <tbody>{ renderBody() }</tbody>
          <tfoot></tfoot>
        </table>
      </div>
      <div className="flex-area-bottom-0 flex-container-row justify-content-center">
        <SelectForm
          className="flex-area-left"
          label="rows"
          options={ ROWS }
          onChange={ handleChangeMaxRow }
        />
        <Pagination
          className="flex-area-right"
          current={ env.current.page }
          last={ Math.ceil(env.current.rows / env.current.maxRow) }
          onChange={ handleChangePage }
        />
      </div>
    </div>
  )
})

export default FunctionalTable
