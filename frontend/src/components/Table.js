import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useTable, usePagination, useFilters } from "react-table";
import { useLanguageSync } from "../hooks/useLanguageSync";
import { FaKeyboard, FaBackspace } from "react-icons/fa";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Link } from "react-router-dom";

const TextFilter = ({ column }) => {
  const { currentLanguage, isRTL } = useLanguageSync();
  const [localValue, setLocalValue] = useState(column.filterValue || "");
  const [showArKb, setShowArKb] = useState(false);
  const [kbPos, setKbPos] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const arabicKeys = [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ];

  useEffect(() => {
    setLocalValue(column.filterValue || "");
  }, [column.filterValue]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (column.setFilter) column.setFilter(localValue || undefined);
    }, 200);
    return () => clearTimeout(id);
  }, [localValue, column]);

  const insertArabicChar = (char) => {
    const input = inputRef.current;
    const current = localValue || "";
    const start = input && input.selectionStart != null ? input.selectionStart : current.length;
    const end = input && input.selectionEnd != null ? input.selectionEnd : current.length;
    let next = current;
    if (char === '⌫') {
      if (start === end && start > 0) {
        next = current.slice(0, start - 1) + current.slice(end);
        setLocalValue(next);
        setTimeout(() => input && input.setSelectionRange(start - 1, start - 1), 0);
      } else if (start !== end) {
        next = current.slice(0, start) + current.slice(end);
        setLocalValue(next);
        setTimeout(() => input && input.setSelectionRange(start, start), 0);
      }
    } else {
      const toInsert = char === '␣' ? ' ' : char;
      next = current.slice(0, start) + toInsert + current.slice(end);
      setLocalValue(next);
      const newCaret = start + toInsert.length;
      setTimeout(() => input && input.setSelectionRange(newCaret, newCaret), 0);
    }
    setTimeout(() => input && input.focus(), 0);
  };

  const headerLabel = (
    column.filterLabel || column.headerText || (
      typeof column.Header === "string"
    ? column.Header
        : (() => {
            const id = String(column.id || column.accessor || "");
            if (currentLanguage === 'ar') {
              if (id === 'libelle') return 'التسمية';
              if (id === 'direction.libelle') return 'الإدارة';
              if (id === 'service.libelle') return 'المصلحة';
              if (id === 'sousCategorie.libelle' || id === 'souscategorie.libelle') return 'الفئة الفرعية';
              if (id === 'typeProcessus') return 'نوع العملية';
              if (id === 'matricule') return 'الرقم الإداري';
              if (id === 'email') return 'البريد الإلكتروني';
              if (id === 'fonction') return 'الوظيفة';
              if (id === 'directeur') return 'المدير';
              if (id === 'chefService') return 'رئيس المصلحة';
              if (id.toLowerCase() === 'nom' || id.toLowerCase() === 'prenom' || id.toLowerCase() === 'nomcomplet') return 'الاسم واللقب';
            }
            return id;
          })()
    )
  );

  const showKeyboard = Boolean(column.enableArabicKeyboard) && (isRTL || (currentLanguage && String(currentLanguage).toLowerCase().startsWith('ar')));

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
      <Form.Control
        ref={inputRef}
        size="sm"
        style={{ minWidth: "250px", textAlign: isRTL ? 'right' : 'left' }}
        value={localValue}
        type={column.type ? column.type : "text"}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={`${currentLanguage === 'ar' ? 'تصفية حسب' : 'filtrer par'} ${String(headerLabel)}`}
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={isRTL ? 'ar' : undefined}
      />
      {showKeyboard && (
        <Button
          type="button"
          variant="light"
          size="sm"
          onMouseDown={(e)=>e.preventDefault()}
          onClick={(e) => {
            const rect = btnRef.current ? btnRef.current.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
            setKbPos({ top: rect.bottom + 6 + window.scrollY, left: (isRTL ? rect.right : rect.left) + window.scrollX });
            setShowArKb(v=>!v);
          }}
          className="rounded-pill"
          style={{ lineHeight: 1, padding: '2px 8px', border: '1px solid var(--border-light)' }}
          aria-label={showArKb ? 'إخفاء لوحة المفاتيح' : 'إظهار لوحة المفاتيح'}
          ref={btnRef}
        >
          <FaKeyboard />
        </Button>
      )}
      {showKeyboard && showArKb && (
        <div className="border rounded p-2" style={{ position: 'fixed', top: kbPos.top, left: isRTL ? undefined : kbPos.left, right: isRTL ? (window.innerWidth - kbPos.left) : undefined, background: 'var(--bg-secondary)', zIndex: 20000, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} onMouseDown={(e)=>e.preventDefault()}>
          <div className="d-flex flex-wrap" style={{ gap: 4, maxWidth: 260 }}>
            {arabicKeys.map((k) => (
              <Button key={k} size="sm" variant="light" onClick={() => insertArabicChar(k)} style={{ padding: '2px 6px' }}>{k}</Button>
            ))}
            <Button size="sm" variant="light" onClick={() => insertArabicChar('␣')} style={{ padding: '2px 6px' }}>{currentLanguage === 'ar' ? 'مسافة' : 'Espace'}</Button>
            <Button size="sm" variant="outline-danger" onClick={() => insertArabicChar('⌫')} style={{ padding: '2px 6px' }}><FaBackspace /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownFilter = ({ column }) => {
  const { currentLanguage, isRTL } = useLanguageSync();
  const { filterValue, setFilter } = column;

  const options = React.useMemo(() => {
    if (Array.isArray(column.filterOptions)) {
      return column.filterOptions;
    }
    const set = new Set();
    if (Array.isArray(column.preFilteredRows)) {
    column.preFilteredRows.forEach((row) => {
        if (row.values[column.id]) set.add(row.values[column.id]);
    });
    }
    return Array.from(set);
  }, [column.filterOptions, column.preFilteredRows, column.id]);

  const headerLabel = (
    column.filterLabel || column.headerText || (
      typeof column.Header === "string"
    ? column.Header
        : (() => {
            const id = String(column.id || column.accessor || "");
            if (currentLanguage === 'ar') {
              if (id === 'libelle') return 'التسمية';
              if (id === 'direction.libelle') return 'الإدارة';
              if (id === 'service.libelle') return 'المصلحة';
              if (id === 'sousCategorie.libelle' || id === 'souscategorie.libelle') return 'الفئة الفرعية';
              if (id === 'typeProcessus') return 'نوع العملية';
              if (id === 'matricule') return 'الرقم الإداري';
              if (id === 'email') return 'البريد الإلكتروني';
              if (id === 'fonction') return 'الوظيفة';
              if (id === 'directeur') return 'المدير';
              if (id === 'chefService') return 'رئيس المصلحة';
              if (id.toLowerCase() === 'nom' || id.toLowerCase() === 'prenom' || id.toLowerCase() === 'nomcomplet') return 'الاسم واللقب';
            }
            return id;
          })()
    )
  );

  return (
    <Form.Select
      style={{ minWidth: "200px", textAlign: isRTL ? 'right' : 'left' }}
      size="sm"
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="">
        {`-------- ${currentLanguage === 'ar' ? 'يرجى الاختيار' : 'veuillez selectionner'} (${String(headerLabel).toLowerCase()}) --------`}
      </option>
      {options && options.map((option, index) => (
        <option key={index} value={option}>
          {String(option).toLowerCase()}
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
  showDetailsRowSpecificData,
  showDetailsLink,
  disableFilters = false,
  disablePagination = false,
  detailsLabel = "details",
  headerActions = null,
  restoreRow,
  onFilterChange,
  emptyStateComponent = null,
}) => {
  const [callOnce, setCallOnce] = useState(false);
  const { currentLanguage } = useLanguageSync();

  const filteredColumns = useMemo(
    () => columns.filter((column) => column.accessor !== "_id"),
    [columns]
  );
  const filteredData = useMemo(() => data, [data]);

  const tableConfig = {
    columns: filteredColumns,
    data: filteredData,
  };

  
  const tableHooks = [useFilters];
  if (!disablePagination) {
    tableHooks.push(usePagination);
  }

  const tableInstance = useTable(tableConfig, ...tableHooks);
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    state,
  } = tableInstance;

  
  useEffect(() => {
    if (onFilterChange) {
      const hasActiveFilters = Object.values(state.filters || {}).some(filter => 
        filter && filter.value && filter.value.toString().trim() !== ""
      );
      onFilterChange(hasActiveFilters);
    }
  }, [state.filters, onFilterChange]);

  
  const {
    nextPage = () => {},
    previousPage = () => {},
    canNextPage = false,
    canPreviousPage = false,
    pageOptions = [],
    gotoPage = () => {},
    pageCount = 0,
    setPageSize = () => {},
  } = disablePagination ? {} : tableInstance;

  
  const rowsToDisplay = disablePagination ? rows : page;

  const { pageIndex } = state || {};

  useEffect(() => {
    if (!callOnce && !disablePagination) {
      setPageSize(10);
      setCallOnce(true);
    }
  }, [callOnce, disablePagination]);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props} className="bg-warning">
      {currentLanguage === 'ar' ? 'هذا السطر لم يتم حفظه بعد في قاعدة البيانات' : "Cette ligne n'est pas encore enregistrée dans la base de données"}
    </Tooltip>
  );

  const renderPaginationButtons = () => {
    const pageButtons = [];

    
    pageButtons.push(
      <Button
        variant="light"
        size="sm"
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
        key="first"
      >
        &laquo;&laquo;
      </Button>
    );

    pageButtons.push(
      <Button
        variant="light"
        size="sm"
        disabled={!canPreviousPage}
        onClick={() => previousPage()}
        key="previous"
      >
        &laquo;
      </Button>
    );

    
    const range = 5; 
    const start = Math.max(1, pageIndex - Math.floor(range / 2)) - 1;
    const end = Math.min(pageCount, start + range - 1);

    for (let i = start; i <= end; i++) {
      pageButtons.push(
        <Button
          size="sm"
          variant="light"
          key={i}
          onClick={() => gotoPage(i)}
          className={i === pageIndex ? "active" : ""}
        >
          {i + 1}
        </Button>
      );
    }

    
    pageButtons.push(
      <Button
        variant="light"
        size="sm"
        disabled={!canNextPage}
        onClick={() => nextPage()}
        key="next"
      >
        &raquo;
      </Button>
    );

    pageButtons.push(
      <Button
        variant="light"
        size="sm"
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
      <div className="table-responsive">
        <table
          {...getTableProps()}
          className={`table table-sm table-hover  ${
            loadingRemove && "table-active"
          }`}
        >
          <thead className="">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    <div className="d-flex flex-column justify-content-center inline-text">
                      <small>{column.render("Header")}</small>
                      {!disableFilters && column.filter ? (
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
                        <div style={{ marginBottom: disableFilters ? "0px" : "32px" }}></div>
                      )}
                    </div>
                  </th>
                ))}
                <th>
                  {headerActions && (
                    <div className="d-flex align-items-center justify-content-end" style={{ gap: 8 }}>
                      {headerActions}
                    </div>
                  )}
                </th>
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rowsToDisplay.map((row) => {
              prepareRow(row);
              const rowId = row.original._id;
              const isDeleted = row.original.isDeleted;
              if (row.original.notSavedYet) {
                return (
                  <OverlayTrigger placement="left" overlay={renderTooltip}>
                    <tr
                      {...row.getRowProps()}
                      className={`pointer-auto position-relative`}
                      onClick={() => {
                        if (rowClick) {
                          rowClick(rowId);
                        }
                      }}
                    >
                      {row.cells.map((cell) => {
                        
                        const columnName = cell.column.Header;
                        if (
                          cell.value === null ||
                          cell.value === undefined ||
                          cell.value === ""
                        ) {
                          
                          
                          const missingWord = currentLanguage === 'ar' ? 'غير موجود' : 'introuvable';
                          const undefinedWord = currentLanguage === 'ar' ? 'غير معرّف' : 'Non défini';
                          let displayMessage = `(${columnName}) ${missingWord}`;
                          
                          if (columnName === "Créateur") {
                            
                            const rowData = cell.row?.original;
                            if (rowData?.createur?.nom && rowData?.createur?.prenom) {
                              displayMessage = `${rowData.createur.prenom} ${rowData.createur.nom}`;
                            } else if (rowData?.createur?.nom) {
                              displayMessage = rowData.createur.nom;
                            } else {
                              displayMessage = undefinedWord;
                            }
                          } else if (columnName === "Service") {
                            displayMessage = undefinedWord;
                          } else if (columnName === "Direction") {
                            displayMessage = undefinedWord;
                          }

                          return (
                            <td className="empty-cell column-text">
                              <small className="column-text text-muted">
                                {displayMessage}
                              </small>
                            </td>
                          );
                        }


                        return (
                          <td
                            {...cell.getCellProps()}
                            className={`column-text ${
                              row.original.notSavedYet && "text-warning"
                            }`}
                          >
                            <small>
                              {cell.render("Cell")}
                            </small>
                          </td>
                        );
                      })}

                      <td>
                        <div className="d-flex justify-content-end">
                          {showDetailsLink && (
                            <Link
                              to={showDetailsLink}
                              className="btn btn-sm btn-light"
                            >
                              {detailsLabel}
                            </Link>
                          )}

                          {(showDetailsRow || showDetailsRowSpecificData) &&
                            !row.original.notSavedYet && (
                              <span
                                className="pointer-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (showDetailsRowSpecificData) {
                                    showDetailsRowSpecificData.function(
                                      ...showDetailsRowSpecificData.columns.map(
                                        (col) => {
                                          if (col.split(".").length > 1) {
                                            return row.original[
                                              col.split(".")[0]
                                            ][0][col.split(".")[1]];
                                          } else return row.original[col];
                                        }
                                      )
                                    );
                                  }
                                  if (showDetailsRow) showDetailsRow(rowId);
                                }}
                              >
                                <i className="fa-solid fa-eye mr-1"></i>
                              </span>
                            )}

                          {updateRow && (
                            <span
                              className="pointer-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (updateRow) updateRow(rowId);
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square mr-1"></i>
                            </span>
                          )}

                          {removeRow && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm d-inline-flex align-items-center justify-content-center"
                              onMouseDown={(e) => { e.preventDefault(); }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isDeleted && typeof restoreRow === 'function') {
                                  restoreRow(rowId);
                                } else {
                                  removeRow(rowId);
                                }
                              }}
                              style={{ lineHeight: 1, width: 28, height: 28 }}
                              title={isDeleted ? "Restore" : "Delete"}
                              aria-label={isDeleted ? "Restore" : "Delete"}
                            >
                              {isDeleted ? (
                                <i className="fa-solid fa-trash-can-arrow-up text-primary"></i>
                              ) : (
                              <i className="fas fa-trash text-danger"></i>
                              )}
                            </button>
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
                    className={`pointer-auto position-relative ${
                      isDeleted ? "table-danger" : ""
                    }`}
                    onClick={() => {
                      if (rowClick) {
                        rowClick(rowId);
                      }
                    }}
                  >
                    {row.cells.map((cell) => {
                      
                      const columnName = cell.column.Header;
                      if (
                        cell.value === null ||
                        cell.value === undefined ||
                        cell.value === ""
                      ) {
                        
                        
                        const missingWord2 = currentLanguage === 'ar' ? 'غير موجود' : 'introuvable';
                        const undefinedWord2 = currentLanguage === 'ar' ? 'غير معرّف' : 'Non défini';
                        let displayMessage = `(${columnName}) ${missingWord2}`;
                        
                        if (columnName === "Créateur") {
                          
                          const rowData = cell.row?.original;
                          if (rowData?.createur?.nom && rowData?.createur?.prenom) {
                            displayMessage = `${rowData.createur.prenom} ${rowData.createur.nom}`;
                          } else if (rowData?.createur?.nom) {
                            displayMessage = rowData.createur.nom;
                          } else {
                            displayMessage = "Non défini";
                          }
                        } else if (columnName === "Service") {
                            displayMessage = undefinedWord2;
                        } else if (columnName === "Direction") {
                            displayMessage = undefinedWord2;
                        }

                        return (
                          <td className="empty-cell column-text">
                            <small className="text-muted">
                              {displayMessage}
                            </small>
                          </td>
                        );
                      }


                                              return (
                          <td
                            {...cell.getCellProps()}
                            className={`column-text ${
                              row.original.notSavedYet && "text-warning"
                            }`}
                          >
                            <small>
                              {cell.render("Cell")}
                            </small>
                          </td>
                        );
                    })}

                    <td>
                      <div className="d-flex justify-content-end">
                        {showDetailsLink && (
                          <Link
                            to={showDetailsLink + "/" + rowId}
                            className="btn btn-sm btn-light"
                          >
                            {detailsLabel}
                          </Link>
                        )}

                        {(showDetailsRow || showDetailsRowSpecificData) &&
                          !row.original.notSavedYet && (
                            <span
                              className="pointer-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (showDetailsRowSpecificData) {
                                  showDetailsRowSpecificData.function(
                                    ...showDetailsRowSpecificData.columns.map(
                                      (col) => {
                                        if (col.split(".").length > 1) {
                                          return row.original[
                                            col.split(".")[0]
                                          ][0][col.split(".")[1]];
                                        } else return row.original[col];
                                      }
                                    )
                                  );
                                }
                                if (showDetailsRow) showDetailsRow(rowId);
                              }}
                            >
                              <i className="fa-solid fa-eye mr-1"></i>
                            </span>
                          )}
                        {updateRow && (
                          <span
                            className="pointer-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (updateRow) updateRow(rowId);
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square mr-1"></i>
                          </span>
                        )}
                        {removeRow && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm d-inline-flex align-items-center justify-content-center"
                            onMouseDown={(e) => { e.preventDefault(); }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isDeleted && typeof restoreRow === 'function') {
                                restoreRow(rowId);
                              } else {
                                removeRow(rowId);
                              }
                            }}
                            style={{ lineHeight: 1, width: 28, height: 28 }}
                            title={isDeleted ? "Restore" : "Delete"}
                            aria-label={isDeleted ? "Restore" : "Delete"}
                          >
                            {!isDeleted ? (
                              <i className="fas fa-trash text-danger"></i>
                            ) : (
                              <i className="fa-solid fa-trash-can-arrow-up text-primary"></i>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
      
      {}
      {((disablePagination ? rows.length === 0 : page.length === 0)) && ((Array.isArray(data) ? data.length : 0) > 0) && emptyStateComponent && (
        <div className="d-flex justify-content-center py-4">
          {emptyStateComponent}
        </div>
      )}
      {!disablePagination && (
        <div className="d-flex justify-content-center mt-3">
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
            style={{ backdropFilter: 'saturate(180%) blur(6px)', background: 'rgba(13,110,253,0.06)', border: '1px solid var(--border-light)' }}
          >
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Table);
