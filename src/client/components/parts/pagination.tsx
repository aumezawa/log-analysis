import * as React from "react"
import { useCallback } from "react"

import Range from "../../lib/range"

type PaginationProps = {
  className?: string,
  current?  : number,
  first?    : number,
  last?     : number,
  range?    : number,
  onChange? : (value: string) => void
}

const Pagination = React.memo<PaginationProps>(({
  className = "",
  current   = 1,
  first     = 1,
  last      = 1,
  range     = 3,
  onChange  = undefined
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (onChange) {
      onChange(e.currentTarget.title)
    }
  }, [onChange])

  const renderItem = () => {
    return Range(current - range, current + range).map((value: number) => {
      if (value === current) {
        return (
          <li className="page-item active" key={ `${ value }` }>
            <span className="page-link">{ value }</span>
          </li>
        )
      }
      if (value < first || value > last) {
        return (
          <li className="page-item" key={ `${ value }` }>
            <span className="page-link"> - </span>
          </li>
        )
      }
      return (
        <li className="page-item" key={ `${ value }` }>
          <a className="page-link" href="#" title={ `${ value }` } onClick={ handleClick }>{ value }</a>
        </li>
      )
    })
  }

  return (
    <nav className={ className }>
      <ul className="pagination">
        <li className="page-item">
          <a className="page-link" href="#" title={ `${ first }` } onClick={ handleClick }>{ "<" }</a>
        </li>
        { renderItem() }
        <li className="page-item">
          <a className="page-link" href="#" title={ `${ last }` } onClick={ handleClick }>{ ">" }</a>
        </li>
      </ul>
    </nav>
  )
})

export default Pagination
