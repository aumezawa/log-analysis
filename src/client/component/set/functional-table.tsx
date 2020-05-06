import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Pagination from "../part/pagination"
import SelectForm from "../part/select-form"

import uniqueId from "../../lib/uniqueId"

type FunctionalTableProps = {
  className?: string,
  content?  : TableContent,
}

const FunctionalTable = React.memo<FunctionalTableProps>(({
  className = "",
  content   = null
}) => {
  const [ignored, forceUpdate]  = useReducer(x => x + 1, 0)

  const ROWS = ["100", "500", "1000", "5000"]

  const env = useRef({
    page  : 1,
    maxRow: Number(ROWS[0]),
    rows  : 0
  })

  useEffect(() => {
    env.current.page = 1
    env.current.maxRow = Number(ROWS[0])
    forceUpdate()
  }, [content])

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
        header = header.concat(content.format.labels.map((label: TableLabel) => (
          <th key={ label.name } scope="col" title={ label.name }>
            { label.name }
          </th>
        )))
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
        env.current.rows++
        if (env.current.rows <= (env.current.page - 1) * env.current.maxRow || env.current.rows > env.current.page * env.current.maxRow) {
          return
        }

        let row: Array<JSX.Element> = []
        if (content.format.hasIndex) {
          row = [<th key="index" className="text-right" scope="row" >{ `${ index + 1 }:` }</th>]
        }
        row = row.concat(content.format.labels.map((label: TableLabel) => (
          <td
            key={ label.name }
            className={ `${ (label.name === content.format.contentKey) ? "text-wrap text-break" : "text-nowrap" }` }
          >
            { datum[label.name] }
          </td>
        )))
        return <tr key={ "row" + index }>{ row }</tr>
      })
    } else {
      return <tr><td>{ "No content" }</td></tr>
    }
  }

  return (
    <div className={ `flex-container-column ${ className }` }>
      <div className="flex-main-area flex-main-overflow table-responsive">
        <table className="table table-hover table-fixed text-monospace">
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
