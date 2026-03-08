// @system — Mobile-optimized table component with card view
// Automatically switches between table (desktop) and card (mobile) views
//
// Usage:
// <MobileTable
//   columns={[
//     { key: 'name', label: 'Name', primary: true },
//     { key: 'email', label: 'Email' },
//     { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> }
//   ]}
//   data={rows}
//   keyField="id"
//   onRowClick={(row) => navigate(`/item/${row.id}`)}
// />

import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../Card/Card'
import { cn } from '@/app/lib/@system/utils'

/**
 * @typedef {Object} Column
 * @property {string} key - Data key
 * @property {string} label - Column header label
 * @property {boolean} [primary] - Show as primary field in mobile view
 * @property {(value: any, row: Object) => React.ReactNode} [render] - Custom render function
 * @property {boolean} [hideOnMobile] - Hide this column in mobile card view
 */

/**
 * MobileTable — Responsive table with mobile card view
 * @param {Object} props
 * @param {Column[]} props.columns - Table columns
 * @param {Object[]} props.data - Table data
 * @param {string} [props.keyField='id'] - Unique key field
 * @param {Function} [props.onRowClick] - Row click handler
 * @param {boolean} [props.loading=false] - Loading state
 * @param {React.ReactNode} [props.emptyState] - Custom empty state
 * @param {string} [props.className] - Additional CSS classes
 */
export function MobileTable({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  loading = false,
  emptyState,
  className,
}) {
  if (loading) {
    return <MobileTableSkeleton rows={3} />
  }

  if (!data || data.length === 0) {
    return (
      emptyState || (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      )
    )
  }

  const primaryColumn = columns.find((col) => col.primary) || columns[0]
  const visibleColumns = columns.filter((col) => !col.hideOnMobile)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-2">
        {data.map((row) => (
          <Card
            key={row[keyField]}
            className={cn(
              'transition-all',
              onRowClick && 'cursor-pointer hover:shadow-md active:scale-[0.98]'
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              {/* Primary field */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base">
                  {primaryColumn.render
                    ? primaryColumn.render(row[primaryColumn.key], row)
                    : row[primaryColumn.key]}
                </h3>
                {onRowClick && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                )}
              </div>

              {/* Other fields */}
              <div className="space-y-2">
                {visibleColumns
                  .filter((col) => col !== primaryColumn)
                  .map((column) => (
                    <div key={column.key} className="flex justify-between items-start text-sm">
                      <span className="text-muted-foreground font-medium min-w-[100px]">
                        {column.label}:
                      </span>
                      <span className="text-right flex-1">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {column.label}
                  </th>
                ))}
                {onRowClick && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {data.map((row) => (
                <tr
                  key={row[keyField]}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-accent'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {onRowClick && (
                    <td className="px-2 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * MobileTableSkeleton — Loading skeleton
 * @private
 */
function MobileTableSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Mobile skeleton */}
      <div className="block lg:hidden space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop skeleton */}
      <div className="hidden lg:block rounded-lg border overflow-hidden">
        <div className="p-4 bg-muted/50">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-t">
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted rounded flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
