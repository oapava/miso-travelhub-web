import './DataTable.scss';

interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  title?: string;
  emptyMessage?: string;
  dataTestId?: string;
  className?: string;
}

function DataTable<T>({
  columns,
  data,
  title,
  emptyMessage = 'No data available',
  dataTestId,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`data-table ${className}`} data-testid={dataTestId}>
      {title && <h3 className="data-table__title">{title}</h3>}
      <div className="data-table__wrapper" tabIndex={0}>
        <table className="data-table__table" role="table">
          <thead className="data-table__head">
            <tr className="data-table__row data-table__row--header">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="data-table__cell data-table__cell--header"
                  style={column.width ? { width: column.width } : undefined}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-table__body">
            {data.length === 0 ? (
              <tr className="data-table__row data-table__row--empty">
                <td
                  className="data-table__cell data-table__cell--empty"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((rowItem, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="data-table__row"
                  data-testid={dataTestId ? `${dataTestId}-row-${rowIndex}` : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="data-table__cell">
                      {column.render
                        ? column.render(rowItem, rowIndex)
                        : String((rowItem as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
