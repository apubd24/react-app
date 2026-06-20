import { useState, useEffect } from 'react';

export const useDevicePagination = (items, dependencies = []) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // PAGINATION
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentItems = items.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(
    items.length / rowsPerPage
  );

  // RESET PAGE
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  return {
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    currentItems,
    totalPages,
    indexOfFirstRow,
    indexOfLastRow,
  };
};
