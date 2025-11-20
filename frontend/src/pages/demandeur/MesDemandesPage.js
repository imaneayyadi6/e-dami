import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMesDemandes } from '../../redux/demande/demandeActions';
import { Message, TableLoading, WarningMessage, Table } from '../../components';
import { Card, Button, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageSync } from '../../hooks/useLanguageSync';
import { FaPlus, FaCheckCircle, FaTimesCircle, FaClock, FaListOl } from 'react-icons/fa';

const MesDemandesPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const mesDemandes = useSelector(state => state.mesDemandes);
  const {
    loading: mesDemandesLoading,
    error: mesDemandesError,
    success: mesDemandesSuccess,
    demandes
  } = mesDemandes;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isRTL } = useLanguageSync();
  const currentLanguage = i18n.language;

  
  const translations = {
    fr: {
      pageTitle: "Mes Demandes",
      pageSubtitle: "Gérez et suivez vos demandes",
      refresh: "Réinitialiser",
      createDemande: "Faire une demande",
      noDemandes: "Aucune demande trouvée",
      error: "Erreur lors du chargement des demandes",
      option: "Option",
      status: "Statut",
      date: "Date de demande",
      approuve: "Approuvée",
      refuse: "Refusée",
      enCours: "En cours",
      details: "Détails",
      itemsPerPage: "Éléments par page:",
      showing: "Affichage de",
      to: "à",
      of: "sur",
      management: "Gestion des demandes"
    },
    ar: {
      pageTitle: "طلباتي",
      pageSubtitle: "إدارة ومتابعة طلباتك",
      refresh: "إعادة تعيين",
      createDemande: "إنشاء طلب",
      noDemandes: "لم يتم العثور على طلبات",
      error: "خطأ في تحميل الطلبات",
      option: "الخيار",
      status: "الحالة",
      date: "تاريخ الطلب",
      approuve: "موافق عليها",
      refuse: "مرفوضة",
      enCours: "قيد المراجعة",
      details: "التفاصيل",
      itemsPerPage: "العناصر في الصفحة:",
      showing: "عرض",
      to: "إلى",
      of: "من",
      management: "إدارة الطلبات"
    }
  };

  const currentTranslations = translations[currentLanguage] || translations.fr;

  useEffect(() => {
    if (!callOnce) {
      dispatch(getMesDemandes());
      setCallOnce(true);
    }
  }, [callOnce, dispatch]);

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  
  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  
  const getStatusBadge = (status) => {
    const statusConfig = {
      'approuve': { 
        color: 'success', 
        text: currentTranslations.approuve,
        icon: <FaCheckCircle />
      },
      'refuse': { 
        color: 'danger', 
        text: currentTranslations.refuse,
        icon: <FaTimesCircle />
      },
      'en cours': { 
        color: 'warning', 
        text: currentTranslations.enCours,
        icon: <FaClock />
      }
    };
    
    
    const mappedStatus = status === 'pending' ? 'en cours' : status;
    const config = statusConfig[mappedStatus] || statusConfig['en cours'];
    
    return (
      <Badge 
        bg={config.color} 
        style={{ 
          fontSize: '0.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    if (isRTL) {
      
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  
  const paginatedDemandes = React.useMemo(() => {
    if (!demandes) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return demandes.slice(startIndex, endIndex);
  }, [demandes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((demandes?.length || 0) / itemsPerPage);

  const locale = currentLanguage === 'ar' ? 'ar' : 'fr-FR';

  
  React.useEffect(() => {
    if (demandes && demandes.length > 0) {
      const uniqueStatuses = [...new Set(demandes.map(d => d.status))];
      console.log('🔍 Debug - Statuts uniques dans les demandes:', uniqueStatuses);
      console.log('🔍 Debug - Première demande:', demandes[0]);
    }
  }, [demandes]);

  
  const normalizeStatus = (status) => {
    let s = String(status || '').toLowerCase().trim();
    
    s = s.replace(/_/g, ' ');
    s = s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, ''); 

    
    
    if (s.includes('approuv')) return 'approuve';
    if (s.includes('refus')) return 'refuse';
    if (s.replace(/\s+/g, '') === 'encours' || s === 'en cours') return 'en cours';
    if (s.includes('attent')) return 'en_attente';
    if (s.includes('term')) return 'termine';

    return s;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {mesDemandesError && (
        <Message itWillBeHidden type="danger">
          {mesDemandesError}
        </Message>
      )}
      
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            {currentTranslations.pageTitle}
          </h2>
        </div>
        <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
          <Button
            className="btn btn-sm rounded-pill"
            onClick={() => navigate('/demandeur/faire-une-demande')}
            style={{
              background: "#4287f5",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row" }}>
              <FaPlus />
              <span>
                {currentTranslations.createDemande}
              </span>
            </span>
          </Button>
        </div>
      </div>

      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          {}
          <div className="d-flex align-items-center mb-3" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <div className="d-flex align-items-center" style={{ flexDirection: 'row', order: isRTL ? 2 : 1 }}>
              {isRTL ? (
                <>
                  <Form.Label size="sm" className="mb-0 me-2">
                    <FaListOl className="me-2" style={{ color: '#0d6efd' }} />
                    {currentTranslations.itemsPerPage}
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
                    {currentTranslations.itemsPerPage}
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
            <div style={{ order: isRTL ? 1 : 2, textAlign: isRTL ? 'left' : 'right', marginInlineEnd: isRTL ? 'auto' : 0 }}>
              <small className="text-muted">
                {currentTranslations.showing} {((currentPage - 1) * itemsPerPage) + 1} {currentTranslations.to} {Math.min(currentPage * itemsPerPage, demandes?.length || 0)} {currentTranslations.of} {demandes?.length || 0} {currentTranslations.management}
              </small>
            </div>
          </div>

          {mesDemandesLoading && <TableLoading />}

          {paginatedDemandes && paginatedDemandes.length > 0 ? (
            <>
              <div className="table-responsive rounded border bg-body">
                <Table
                  columns={[
                    {
                      Header: "ID",
                      accessor: "_id",
                      show: false,
                    },
                    {
                      Header: currentTranslations.option,
                      accessor: (row) => row?.option?.libelle || 'N/A',
                    },
                    {
                      Header: currentTranslations.date,
                      accessor: "dateDemande",
                      Cell: ({ value, row }) => {
                        const date = new Date(value || row.original.createdAt);
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
                      Header: currentTranslations.status,
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
                          default:
                            badgeClass += " text-bg-secondary text-white";
                        }
                        
                        return (
                          <span className={badgeClass} style={{ fontSize: '0.7rem' }}>
                            {normalizedStatus === 'approuve' ? currentTranslations.approuve :
                             normalizedStatus === 'refuse' ? currentTranslations.refuse :
                             normalizedStatus === 'en cours' ? currentTranslations.enCours : value}
                          </span>
                        );
                      }
                    },
                  ]}
                  data={paginatedDemandes}
                  disableFilters={true}
                  disablePagination={true}
                  showDetailsLink="/details-demande"
                  detailsLabel={currentTranslations.details}
                  rowClick={(id) => {
                    navigate(`/details-demande/${id}`);
                  }}
                />
              </div>
              
              {}
              {totalPages > 1 && (
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
                      const total = totalPages;
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
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className={`rounded-pill px-2 ${isRTL ? 'me-1' : 'ms-1'}`}
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                      <i className={isRTL ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right'}></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            mesDemandesSuccess && (
              <Card className="border-0 bg-body-tertiary text-center py-5">
                <Card.Body>
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' }}>
                    <i className="fa-regular fa-folder-open" style={{ color: '#0d6efd', fontSize: 28 }}></i>
                  </div>
                  <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{currentTranslations.noDemandes}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>Essayez d'ajuster les filtres pour élargir la recherche.</div>
                </Card.Body>
              </Card>
            )
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default MesDemandesPage