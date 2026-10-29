import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { BuildStatusKind, SetMatch } from "@/domain/model";
import { BuildStatus } from "@/components/sets/build-status";
import { Button } from "@/components/ui/button";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    equals: filterFn_equals,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, SetMatch>();

const columns = helper.columns([
  helper.accessor("setNumber", { header: "Set ID", sortFn: "alphanumeric" }),
  helper.accessor("name", { header: "Set name", sortFn: "alphanumeric" }),
  helper.accessor("totalPieces", {
    header: "Total pieces",
    sortFn: "basic",
    enableGlobalFilter: false,
  }),
  helper.accessor("ownedPieces", {
    header: "Owned pieces",
    sortFn: "basic",
    enableGlobalFilter: false,
  }),
  helper.accessor("status", {
    header: "Status",
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
  }),
]);

const statusFilters: ReadonlyArray<{
  value: BuildStatusKind | null;
  label: string;
}> = [
  { value: null, label: "All" },
  { value: "buildable", label: "Can build" },
  { value: "unbuildable", label: "Can't build" },
];

const PAGE_SIZE = 50;

export const SetTable = ({ matches }: { matches: ReadonlyArray<SetMatch> }) => {
  const table = useTable({
    features,
    columns,
    data: matches,
    globalFilterFn: "includesString",
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
  });

  const rows = table.getRowModel().rows;
  const rowCount = table.getFilteredRowModel().rows.length;
  const remaining = rowCount - rows.length;
  const statusColumn = table.getColumn("status");
  const activeStatus =
    (statusColumn?.getFilterValue() as BuildStatusKind | undefined) ?? null;

  const onSearchChange = (value: string) => {
    table.setGlobalFilter(value);
    table.setPageSize(PAGE_SIZE);
  };

  const onStatusChange = (value: BuildStatusKind | null) => {
    statusColumn?.setFilterValue(value ?? undefined);
    table.setPageSize(PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search by set ID or name"
          aria-label="Search sets"
          value={table.state.globalFilter ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full max-w-sm rounded border border-line bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        />
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex rounded border border-line bg-surface"
        >
          {statusFilters.map((f) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={activeStatus === f.value}
              onClick={() => onStatusChange(f.value)}
              className="h-9 px-3 text-sm font-bold text-muted first:rounded-l last:rounded-r hover:text-ink aria-pressed:bg-primary aria-pressed:text-on-primary"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const numeric =
                    header.column.id === "totalPieces" ||
                    header.column.id === "ownedPieces";
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-2.5 font-bold ${numeric ? "text-right" : ""}`}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-ink"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ChevronUp aria-hidden className="size-4" />
                          ) : sorted === "desc" ? (
                            <ChevronDown aria-hidden className="size-4" />
                          ) : (
                            <ChevronsUpDown
                              aria-hidden
                              className="size-4 opacity-40"
                            />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2.5 font-bold tabular-nums">
                  <Link
                    to="/sets/$setId"
                    params={{ setId: row.original.id }}
                    className="text-primary hover:underline"
                  >
                    {row.original.setNumber}
                  </Link>
                </td>
                <td className="px-4 py-2.5">{row.original.name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {row.original.totalPieces.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {row.original.ownedPieces.toLocaleString()}
                </td>
                <td className="px-4 py-2.5">
                  <BuildStatus
                    status={row.original.status}
                    missing={row.original.missingPieces}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rowCount === 0 && (
          <p className="px-4 py-6 text-sm text-muted">No sets match.</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Showing {rows.length.toLocaleString()} of {rowCount.toLocaleString()}{" "}
          sets
        </span>
        {remaining > 0 && (
          <Button
            variant="secondary"
            onClick={() => table.setPageSize(rows.length + PAGE_SIZE)}
          >
            Show {Math.min(remaining, PAGE_SIZE)} more
          </Button>
        )}
      </div>
    </div>
  );
};
