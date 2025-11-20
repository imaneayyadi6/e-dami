import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeam } from "../../redux/demande/demandeActions";
import { fetchOptions } from "../../redux/option/optionActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card, Form, Row, Col, Button, Pagination, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaUser, FaBriefcase, FaListAlt, FaCalendarAlt, FaInfoCircle, FaListOl, FaSearch, FaSyncAlt } from "react-icons/fa";

const DemandesPreviewPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
  });
  const [tableFilters, setTableFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
  });
  const [activeFilters, setActiveFilters] = useState({}); 
  
  const [showArKbDemandeur, setShowArKbDemandeur] = useState(false);
  const [showArKbFonction, setShowArKbFonction] = useState(false);
  const demandeurGroupRef = useRef(null);
  const fonctionGroupRef = useRef(null);
  const [kbDemandeurPos, setKbDemandeurPos] = useState(null);
  const [kbFonctionPos, setKbFonctionPos] = useState(null);

  const dispatch = useDispatch();
  const demandePreviewTeam = useSelector((state) => state.demandePreviewTeam);
  const optionList = useSelector((state) => state.optionList);

  const {
    loading: demandePreviewTeamLoading,
    error: demandePreviewTeamError,
    success: demandePreviewTeamSuccess,
    demandes,
    pagination,
    teamOptions,
  } = demandePreviewTeam;

  const {
    loading: loadingOptionList,
    error: errorOptionList,
    success: successOptionList,
    options,
  } = optionList;

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguageSync();
  const arabicKeys = [
    "ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د",
    "ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط",
    "ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","ذ"
  ];
  const appendArabicChar = (field, ch) => {
    handleTableFilterChange(field, (tableFilters[field] || '') + ch);
  };

  
  const loadDemandes = (customFilters = null) => {
    const filtersToUse = customFilters || activeFilters || filters;

    
    const statusValue = filtersToUse.status ? normalizeStatus(filtersToUse.status) : '';
    const canonicalStatus = statusValue === 'en cours'
      ? 'en cours'
      : statusValue === 'approuve'
      ? 'approuve'
      : statusValue === 'refuse'
      ? 'refuse'
      : statusValue === 'en_attente'
      ? 'en_attente'
      : statusValue === 'termine'
      ? 'termine'
      : '';

    const query = {
      page: currentPage,
      limit: itemsPerPage,
      ...Object.fromEntries(
        Object.entries({ ...filtersToUse, status: canonicalStatus || undefined }).filter(([, value]) => value !== "" && value !== undefined)
      ),
    };
    dispatch(getDemandesPreviewTeam(query));
  };

  useEffect(() => {
    loadDemandes();
  }, [currentPage, itemsPerPage]);

  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1); 
    
    
    const combinedFilters = { ...filters, ...tableFilters };
    setActiveFilters(combinedFilters); 
    loadDemandes(combinedFilters);
  };

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  
  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); 
  };

  
  const handleTableFilterChange = (field, value) => {
    setTableFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  
  const clearFilters = () => {
    const clearedFilters = {
      demandeur: "",
      option: "",
      status: "",
      fonction: "",
      dateDemande: "",
    };
    setFilters(clearedFilters);
    setTableFilters(clearedFilters);
    setActiveFilters({}); 
    setCurrentPage(1);
    loadDemandes(clearedFilters);
  };

  const locale = currentLanguage === 'ar' ? 'ar' : 'fr-FR';

  const tr = (key, def) => t(`requests.${key}`, { defaultValue: def });

  const normalizeStatus = (status) => {
    let s = String(status || '').toLowerCase().trim();
    
    s = s.replace(/_/g, ' ');
    s = s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, ''); 

    
    
    if (s.includes('approuv')) return 'approuve';
    if (s.includes('refus')) return 'refuse';
    if (s.includes('term')) return 'termine';
    if (s.replace(/\s+/g, '') === 'encours' || s === 'en cours') return 'en cours';
    if (s.includes('attent')) return 'en_attente';

    return s;
  };

  const getStatusVariant = (status) => {
    const s = normalizeStatus(status);
    if (s === 'approuve') return 'success';
    if (s === 'refuse') return 'danger';
    if (s === 'en cours') return 'warning';
    if (s === 'en_attente') return 'info';
    if (s === 'termine') return 'info';
    return 'secondary';
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {demandePreviewTeamError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamError}
        </Message>
      )}
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            {tr('teamRequests', "Gestion des demandes")}
          </h2>
        </div>
        <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
          <Button
            type="button"
            size="sm"
            onClick={handleFilterSubmit}
            className="rounded-pill d-flex align-items-center justify-content-center"
            style={{
              background: '#4287f5',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              padding: '6px 14px',
              gap: 8,
              height: 32,
            }}
          >
            <FaSearch />
            <span className={isRTL ? 'me-1' : 'ms-1'}>{currentLanguage === 'ar' ? 'بحث' : tr('search', 'Rechercher')}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={clearFilters}
            className="rounded-pill d-flex align-items-center justify-content-center"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              padding: '6px 14px',
              gap: 8,
              height: 32,
            }}
          >
            <FaSyncAlt />
            <span className={isRTL ? 'me-1' : 'ms-1'}>{tr('reset', 'Réinitialiser')}</span>
          </Button>
        </div>
      </div>

      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>

            {}
          <div className="d-flex align-items-center mb-3" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {}
            <div className="d-flex align-items-center" style={{ flexDirection: 'row', order: isRTL ? 2 : 1 }}>
              {isRTL ? (
                <>
                  <Form.Label size="sm" className="mb-0 me-2">
                    <FaListOl className="me-2" style={{ color: '#0d6efd' }} />
                    {tr('itemsPerPage', 'Éléments par page:')}
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    style={{ width: "100px", display: "inline-block", textAlign: 'right' }}
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </Form.Select>
                </>
              ) : (
                <>
                  <Form.Label size="sm" className="mb-0 me-2">
                    <FaListOl className="me-2" style={{ color: '#0d6efd' }} />
                    {tr('itemsPerPage', 'Éléments par page:')}
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    style={{ width: "100px", display: "inline-block", textAlign: 'left' }}
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </Form.Select>
                </>
              )}
            </div>
            {pagination && (
              <div style={{ order: isRTL ? 1 : 2, textAlign: isRTL ? 'left' : 'right', marginInlineEnd: isRTL ? 'auto' : 0 }}>
                <small className="text-muted">
                  {tr('showing', 'Affichage de')} {((currentPage - 1) * itemsPerPage) + 1} {tr('to', 'à')} {Math.min(currentPage * itemsPerPage, pagination.totalItems)} {tr('of', 'sur')} {pagination.totalItems} {currentLanguage === 'ar' ? 'إدارة الطلبات' : tr('management', 'Gestion des demandes')}
                </small>
              </div>
            )}
          </div>

          {demandePreviewTeamLoading && <TableLoading />}
          
          {}
          <div className="mb-3 p-0">
            <Row className="g-3">
              <Col xs={12} sm={6} md={2}>
                <Form.Group className="mb-0">
                  <Form.Label size="sm" className="mb-1 d-flex align-items-center" style={{ whiteSpace: 'nowrap' }}>
                    <FaUser className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd', fontSize: 16 }} />
                    {currentLanguage === 'ar' ? 'المتقدم' : tr('applicant', 'Demandeur')}
                  </Form.Label>
                  <div className="d-flex align-items-center" style={{ gap: 6, marginInlineEnd: isRTL ? 16 : 0 }}>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={tableFilters.demandeur}
                    onChange={(e) => handleTableFilterChange("demandeur", e.target.value)}
                    placeholder={tr('nameOrSurname', 'Nom ou prénom...')}
                      style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 180 }}
                    />
                    {}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group className="mb-0">
                  <Form.Label size="sm" className="mb-1 d-flex align-items-center">
                    <FaBriefcase className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                    {tr('function', 'Fonction')}
                  </Form.Label>
                  <div className="d-flex align-items-center" style={{ gap: 6 }}>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={tableFilters.fonction}
                    onChange={(e) => handleTableFilterChange("fonction", e.target.value)}
                    placeholder={tr('functionPlaceholder', 'Fonction...')}
                      style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 180 }}
                    />
                    {}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group className="mb-0">
                  <Form.Label size="sm" className="mb-1 d-flex align-items-center">
                    <FaListAlt className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                    {tr('requestType', 'Type de demande')}
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={tableFilters.option}
                    onChange={(e) => handleTableFilterChange("option", e.target.value)}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <option value="">{tr('allTypes', 'Tous les types')}</option>
                    {teamOptions && teamOptions.length > 0 &&
                      teamOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.libelle}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group className="mb-0">
                  <Form.Label size="sm" className="mb-1 d-flex align-items-center">
                    <FaCalendarAlt className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                    {tr('requestDate', 'Date de demande')}
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={tableFilters.dateDemande}
                    onChange={(e) => handleTableFilterChange("dateDemande", e.target.value)}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group className="mb-0">
                  <Form.Label size="sm" className="mb-1 d-flex align-items-center">
                    <FaInfoCircle className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                    {tr('status', 'Status')}
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={tableFilters.status}
                    onChange={(e) => handleTableFilterChange("status", e.target.value)}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  >
                    <option value="">{tr('allStatuses', 'Tous les statuts')}</option>
                    <option value="en cours">{tr('inProgress', 'En cours')}</option>
                    <option value="approuve">{tr('approved', 'Approuvé')}</option>
                    <option value="refuse">{tr('rejected', 'Refusé')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {}
          {Object.values(activeFilters || {}).some((v) => v) && (
            <div className="mb-3 d-flex flex-wrap align-items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <small className="text-muted">{tr('filters', 'Filtres actifs')}:</small>
              {Object.entries(activeFilters)
                .filter(([_, v]) => v)
                .map(([k, v]) => (
                  <span key={k} className="badge rounded-pill text-bg-light border d-inline-flex align-items-center" style={{ gap: 8 }}>
                    <span className="text-muted">{tr(k, k)}</span>
                    <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
                    <button
                      type="button"
                      className="btn-close btn-close" 
                      aria-label="Close"
                      onClick={() => {
                        const nf = { ...(activeFilters || {}) };
                        nf[k] = '';
                        setActiveFilters(nf);
                        loadDemandes(nf);
                      }}
                      style={{ filter: 'invert(0.5)', marginInlineStart: 4 }}
                    />
                  </span>
                ))}
              <Button variant="link" size="sm" onClick={clearFilters} className="text-decoration-none">
                {tr('reset', 'Réinitialiser')}
              </Button>
            </div>
          )}

          {demandes && demandes.length > 0 ? (
            <>
              <div className="table-responsive rounded border bg-body">
              <Table
                columns={[
                  {
                      Header: tr('id', 'ID'),
                    accessor: "_id",
                    show: false,
                  },
                  {
                      Header: currentLanguage === 'ar' ? 'المتقدم' : tr('applicant', 'Demandeur'),
                      accessor: (row) => row,
                      Cell: ({ value }) => {
                        const prenom = value?.demandeur?.prenom || '';
                        const nom = value?.demandeur?.nom || '';
                        const initials = `${(prenom[0] || 'U').toUpperCase()}${(nom[0] || '').toUpperCase()}`;
                        return (
                          <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              <div className="fw-semibold" style={{ fontSize: 14 }}>{`${nom} ${prenom}`.trim() || 'N/A'}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>{value?._id?.substring(0, 8)}...</div>
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      Header: tr('function', 'Fonction'),
                      accessor: (row) => row?.demandeur?.fonction || 'N/A',
                    },
                    {
                      Header: tr('requestType', 'Type de demande'),
                      accessor: (row) => row?.option?.libelle || 'N/A',
                    },
                    {
                      Header: tr('requestDate', 'Date de demande'),
                    accessor: "dateDemande",
                    Cell: ({ value }) => {
                      const date = new Date(value);
                      return (
                          <div className="text-muted" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          <div style={{ fontSize: "0.85em", lineHeight: "1.2" }}>
                              {date.toLocaleDateString(locale, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div style={{ fontSize: "0.75em", opacity: "0.8" }}>
                              {date.toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                      Header: tr('signatories', 'Signataires'),
                    accessor: "signataires",
                    Cell: ({ value }) => {
                      if (!value || value.length === 0) {
                          return <span className="text-muted">{tr('none', 'Aucun')}</span>;
                      }
                      
                      return (
                        <div className="d-flex flex-wrap gap-1">
                          {value.map((sig, index) => {
                              let badgeClass = "badge rounded-pill px-2 py-1 me-1 mb-1";
                            
                              switch (normalizeStatus(sig.status)) {
                              case "approuve":
                                badgeClass += " text-bg-success text-white";
                                break;
                              case "refuse":
                                badgeClass += " text-bg-danger text-white";
                                break;
                              case "en cours":
                                badgeClass += " text-bg-warning text-white";
                                break;
                              default:
                                badgeClass += " text-bg-secondary text-white";
                            }
                            
                            return (
                              <span 
                                key={index} 
                                className={badgeClass}
                                  style={{ fontSize: '0.7rem' }}
                                  title={`${sig?.nom || 'N/A'} ${sig?.prenom || 'N/A'}\n${tr('asRole', 'En tant que')}: ${sig?.titre || 'N/A'}\n${tr('status', 'Statut')}: ${sig?.status || 'N/A'}`}
                                >
                                  {sig?.nom ? `${sig.nom.charAt(0)}.${sig.prenom.charAt(0)}.` : 'N/A'}
                              </span>
                            );
                          })}
                        </div>
                      );
                    },
                  },
                  {
                      Header: tr('status', 'Status'),
                    accessor: "status",
                      Cell: ({ value }) => {
                        const normalizedStatus = normalizeStatus(value);
                        let badgeClass = "badge rounded-pill px-2 py-1";
                        
                        switch (normalizedStatus) {
                          case "approuve":
                            badgeClass += " text-bg-success text-white";
                            break;
                          case "refuse":
                            badgeClass += " text-bg-danger text-white";
                            break;
                          case "en cours":
                            badgeClass += " text-bg-warning text-white";
                            break;
                          case "en_attente":
                            badgeClass += " text-bg-info text-white";
                            break;
                          case "termine":
                            badgeClass += " text-bg-info text-white";
                            break;
                          default:
                            badgeClass += " text-bg-secondary text-white";
                        }
                        
                        return (
                          <span className={badgeClass} style={{ fontSize: '0.7rem' }}>
                            {tr(String(normalizedStatus || '').toLowerCase(), value)}
                          </span>
                        );
                      }
                  },
                ]}
                data={demandes}
                disableFilters={true} 
                disablePagination={true} 
                showDetailsLink="/demandes/apercu/details"
                  detailsLabel={currentLanguage === 'ar' ? 'تفاصيل' : tr('details', 'Détails')}
                rowClick={(id) => {
                  navigate(`/demandes/apercu/details/${id}`);
                }}
              />
              </div>
              
              {}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-3 d-flex justify-content-center">
                  <div
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{
                      backdropFilter: 'saturate(180%) blur(6px)',
                      background: 'rgba(13,110,253,0.06)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <Button
                      variant="light"
                      size="sm"
                      className={`rounded-pill px-2 ${isRTL ? 'ms-1' : 'me-1'}`}
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'}></i>
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className={`rounded-pill px-2 ${isRTL ? 'ms-2' : 'me-2'}`}
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'}></i>
                    </Button>

                    {(() => {
                      const total = pagination.totalPages;
                      const pages = [];
                      const addPage = (p) => pages.push(
                        <Button
                          key={p}
                          variant={p === currentPage ? 'primary' : 'light'}
                          size="sm"
                          className={`rounded-pill ${isRTL ? 'ms-1' : 'me-1'} ${p === currentPage ? 'shadow-sm' : ''}`}
                          style={{ minWidth: 36 }}
                          onClick={() => handlePageChange(p)}
                          disabled={p === currentPage}
                        >
                          {p}
                        </Button>
                      );

                      const showEllipsis = (key) => (
                        <span key={key} className={`text-muted ${isRTL ? 'ms-1' : 'me-1'}`}>…</span>
                      );

                      if (total <= 7) {
                        for (let p = 1; p <= total; p++) addPage(p);
                      } else {
                        addPage(1);
                        if (currentPage > 4) pages.push(showEllipsis('l'));
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(total - 1, currentPage + 1);
                        for (let p = start; p <= end; p++) addPage(p);
                        if (currentPage < total - 3) pages.push(showEllipsis('r'));
                        addPage(total);
                      }
                      return pages;
                    })()}

                    <Button
                      variant="light"
                      size="sm"
                      className={`rounded-pill px-2 ${isRTL ? 'me-2' : 'ms-2'}`}
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className={`rounded-pill px-2 ${isRTL ? 'me-1' : 'ms-1'}`}
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.totalPages)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right'}></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            demandePreviewTeamSuccess && (
              <Card className="border-0 bg-body-tertiary text-center py-5">
                <Card.Body>
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' }}>
                    <i className="fa-regular fa-folder-open" style={{ color: '#0d6efd', fontSize: 28 }}></i>
                  </div>
                  <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{tr('noTeamRequests', 'Aucune demande trouvée')}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{tr('applyFilters', 'Essayez d\'ajuster les filtres pour élargir la recherche.')}</div>
                </Card.Body>
              </Card>
            )
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DemandesPreviewPage;
