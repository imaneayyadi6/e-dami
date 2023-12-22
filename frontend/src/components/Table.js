import React, { useEffect, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { useTable, usePagination, useFilters } from "react-table";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const TextFilter = ({ column }) => {
  const handleFilterChange = e => {
    column.setFilter(e.target.value);
  };

  return (
    <Form.Control
      size='sm'
      style={{ minWidth: "250px" }}
      value={column.filterValue || ""}
      type={column.type ? column.type : "text"}
      onChange={handleFilterChange}
      placeholder={`filtrer par ${column.Header}`}
    />
  );
};

const DropdownFilter = ({ column }) => {
  const { filterValue, setFilter } = column;

  const uniqueDirections = React.useMemo(() => {
    const options = new Set();
    column.preFilteredRows.forEach(row => {
      if (row.values[column.id]) options.add(row.values[column.id]);
    });
    return Array.from(options);
  }, [column.preFilteredRows]);

  return (
    <Form.Select
      style={{ minWidth: "250px" }}
      size='sm'
      value={filterValue || ""}
      onChange={e => setFilter(e.target.value)}>
      <option value=''>
        -------- veuillez selectionner ({column.Header}) --------
      </option>
      {uniqueDirections.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </Form.Select>
  );
};

const Table = ({
  data,
  columns,
  showDetailsRow,
  removeRow,
  updateRow,
  rowClick,
  loadingRemove,
  dropdownFilters,
  showDetailsRowSpecificData
}) => {
  const COLUMNS = useMemo(
    () => columns.filter(column => !true || column.accessor !== "_id"),
    []
  );
  const DATA = useMemo(() => data, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    state,
  } = useTable(
    {
      columns: COLUMNS,
      data: DATA,
    },
    useFilters,
    usePagination
  );


  const { pageIndex } = state;

  useEffect(() => {
    setPageSize(7);
  }, [setPageSize]);

  const renderTooltip = props => (
    <Tooltip id='button-tooltip' {...props} className='bg-warning'>
      Cette ligne n'est pas encore enregistrée dans la base de données
    </Tooltip>
  );



  const renderPaginationButtons = () => {
    const pageButtons = [];

    // Previous Button
    pageButtons.push(
      <Button
        variant='light'
        size='sm'
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
        key="first"
      >
        &laquo;&laquo;
      </Button>
    );

    pageButtons.push(
      <Button
        variant='light'
        size='sm'
        disabled={!canPreviousPage}
        onClick={() => previousPage()}
        key="previous"
      >
        &laquo;
      </Button>
    );

    // Page Number Buttons
    const range = 5; // Number of pages to display at a time
    const start = Math.max(1, pageIndex - Math.floor(range / 2)) - 1;
    const end = Math.min(pageCount, start + range - 1);

    for (let i = start; i <= end - 1; i++) {
      pageButtons.push(
        <Button
          size='sm'
          variant='light'
          key={i}
          onClick={() => gotoPage(i)}
          className={i === pageIndex ? 'active' : ''}
        >
          {i + 1}
        </Button>
      );
    }

    // Next Button
    pageButtons.push(
      <Button
        variant='light'
        size='sm'
        disabled={!canNextPage}
        onClick={() => nextPage()}
        key="next"
      >
        &raquo;
      </Button>
    );

    pageButtons.push(
      <Button
        variant='light'
        size='sm'
        disabled={!canNextPage}
        onClick={() => gotoPage(pageCount - 1)}
        key="last"
      >
        &raquo;&raquo;
      </Button>
    );

    return pageButtons;
  };


  return (
    <>
      <div className='table-responsive'>
        <table
          {...getTableProps()}
          className={`table table-sm table-hover  ${loadingRemove && "table-active"
            }`}>
          <thead className=''>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    <div className='d-flex flex-column justify-content-center inline-text'>
                      <small>{column.render("Header")}</small>
                      {column.filter ? (
                        <div>
                          {dropdownFilters &&
                            dropdownFilters.includes(column.filter) ? (
                            <DropdownFilter
                              column={column}
                              options={column.filterOptions || []}
                            />
                          ) : (
                            <TextFilter column={column} />
                          )}
                        </div>
                      ) : (
                        <div style={{ marginBottom: "32px" }}></div>
                      )}
                    </div>
                  </th>
                ))}
                <th></th>
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              const rowId = row.original._id;

              if (row.original.notSavedYet) {
                return (
                  <OverlayTrigger placement='left' overlay={renderTooltip}>
                    <tr
                      {...row.getRowProps()}
                      className={`cursor-pointer position-relative`}
                      onClick={() => {
                        if (rowClick) {
                          rowClick(rowId);
                        }
                      }}>
                      {row.cells.map(cell => {
                        // Check if the cell is empty (you can customize this condition)
                        const columnName = cell.column.Header;
                        if (
                          cell.value === null ||
                          cell.value === undefined ||
                          cell.value === ""
                        ) {
                          // Get the column name from the cell object and include it in the message

                          return (
                            <td className='empty-cell column-text'>
                              <small className='column-text text-danger'>
                                ({columnName}) introuvable
                              </small>
                            </td>
                          );
                        }
                        return (
                          <td
                            {...cell.getCellProps()}
                            className={`column-text ${row.original.notSavedYet && "text-warning"
                              }`}>
                            <small>{cell.render("Cell")}</small>
                          </td>
                        );
                      })}

                      <td>
                        <div className='d-flex justify-content-end'>
                          {(showDetailsRow || showDetailsRowSpecificData) && !row.original.notSavedYet && (
                            <span
                              className='cursor-pointer'
                              onClick={e => {
                                e.stopPropagation();
                                if (showDetailsRowSpecificData) {
                                  showDetailsRowSpecificData.function(...showDetailsRowSpecificData.columns.map(col => {
                                    if (col.split(".").length > 1) {
                                      return row.original[col.split('.')[0]][0][col.split('.')[1]];
                                    }
                                    else
                                      return row.original[col];
                                  }))
                                }
                                if (showDetailsRow) showDetailsRow(rowId);
                              }}>
                              <i className='fa-solid fa-eye mr-1'></i>
                            </span>
                          )}
                          {updateRow && (
                            <span
                              className='cursor-pointer'
                              onClick={e => {
                                e.stopPropagation();
                                if (updateRow) updateRow(rowId);
                              }}>
                              <i className='fa-solid fa-pen-to-square mr-1'></i>
                            </span>
                          )}
                          {removeRow && (
                            <span
                              className='cursor-pointer'
                              onClick={e => {
                                e.stopPropagation();
                                if (removeRow) removeRow(rowId);
                              }}>
                              <i className='fas fa-trash text-danger'></i>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </OverlayTrigger>
                );
              } else {
                return (
                  <tr
                    {...row.getRowProps()}
                    className={`cursor-pointer position-relative`}
                    onClick={() => {
                      if (rowClick) {
                        rowClick(rowId);
                      }
                    }}>
                    {row.cells.map(cell => {
                      // Check if the cell is empty (you can customize this condition)
                      const columnName = cell.column.Header;
                      if (
                        cell.value === null ||
                        cell.value === undefined ||
                        cell.value === ""
                      ) {
                        // Get the column name from the cell object and include it in the message

                        return (
                          <td className='empty-cell column-text'>
                            <small className='text-danger'>
                              ({columnName}) introuvable
                            </small>
                          </td>
                        );
                      }
                      return (
                        <td
                          {...cell.getCellProps()}
                          className={`column-text ${row.original.notSavedYet && "text-warning"
                            }`}>
                          <small
                            className={`${columnName === "status"
                              ? `table-text-status-${String(
                                cell.value
                              ).replace(/\s/g, "")}`
                              : ""
                              }`}>
                            {cell.render("Cell")}
                          </small>
                        </td>
                      );
                    })}

                    <td>
                      <div className='d-flex justify-content-end'>
                        {(showDetailsRow || showDetailsRowSpecificData) && !row.original.notSavedYet && (
                          <span
                            className='cursor-pointer'
                            onClick={e => {
                              e.stopPropagation();
                              if (showDetailsRowSpecificData) {
                                showDetailsRowSpecificData.function(...showDetailsRowSpecificData.columns.map(col => {
                                  if (col.split(".").length > 1) {
                                    return row.original[col.split('.')[0]][0][col.split('.')[1]];
                                  }
                                  else
                                    return row.original[col];
                                }))
                              }
                              if (showDetailsRow) showDetailsRow(rowId);
                            }}>
                            <i className='fa-solid fa-eye mr-1'></i>
                          </span>
                        )}
                        {updateRow && (
                          <span
                            className='cursor-pointer'
                            onClick={e => {
                              e.stopPropagation();
                              if (updateRow) updateRow(rowId);
                            }}>
                            <i className='fa-solid fa-pen-to-square mr-1'></i>
                          </span>
                        )}
                        {removeRow && (
                          <span
                            className='cursor-pointer'
                            onClick={e => {
                              e.stopPropagation();
                              if (removeRow) removeRow(rowId);
                            }}>
                            <i className='fas fa-trash text-danger'></i>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div >
      <hr />
      <div className='d-flex justify-content-center mt-2'>
        <div className='d-flex align-items-center'>
          <small>
            Page{" "}
            <span style={{ fontWeight: "bold" }}>
              {pageIndex + 1} de {pageOptions.length}
            </span>
          </small>
          <div>{renderPaginationButtons()}  </div>
        </div>
      </div>
    </>
  );
};

export default Table;
