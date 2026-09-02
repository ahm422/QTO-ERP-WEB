"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * When `stack` is on (the default), the table collapses to a stack of cards
 * below the `md` breakpoint: the header is hidden, each row becomes a bordered
 * card, and each cell shows its column name (from `data-label` on the
 * `TableCell`) beside the value. Pass `stack={false}` to keep a horizontally
 * scrolling table on small screens instead.
 */
const TableStackContext = React.createContext(true)

function Table({
  className,
  stack = true,
  ...props
}: React.ComponentProps<"table"> & { stack?: boolean }) {
  return (
    <TableStackContext.Provider value={stack}>
      <div
        data-slot="table-container"
        className={cn(
          "relative w-full",
          stack ? "md:overflow-x-auto" : "overflow-x-auto",
        )}
      >
        <table
          data-slot="table"
          className={cn(
            "w-full caption-bottom text-sm",
            stack && "max-md:block",
            className,
          )}
          {...props}
        />
      </div>
    </TableStackContext.Provider>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const stack = React.useContext(TableStackContext)
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", stack && "max-md:hidden", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const stack = React.useContext(TableStackContext)
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        stack && "max-md:block",
        className,
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const stack = React.useContext(TableStackContext)
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        stack &&
          "max-md:mb-3 max-md:block max-md:rounded-lg max-md:border max-md:border-border max-md:p-3 max-md:shadow-sm max-md:last:mb-0",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const stack = React.useContext(TableStackContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        stack &&
          "max-md:flex max-md:items-center max-md:justify-between max-md:gap-4 max-md:whitespace-normal max-md:border-0 max-md:px-0 max-md:py-1.5 max-md:text-right max-md:before:mr-4 max-md:before:shrink-0 max-md:before:text-left max-md:before:text-xs max-md:before:font-medium max-md:before:tracking-wide max-md:before:text-muted-foreground max-md:before:uppercase max-md:before:content-[attr(data-label)] max-md:empty:hidden max-md:[&:not([data-label])]:before:hidden",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
