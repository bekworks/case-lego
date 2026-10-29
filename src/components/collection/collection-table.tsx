import { useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  type FilterFn,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import type { CollectionPiece, Colour } from "@/domain/model";
import { Button } from "@/components/ui/button";

// base interface for TanStack table to use
interface Row {
  pieceId: CollectionPiece["pieceId"];
  quantity: number;
  search: string;
  colourName?: Colour["name"];
  subRows?: Array<Row>;
}

// narrowed interfaces for us to use
interface ColourRow extends Row {
  colourName: Colour["name"];
}

interface PieceRow extends Row {
  subRows: Array<ColourRow>;
}

const PAGE_SIZE = 50;

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, Row>();

const columns = helper.columns([
  helper.accessor("pieceId", { header: "Piece", sortFn: "alphanumeric" }),
  helper.accessor("quantity", {
    header: "Quantity",
    sortFn: "basic",
    enableGlobalFilter: false,
  }),
]);

const filterSearchFn: FilterFn<typeof features, Row> = (
  row,
  _columnId,
  value: string,
) => {
  return row.original.search.includes(value.trim().toLowerCase());
};

const toColourRow = (
  piece: Readonly<CollectionPiece>,
  colourName: string,
): ColourRow => {
  return {
    pieceId: piece.pieceId,
    colourName,
    quantity: piece.quantity,
    search: `${piece.pieceId} ${colourName}`.toLowerCase(),
  };
};

const toRows = (
  pieces: ReadonlyArray<CollectionPiece>,
  colours: ReadonlyArray<Colour>,
): Array<Row> => {
  const colourNames = new Map(colours.map((c) => [c.colourCode, c.name]));
  const byPiece = new Map<string, PieceRow>();

  for (const p of pieces) {
    const colourName = colourNames.get(p.colourCode) ?? String(p.colourCode);
    let pieceRow = byPiece.get(p.pieceId);

    if (!pieceRow) {
      pieceRow = {
        pieceId: p.pieceId,
        quantity: 0,
        search: p.pieceId.toLowerCase(),
        subRows: [],
      };
      byPiece.set(p.pieceId, pieceRow);
    }

    pieceRow.quantity += p.quantity;
    pieceRow.subRows.push(toColourRow(p, colourName));
  }

  // sort sub rows by color name
  const rows = Array.from(byPiece.values());
  for (const pieceRow of rows) {
    pieceRow.subRows.sort((a, b) => a.colourName.localeCompare(b.colourName));
  }

  return rows;
};

export const CollectionTable = ({
  pieces,
  colours,
  quantityLabel = "Quantity",
}: {
  pieces: ReadonlyArray<CollectionPiece>;
  colours: ReadonlyArray<Colour>;
  quantityLabel?: string;
}) => {
  const data = useMemo(() => toRows(pieces, colours), [pieces, colours]);

  const table = useTable({
    features,
    columns,
    data,
    getSubRows: (row) => row.subRows,
    globalFilterFn: filterSearchFn,
    filterFromLeafRows: true,
    paginateExpandedRows: false,
    initialState: {
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
      sorting: [{ id: "pieceId", desc: false }],
    },
  });

  const rows = table.getRowModel().rows;
  const pieceRows = rows.filter((r) => r.depth === 0);
  const distinctPieceCount = table.getFilteredRowModel().rows.length;
  const remainingRows = distinctPieceCount - pieceRows.length;

  const onFilterChange = (value: string) => {
    table.setGlobalFilter(value);
    table.setPageSize(PAGE_SIZE); // reset number of shown rows on search
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        placeholder="Filter by piece or colour"
        aria-label="Filter pieces"
        value={table.state.globalFilter ?? ""}
        onChange={(e) => onFilterChange(e.target.value)}
        className="h-9 w-full max-w-sm rounded border border-line bg-surface px-3 text-sm focus:border-primary focus:outline-none"
      />

      <div className="overflow-x-auto rounded border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-2.5 font-bold">
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        {header.column.id === "quantity" ? (
                          quantityLabel
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                        {sorted === "asc" ? (
                          <ChevronUp aria-hidden className="size-6" />
                        ) : sorted === "desc" ? (
                          <ChevronDown aria-hidden className="size-6" />
                        ) : (
                          <ChevronsUpDown
                            aria-hidden
                            className="size-4 opacity-40"
                          />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((row) =>
              row.depth === 0 ? (
                <tr key={row.id}>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={row.getToggleExpandedHandler()}
                      aria-expanded={row.getIsExpanded()}
                      className="inline-flex items-center gap-2 font-bold text-ink tabular-nums"
                    >
                      {row.getIsExpanded() ? (
                        <ChevronDown
                          aria-hidden
                          className="size-4 text-muted"
                        />
                      ) : (
                        <ChevronRight
                          aria-hidden
                          className="size-4 text-muted"
                        />
                      )}
                      {row.original.pieceId}
                      <span className="font-normal text-muted">
                        {row.subRows.length}{" "}
                        {row.subRows.length === 1 ? "colour" : "colours"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {row.original.quantity}
                  </td>
                </tr>
              ) : (
                <tr key={row.id} className="bg-canvas">
                  <td className="py-2 pr-4 pl-13">{row.original.colourName}</td>
                  <td className="px-4 py-2 text-muted tabular-nums">
                    {row.original.quantity}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {distinctPieceCount === 0 && (
          <p className="px-4 py-6 text-sm text-muted">
            No pieces match that filter.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Showing {pieceRows.length.toLocaleString()} of{" "}
          {distinctPieceCount.toLocaleString()} pieces
        </span>
        {remainingRows > 0 && (
          <Button
            variant="secondary"
            onClick={() => table.setPageSize(pieceRows.length + PAGE_SIZE)}
          >
            Show {Math.min(remainingRows, PAGE_SIZE)} more
          </Button>
        )}
      </div>
    </div>
  );
};
