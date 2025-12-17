import { Button } from "@/components/ui/button";

export default function TablePagination({
  page,
  totalPages,
  pageSize,
  setPage,
  setPageSize
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      {/* Rows selector */}
      <div className="flex items-center gap-2 text-sm">
        <span>Rows per page:</span>
        <select
          className="border rounded px-2 py-1"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
