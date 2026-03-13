import { Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { TimelineGroup } from "../../lib/timelineGroups";

interface TimelineGroupHeaderProps {
  group: TimelineGroup;
  colSpan: number;
}

/**
 * Renders a header row for a timeline group.
 * Era groups: accent background with nickname and year range.
 * Non-era groups: thin border line only.
 */
export default function TimelineGroupHeader({
  group,
  colSpan,
}: TimelineGroupHeaderProps) {
  if (group.type === "era") {
    const { era, years } = group;
    const rangeText =
      years.length > 0
        ? `${years[0]}-${years[years.length - 1]}`
        : `${era.startYear}-${era.endYear}`;
    return (
      <tr>
        <td
          colSpan={colSpan}
          className="bg-accent-primary px-[1em] py-[0.25em] text-left"
        >
          <Text size="body2" hierarchy="primary">
            {rangeText} {era.nickname || "Unnamed Era"}
          </Text>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td
        colSpan={colSpan}
        className="h-[0.5em] border-l-[0.5em] border-l-border-tertiary border-t-[0.5em] border-t-border-tertiary p-0 align-middle"
      />
    </tr>
  );
}
