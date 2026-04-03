import { useMemo, useRef, useCallback, Fragment } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../../../../../counterfoil-kit/src/index.ts";
import type { Year } from "../../types/year";
import type { Scenario, YearInput } from "../../types/scenario";
import { ageInYear } from "../../lib/age";
import { buildDefaultYearInput } from "../../lib/yearFacts";
import { buildTimelineGroups, getGroupForYear } from "../../lib/timelineGroups";
import type { Era } from "../../types/era";
import EditableAmountCell, {
  type FocusAndEditHandle,
} from "./EditableAmountCell";
import TimelineGroupHeader from "./TimelineGroupHeader";

export interface TimelineRow {
  year: number;
  yearNum: number;
  portfolioBeg: number;
  totalIncome: number;
  totalExpenses: number;
  availableToInvest: number;
  investDivestNet: number;
  portfolioEnd: number;
  cPop: number | null;
  yearInput: YearInput;
}

interface TimelineTableProps {
  scenario: Scenario;
  years: Year[];
  selectedYear: number | null;
  onSelectYear: (year: number, openYearFactsPane?: boolean) => void;
  onSelectEra: (era: Era, focusYear: number | null) => void;
  onUpdateYearInput: (
    year: number,
    updater: (yearInput: YearInput) => YearInput
  ) => void;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCPop(cPop: number | null): string {
  if (cPop === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cPop);
}

function getCPopColorClass(cPop: number | null, swr: number): string {
  if (cPop === null) return "";
  if (cPop < swr) return "text-[var(--text-success)]";
  if (cPop <= swr + 0.01) return "text-[var(--text-warning-orange)]";
  return "text-[var(--text-error)]";
}

function buildRows(
  years: Year[],
  scenario: Scenario
): TimelineRow[] {
  const yearInputByYear = new Map(
    scenario.years.map((yi) => [yi.year, yi])
  );
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  return years.map((yr) => {
    const yearInput =
      yearInputByYear.get(yr.year) ??
      buildDefaultYearInput(yr.year, incomeEarnerIds);
    return {
      year: yr.year,
      yearNum: yr.yearNum,
      portfolioBeg: yr.portfolioBeg,
      totalIncome: yr.totalIncome,
      totalExpenses: yr.totalExpenses,
      availableToInvest: yr.availableToInvest,
      investDivestNet: yr.investDivestNet,
      portfolioEnd: yr.portfolioEnd,
      cPop: yr.cPop,
      yearInput,
    };
  });
}

const columnHelper = createColumnHelper<TimelineRow>();

/**
 * Renders the scenario timeline as an editable table.
 * Horizontal overscroll is disabled on the scroll container to prevent
 * multi-finger swipes from triggering browser back/forward navigation.
 */
export default function TimelineTable({
  scenario,
  years,
  selectedYear,
  onSelectYear,
  onSelectEra,
  onUpdateYearInput,
}: TimelineTableProps) {
  const rows = useMemo(() => buildRows(years, scenario), [years, scenario]);
  const cellRefs = useRef<Map<string, FocusAndEditHandle>>(new Map());

  const incomeEarnerFirst = useMemo(
    () =>
      [...scenario.householdMembers].sort((a, b) => {
        if (a.incomeEarner === b.incomeEarner) return 0;
        return a.incomeEarner ? -1 : 1;
      }),
    [scenario.householdMembers]
  );

  const incomeEarners = useMemo(
    () => incomeEarnerFirst.filter((m) => m.incomeEarner),
    [incomeEarnerFirst]
  );

  const editableColumnIds = useMemo(
    () => incomeEarners.map((m) => `${m.id}-wages`),
    [incomeEarners]
  );

  const registerCell = useCallback(
    (key: string, handle: FocusAndEditHandle | null) => {
      if (handle) {
        cellRefs.current.set(key, handle);
        return;
      }
      cellRefs.current.delete(key);
    },
    []
  );

  const focusNextCell = useCallback(
    (year: number, memberId: string, direction: "down" | "right"): boolean => {
      const rowIndex = rows.findIndex((r) => r.year === year);
      const colIndex = editableColumnIds.indexOf(`${memberId}-wages`);
      if (rowIndex < 0 || colIndex < 0) return false;

      let nextYear: number;
      let nextMemberId: string;

      if (direction === "down") {
        const nextRow = rows[rowIndex + 1];
        if (!nextRow) return false;
        nextYear = nextRow.year;
        nextMemberId = memberId;
      } else {
        if (colIndex < editableColumnIds.length - 1) {
          nextYear = year;
          nextMemberId = incomeEarners[colIndex + 1].id;
        } else {
          const nextRow = rows[rowIndex + 1];
          if (!nextRow) return false;
          nextYear = nextRow.year;
          nextMemberId = incomeEarners[0].id;
        }
      }

      const nextKey = `${nextYear}-${nextMemberId}-wages`;
      const handle = cellRefs.current.get(nextKey);
      if (handle) {
        onSelectYear(nextYear);
        handle.focusAndEdit();
        return true;
      }
      return false;
    },
    [rows, editableColumnIds, incomeEarners, onSelectYear]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("year", {
        header: "Year",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("portfolioBeg", {
        header: "Portfolio Beg.",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      ...incomeEarnerFirst.flatMap((member) => {
        const cols = [
          columnHelper.accessor((row) => ageInYear(member.birthday, row.year), {
            id: `${member.id}-age`,
            header: `${member.nickname || "Member"} Age`,
            cell: (info) => info.getValue(),
          }),
        ];
        if (member.incomeEarner) {
          cols.push(
            columnHelper.accessor(
              (row) => row.yearInput.wageIncome[member.id] ?? 0,
              {
                id: `${member.id}-wages`,
                header: `${member.nickname || "Member"}'s Wages`,
                cell: (info) => {
                  const row = info.row.original;
                  const value = row.yearInput.wageIncome[member.id] ?? 0;
                  const cellKey = `${row.year}-${member.id}-wages`;
                  return (
                    <EditableAmountCell
                      value={value}
                      onCommit={(n) =>
                        onUpdateYearInput(row.year, (yi) => ({
                          ...yi,
                          wageIncome: {
                            ...yi.wageIncome,
                            [member.id]: n,
                          },
                        }))
                      }
                      cellKey={cellKey}
                      registerCell={registerCell}
                      onFocusNext={(dir) =>
                        focusNextCell(row.year, member.id, dir)
                      }
                    />
                  );
                },
              }
            )
          );
        }
        return cols;
      }),
      columnHelper.accessor("totalIncome", {
        id: "income",
        header: "Income",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("totalExpenses", {
        id: "expenses",
        header: "Expenses",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("availableToInvest", {
        id: "available-to-invest",
        header: "Avail. to invest",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("investDivestNet", {
        id: "invest-divest-net",
        header: "Invest/Divest",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("portfolioEnd", {
        header: "Portfolio End",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("cPop", {
        id: "cPop",
        header: "C-POP",
        cell: (info) => {
          const cPop = info.getValue();
          const colorClass = getCPopColorClass(
            cPop,
            scenario.assumptions.safeWithdrawalRate
          );
          return (
            <span
              className={`block text-right ${colorClass}`.trim()}
            >
              {formatCPop(cPop)}
            </span>
          );
        },
      }),
    ],
    [
      incomeEarnerFirst,
      scenario.assumptions.safeWithdrawalRate,
      onUpdateYearInput,
      registerCell,
      focusNextCell,
    ]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroup = table.getHeaderGroups()[0];
  const colCount = headerGroup.headers.length;

  const timelineYears = useMemo(
    () => years.map((y) => y.year),
    [years]
  );
  const groups = useMemo(
    () => buildTimelineGroups(timelineYears, scenario.eras ?? []),
    [timelineYears, scenario.eras]
  );
  const rowByYear = useMemo(
    () => new Map(rows.map((r) => [r.year, r])),
    [rows]
  );

  function getRowBorderClass(year: number): string {
    const group = getGroupForYear(groups, year);
    if (!group) return "";
    if (group.type === "era") {
      return "border-l-[0.5em] border-l-accent-primary";
    }
    return "border-l-[0.5em] border-l-border-tertiary";
  }

  return (
    <div className="overflow-x-auto overscroll-x-none p-[2em] [&_table]:!w-auto [&_table]:table-fixed">
      <Table density="md">
        <colgroup>
          {headerGroup.headers.map((header) => (
            <col key={header.id} style={{ width: "12em" }} />
          ))}
        </colgroup>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHeaderCell key={h.id} align="left">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {groups.map((group, groupIndex) => {
            const yearRows = group.years
              .map((year) => rowByYear.get(year))
              .filter((r): r is TimelineRow => r != null);
            const tableRows = table.getRowModel().rows;
            const rowIndices = yearRows.map(
              (r) => tableRows.findIndex((tr) => tr.original.year === r.year)
            );

            return (
              <Fragment key={groupIndex}>
                <TimelineGroupHeader
                  group={group}
                  colSpan={colCount}
                  onSelectEraHeader={onSelectEra}
                />
                {rowIndices.map((idx) => {
                  if (idx < 0) return null;
                  const row = tableRows[idx];
                  const year = row.original.year;
                  const borderClass = getRowBorderClass(year);
                  const rowClass = [
                    "h-10",
                    "border-b border-border-secondary",
                    "bg-bg-primary text-text-secondary",
                    "group hover:bg-bg-primary-hover hover:text-text-primary",
                    year === selectedYear ? "bg-bg-secondary" : null,
                    "cursor-pointer",
                    borderClass,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        const inEraGroup = group.type === "era";
                        const hasOverrides =
                          (row.original.yearInput.eraMetadata?.overriddenFields?.length ?? 0) > 0;

                        if (inEraGroup && !hasOverrides) {
                          onSelectEra(group.era, year);
                          return;
                        }

                        onSelectYear(year, true);
                      }}
                      className={rowClass}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} align="left">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </tr>
                  );
                })}
                {groupIndex < groups.length - 1 && (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="h-[0.5em] p-0 bg-bg-primary"
                    />
                  </tr>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
