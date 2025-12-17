import { useState, useMemo } from "react";

export function usePagination(data = [], defaultPageSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData
  };
}
