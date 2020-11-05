import * as React from "react"

type TableProps = {
  className?: string,
  title?    : string,
  content?  : Array<Array<string>>
}

const Table: React.FC<TableProps> = ({
  className = "",
  title     = "No Title",
  content   = [[]]
}) => (
  <div className={ className }>
    <h5>{ title }</h5>
    <table className="table table-align-fixed">
      <thead></thead>
      <tbody>
        {
          content.map((line: Array<string>, index: number) => (
            <tr key={ `${ index }` }>
              {
                line.map((cell: string, index: number) => (
                  <td key={ `${ index }` } className="table-main-content">
                    { cell }
                  </td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
      <tfoot></tfoot>
    </table>
  </div>
)

export default Table
