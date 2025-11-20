import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeamAll } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card, Form, Row, Col, Button, Pagination, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RTable from "../../components/RTable";
import {
  FaCommentDots,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaFilter,
  FaSyncAlt,
  FaUser,
  FaCalendarAlt,
  FaSearch,
  FaEye,
  FaBriefcase,
  FaEnvelope,
  FaUserCircle,
  FaTimes,
  FaKeyboard,
  FaBackspace,
} from "react-icons/fa";

const DemandesListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
    dateEnvoiTraitement: "",
  });
  const [selectedDemande, setSelectedDemande] = useState(null);

  const dispatch = useDispatch();
  const demandePreviewTeamAdmin = useSelector(
    (state) => state.demandePreviewTeamAdmin
  );

  const {
    loading: demandePreviewTeamAdminLoading,
    error: demandePreviewTeamAdminError,
    success: demandePreviewTeamAdminSuccess,
    demandes,
    pagination,
  } = demandePreviewTeamAdmin;
  const navigate = useNavigate();
  
  const { current: currentLanguage } = useSelector((state) => state.language);
  const isRTL = currentLanguage === "ar";
  
  const [showArKbDemandeur, setShowArKbDemandeur] = useState(false);
  const [showArKbFonction, setShowArKbFonction] = useState(false);
  const arabicKeys = [
    "ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د",
    "ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط",
    "ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","ذ"
  ];

  
  const containerStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-light)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-sm)",
    padding: "24px",
    fontFamily: "inherit",
    color: "var(--text-primary)",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--border-light)",
  };
  const titleStyle = {
    color: "var(--text-primary)",
    fontWeight: "600",
    fontSize: "1.25rem",
    margin: 0,
    textAlign: isRTL ? "right" : "left",
  };
  const addButtonStyle = {
    background: "#4287f5",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexDirection: isRTL ? "row-reverse" : "row",
    height: "40px",
    transition: "all 0.2s ease",
  };
  const tableHeaderStyle = {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontWeight: "600",
    fontSize: "0.875rem",
    textAlign: isRTL ? "right" : "left",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-light)",
  };
  const tableCellStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-light)",
    verticalAlign: "middle",
    textAlign: isRTL ? "right" : "left",
  };
  const actionButtonStyle = {
    padding: "8px 12px",
    fontSize: "0.75rem",
    margin: "0 4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    borderRadius: "8px",
    height: "32px",
    transition: "all 0.2s ease",
    flexDirection: isRTL ? "row-reverse" : "row",
  };
  const formGroupStyle = {
    marginBottom: "1rem",
  };
  const formLabelStyle = {
    fontWeight: "500",
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  };

  const viewDetailsButtonStyle = {
    ...actionButtonStyle,
    background: "#4287f5",
    color: "#fff",
    border: "1px solid #4287f5",
  };

  
  const translations = {
    fr: {
      title: "Gestion des Demandes",
      subtitle: "Gérer toutes les demandes en cours",
      filters: "Filtres de recherche",
      reset: "Réinitialiser",
      demandeur: "Demandeur",
      fonction: "Fonction",
      status: "Statut",
      dateDemande: "Date Demande",
      dateEnvoi: "Date Envoi",
      search: "Rechercher",
      total: "Demandes",
      results: "résultats",
      showBy: "Afficher par :",
      id: "ID",
      applicant: "Demandeur",
      function: "Fonction",
      option: "Option",
      date: "Date Demande",
      sentDate: "Date Envoi",
      signataires: "Signataires",
      state: "Statut",
      actions: "Actions",
      noRequests: "Aucune demande trouvée pour les filtres sélectionnés.",
      viewDetails: "Voir les détails",
      detailsTitle: "Détails de la demande",
      close: "Fermer",
      
      "en cours": "En cours",
      approuve: "Approuvé",
      refuse: "Refusé",
      termine: "Terminé",
      
      vacances: "Vacances",
      "conge maladie": "Congé maladie",
      formation: "Formation",
      deplacement: "Déplacement",
      manager: "Manager",
      technicien: "Technicien",
      comptable: "Comptable",
      commercial: "Commercial",
      "n/a": "N/A",
    },
    en: {
      title: "Request Management",
      subtitle: "Manage all ongoing requests",
      filters: "Search Filters",
      reset: "Reset",
      demandeur: "Applicant",
      fonction: "Function",
      status: "Status",
      dateDemande: "Request Date",
      dateEnvoi: "Sent Date",
      search: "Search",
      total: "Requests",
      results: "results",
      showBy: "Show by :",
      id: "ID",
      applicant: "Applicant",
      function: "Function",
      option: "Option",
      date: "Request Date",
      sentDate: "Sent Date",
      signataires: "Signatories",
      state: "Status",
      actions: "Actions",
      noRequests: "No requests found for the selected filters.",
      viewDetails: "View Details",
      detailsTitle: "Request Details",
      close: "Close",
      
      "en cours": "In Progress",
      approuve: "Approved",
      refuse: "Rejected",
      termine: "Terminated",
      
      vacances: "Vacation",
      "conge maladie": "Sick Leave",
      formation: "Training",
      deplacement: "Travel",
      manager: "Manager",
      technicien: "Technician",
      comptable: "Accountant",
      commercial: "Salesperson",
      "n/a": "N/A",
    },
    ar: {
      title: "إدارة الطلبات",
      subtitle: "إدارة جميع الطلبات الجارية",
      filters: "فلاتر البحث",
      reset: "إعادة تعيين",
      demandeur: "المتقدم",
      fonction: "الوظيفة",
      status: "الحالة",
      dateDemande: "تاريخ الطلب",
      dateEnvoi: "تاريخ الإرسال",
      search: "بحث",
      total: "الطلبات",
      results: "نتائج",
      showBy: "عرض حسب :",
      id: "المعرف",
      applicant: "المتقدم",
      function: "الوظيفة",
      option: "الخيار",
      date: "تاريخ الطلب",
      sentDate: "تاريخ الإرسال",
      signataires: "الموقعون",
      state: "الحالة",
      actions: "الإجراءات",
      noRequests: "لم يتم العثور على طلبات للفلاتر المحددة.",
      viewDetails: "عرض التفاصيل",
      detailsTitle: "تفاصيل الطلب",
      close: "إغلاق",
      
      "en cours": "قيد المعالجة",
      approuve: "موافق عليه",
      refuse: "مرفوض",
      termine: "منتهي",
      
      vacances: "إجازة",
      "conge maladie": "إجازة مرضية",
      formation: "تدريب",
      deplacement: "تنقل",
      manager: "مدير",
      technicien: "فني",
      comptable: "محاسب",
      commercial: "مندوب مبيعات",
      "n/a": "غير متوفر",
    },
  };
  const t = translations[currentLanguage] || translations.fr;

  
  const getTranslatedValue = (key) => {
    const normalizedKey = key?.toLowerCase() || "";
    return t[normalizedKey] || key;
  };

  
  const statusColors = {
    "en cours": "warning",
    approuve: "success",
    refuse: "danger",
    termine: "info",
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || "";
    const color = statusColors[normalizedStatus] || "secondary";
    let icon = <FaCommentDots className={isRTL ? "ms-1" : "me-1"} />;
    switch (normalizedStatus) {
      case "approuve":
        icon = <FaCheckCircle className={isRTL ? "ms-1" : "me-1"} />;
        break;
      case "refuse":
        icon = <FaTimesCircle className={isRTL ? "ms-1" : "me-1"} />;
        break;
      case "en cours":
        icon = <FaHourglassHalf className={isRTL ? "ms-1" : "me-1"} />;
        break;
      case "termine":
        icon = <FaCheckCircle className={isRTL ? "ms-1" : "me-1"} />;
        break;
      default:
        icon = <FaInfoCircle className={isRTL ? "ms-1" : "me-1"} />;
    }
    return (
      <Badge
        pill
        bg={color}
        className="d-inline-flex align-items-center"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        {icon}
        {t[normalizedStatus] || status}
      </Badge>
    );
  };

  
  const handleViewDetails = (demande) => {
    setSelectedDemande(demande);
  };

  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props}>
      {message}
    </Tooltip>
  );

  
  const getLocaleForDate = () => {
    return "fr-FR";
  };

  
  const handleRowClick = (demandeId) => {
    navigate(`/demandes/apercu/details/${demandeId}`);
  };

  
  const loadDemandes = () => {
    const query = {
      page: currentPage,
      limit: itemsPerPage,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      ),
    };
    dispatch(getDemandesPreviewTeamAll(query));
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
    e.preventDefault();
    setCurrentPage(1); 
    loadDemandes();
  };

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  
  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); 
  };

  
  const clearFilters = () => {
    setFilters({
      demandeur: "",
      option: "",
      status: "",
      fonction: "",
      dateDemande: "",
      dateEnvoiTraitement: "",
    });
    setCurrentPage(1);
    dispatch(getDemandesPreviewTeamAll({ page: 1, limit: itemsPerPage }));
  };

  return (
    <div style={containerStyle} dir={isRTL ? "rtl" : "ltr"}>
      {demandePreviewTeamAdminError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamAdminError}
        </Message>
      )}

      {}
      <div style={headerStyle}>
        <div style={{ textAlign: isRTL ? "right" : "left" }}>
          <h2 style={titleStyle}>{t.title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 0 }}>{t.subtitle}</p>
        </div>
      </div>

      <Card style={{ border: "none", marginBottom: "24px", background: "var(--bg-primary)" }}>
        <Card.Header style={{ ...headerStyle, borderBottom: "none" }}>
          <h5 style={{ ...titleStyle, fontSize: "1rem" }}>
            <FaFilter className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
            {t.filters}
          </h5>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearFilters}
            style={{ ...actionButtonStyle, background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          >
            <FaSyncAlt />
            <span className={isRTL ? "me-1" : "ms-1"}>{t.reset}</span>
          </Button>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row className="g-2">
              <Col xs={6} md={4} lg={2}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={formLabelStyle}>
                    <FaUser className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
                    {t.demandeur}
                  </Form.Label>
                  <div className="d-flex align-items-center" style={{ gap: 6 }}>
                    <Form.Control
                      type="text"
                      placeholder={isRTL ? "الاسم أو اللقب" : "Nom ou prénom"}
                      value={filters.demandeur}
                      onChange={(e) => handleFilterChange("demandeur", e.target.value)}
                      size="sm"
                      style={{
                        textAlign: isRTL ? "right" : "left",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-light)",
                        minWidth: 180
                      }}
                    />
                    {isRTL && (
                      <>
                        <Button type="button" variant="light" size="sm" className="rounded-pill" onClick={() => setShowArKbDemandeur((v)=>!v)} style={{ border: '1px solid var(--border-light)', lineHeight: 1, padding: '2px 8px' }}>
                          <FaKeyboard />
                        </Button>
                        {showArKbDemandeur && (
                          <div className="border rounded p-2 bg-white shadow-sm" style={{ zIndex: 20000, position: 'fixed' }} onMouseDown={(e)=>e.preventDefault()}>
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(11, 1fr)', gap: 2 }}>
                              {arabicKeys.map((k, idx)=> (
                                <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>handleFilterChange('demandeur', (filters.demandeur||'') + k)}>{k}</Button>
                              ))}
                              <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> handleFilterChange('demandeur', (filters.demandeur||'').slice(0,-1))}><FaBackspace /></Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={formLabelStyle}>
                    <FaBriefcase className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
                    {t.fonction}
                  </Form.Label>
                  <div className="d-flex align-items-center" style={{ gap: 6 }}>
                    <Form.Control
                      type="text"
                      placeholder={isRTL ? "الوظيفة" : "Fonction"}
                      value={filters.fonction}
                      onChange={(e) => handleFilterChange("fonction", e.target.value)}
                      size="sm"
                      style={{
                        textAlign: isRTL ? "right" : "left",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-light)",
                        minWidth: 180
                      }}
                    />
                    {isRTL && (
                      <>
                        <Button type="button" variant="light" size="sm" className="rounded-pill" onClick={() => setShowArKbFonction((v)=>!v)} style={{ border: '1px solid var(--border-light)', lineHeight: 1, padding: '2px 8px' }}>
                          <FaKeyboard />
                        </Button>
                        {showArKbFonction && (
                          <div className="border rounded p-2 bg-white shadow-sm" style={{ zIndex: 20000, position: 'fixed' }} onMouseDown={(e)=>e.preventDefault()}>
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(11, 1fr)', gap: 2 }}>
                              {arabicKeys.map((k, idx)=> (
                                <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>handleFilterChange('fonction', (filters.fonction||'') + k)}>{k}</Button>
                              ))}
                              <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> handleFilterChange('fonction', (filters.fonction||'').slice(0,-1))}><FaBackspace /></Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={formLabelStyle}>
                    <FaInfoCircle className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
                    {t.status}
                  </Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    size="sm"
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-light)",
                    }}
                  >
                    <option value="">{isRTL ? "الكل" : "Tous"}</option>
                    <option value="en cours">{t["en cours"]}</option>
                    <option value="approuve">{t["approuve"]}</option>
                    <option value="refuse">{t["refuse"]}</option>
                    <option value="termine">{t["termine"]}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={formLabelStyle}>
                    <FaCalendarAlt className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
                    {t.dateDemande}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateDemande}
                    onChange={(e) => handleFilterChange("dateDemande", e.target.value)}
                    size="sm"
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-light)",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={formLabelStyle}>
                    <FaEnvelope className={isRTL ? "ms-2" : "me-2"} style={{ color: "#0d6efd" }} />
                    {t.dateEnvoi}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateEnvoiTraitement}
                    onChange={(e) => handleFilterChange("dateEnvoiTraitement", e.target.value)}
                    size="sm"
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-light)",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={8} lg={2} className="d-flex align-items-center" style={{ paddingTop: "20px" }}>
                <Button
                  type="submit"
                  className="w-100 d-flex align-items-center justify-content-center rounded-pill"
                  style={{ ...addButtonStyle, height: "31px", padding: "0.25rem 0.5rem" }}
                  size="sm"
                >
                  <FaSearch />
                  <span className={isRTL ? "me-1" : "ms-1"}>{t.search}</span>
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {demandePreviewTeamAdminLoading ? (
        <TableLoading />
      ) : demandes && demandes.length > 0 ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <div
              className="d-flex justify-content-between align-items-center mb-3"
              style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
            >
              <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                {t.total}{" "}
                <span className="text-muted fw-normal" style={{ color: "var(--text-secondary)" }}>
                  ({pagination.totalItems} {t.results})
                </span>
              </h6>
              <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <span className={isRTL ? "ms-2 small" : "me-2 small"} style={{ color: "var(--text-secondary)" }}>
                  {t.showBy}
                </span>
                <Form.Select
                  size="sm"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number.parseInt(e.target.value))}
                  style={{
                    width: "auto",
                    fontSize: "0.875rem",
                    textAlign: isRTL ? "right" : "left",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>{t.id}</th>
                  <th style={tableHeaderStyle}>{t.applicant}</th>
                  <th style={tableHeaderStyle}>{t.option}</th>
                  <th style={tableHeaderStyle}>{t.date}</th>
                  <th style={tableHeaderStyle}>{t.state}</th>
                  <th style={tableHeaderStyle}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((demande) => (
                  <tr key={demande._id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={tableCellStyle}>
                      <strong style={{ color: "var(--text-primary)" }}>{demande._id.substring(0, 8)}...</strong>
                    </td>
                    <td style={tableCellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <FaUserCircle style={{ color: "#4287f5" }} />
                        <span
                          style={{ color: "var(--text-primary)" }}
                        >{`${demande.demandeur.nom} ${demande.demandeur.prenom}`}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <FaCommentDots style={{ color: "#4287f5" }} />
                        <span style={{ color: "var(--text-primary)" }}>
                          {getTranslatedValue(demande.option.libelle)}
                        </span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <FaCalendarAlt style={{ color: "#4287f5" }} />
                        <span style={{ color: "var(--text-primary)" }}>
                          {new Date(demande.dateDemande).toLocaleDateString(getLocaleForDate())}
                        </span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>{getStatusBadge(demande.status)}</td>
                    <td style={tableCellStyle}>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) => renderTooltip(props, t.viewDetails)}
                      >
                        <span>
                          <Button
                            variant="primary"
                            size="sm"
                            style={viewDetailsButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(demande);
                            }}
                          >
                            <FaEye />
                            <span className={isRTL ? "me-1" : "ms-1"}>{t.viewDetails}</span>
                          </Button>
                        </span>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination size="sm">
                  <Pagination.First disabled={!pagination.hasPrevPage} onClick={() => setCurrentPage(1)} />
                  <Pagination.Prev disabled={!pagination.hasPrevPage} onClick={() => setCurrentPage(currentPage - 1)} />
                  {Array.from({ length: pagination.endPage - pagination.startPage + 1 }, (_, i) => {
                    const pageNumber = pagination.startPage + i;
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next disabled={!pagination.hasNextPage} onClick={() => setCurrentPage(currentPage + 1)} />
                  <Pagination.Last
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage(pagination.totalPages)}
                  />
                </Pagination>
              </div>
            )}
          </div>
          {}
          {selectedDemande && (
            <Card
              className="mt-4"
              style={{ border: "1px solid var(--border-light)", borderRadius: "12px", background: "var(--bg-primary)" }}
            >
              <Card.Header
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <h5 style={{ ...titleStyle, fontSize: "1rem", margin: 0 }}>
                  <FaInfoCircle className={isRTL ? "ms-2 text-primary" : "me-2 text-primary"} />
                  {t.detailsTitle}
                </h5>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setSelectedDemande(null)}
                  style={{
                    color: "var(--text-secondary)",
                    border: "none",
                    flexDirection: isRTL ? "row-reverse" : "row",
                  }}
                >
                  <FaTimes />
                  <span className={isRTL ? "me-1" : "ms-1"}>{t.close}</span>
                </Button>
              </Card.Header>
              <Card.Body style={{ textAlign: isRTL ? "right" : "left" }}>
                <Row className="g-3">
                  <Col md={6}>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.applicant}:</strong> {selectedDemande.demandeur.nom} {selectedDemande.demandeur.prenom}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.function}:</strong> {getTranslatedValue(selectedDemande.demandeur.fonction)}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.option}:</strong> {getTranslatedValue(selectedDemande.option.libelle)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.date}:</strong>{" "}
                      {new Date(selectedDemande.dateDemande).toLocaleDateString(getLocaleForDate())}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.sentDate}:</strong>{" "}
                      {selectedDemande.traitement.length > 0
                        ? new Date(selectedDemande.traitement[0].dateEnvoi).toLocaleDateString(getLocaleForDate())
                        : getTranslatedValue("n/a")}
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>
                      <strong>{t.state}:</strong> {getStatusBadge(selectedDemande.status)}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </>
      ) : (
        demandePreviewTeamAdminSuccess && <WarningMessage message={t.noRequests} />
      )}
    </div>
  );
};

export default DemandesListPage;
