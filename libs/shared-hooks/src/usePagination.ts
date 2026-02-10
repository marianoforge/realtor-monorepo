import { useState } from "react";

const usePagination = <T>(items: T[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const disablePagination = items.length < itemsPerPage;

  return {
    currentItems,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  };
};

export default usePagination;
