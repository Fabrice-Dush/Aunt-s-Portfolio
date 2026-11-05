import type { Result } from "../auth/api";

type RecordVersion = { id: string; updatedAt: string };

export async function collectionOrder(
  row: RecordVersion,
  neighbor: RecordVersion,
  load: (page: number) => Promise<Result<RecordVersion[]>>,
) {
  const rows: RecordVersion[] = [];
  for (let page = 1; page <= 5; page++) {
    const result = await load(page);
    rows.push(...result.data);
    if (!result.pagination?.hasMore) break;
    if (page === 5)
      throw new Error("For collections over 100 records, edit the Display order field instead.");
  }
  const index = rows.findIndex((item) => item.id === row.id);
  const other = rows.findIndex((item) => item.id === neighbor.id);
  if (
    index < 0 || other < 0 || Math.abs(index - other) !== 1 ||
    rows[index]!.updatedAt !== row.updatedAt ||
    rows[other]!.updatedAt !== neighbor.updatedAt ||
    new Set(rows.map((item) => item.id)).size !== rows.length
  ) throw new Error("This collection changed. Refresh it before changing the order.");
  [rows[index], rows[other]] = [rows[other]!, rows[index]!];
  return rows.map((item, sortOrder) => ({
    id: item.id, expectedUpdatedAt: item.updatedAt, sortOrder,
  }));
}
