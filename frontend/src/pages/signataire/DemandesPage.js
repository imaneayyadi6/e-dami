import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approuveTraitement,
  refuseTraitement,
  resetApprouveTraitement,
  resetRefuseTraitement,
  getDemandesPreviewTeamAll,
} from "../../redux/demande/demandeActions";
import { generateExcel } from "../../redux/generate/generateActions";
import { Message, TableLoading, WarningMessage } from "../../components";
import { Button, Card, Form, OverlayTrigger, Popover, Badge, Modal } from "react-bootstrap";
import moment from "moment";
import { getTypeApprobation, Toast } from "../../services";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCommentDots,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaFilter,
  FaSyncAlt,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaBriefcase,
  FaEnvelope,
  FaUserCircle,
  FaTimes,
  FaFileExcel,
  FaSpinner,
  FaKeyboard,
  FaBackspace,
} from "react-icons/fa";

const DemandesPage = () => {
  const navigate = useNavigate();
  const [callOnce, setCallOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNextPages, setIsNextPages] = useState(false);

  const [option, setOption] = useState(null);
  const [demandeur, setDemandeur] = useState(null);
  const [typeApp, setTypeApp] = useState(null);
  const [status, setStatus] = useState(null);
  const [dateEnvoi, setDateEnvoi] = useState(null);
  const [dateDemande, setDateDemande] = useState(null);
  const [showCalDemande, setShowCalDemande] = useState(false);
  const [showCalEnvoi, setShowCalEnvoi] = useState(false);
  const [calRefMonth, setCalRefMonth] = useState(new Date());

  
  const [showMotifModal, setShowMotifModal] = useState(null); 
  const [motifText, setMotifText] = useState("");
  const [showArKbMotif, setShowArKbMotif] = useState(false);
  const [showArKbDemandeur, setShowArKbDemandeur] = useState(false);
  const demandeurGroupRef = useRef(null);
  const [kbDemandeurPos, setKbDemandeurPos] = useState(null);

  const { current: currentLanguage } = useSelector((state) => state.language);
  const isRTL = !!(currentLanguage && String(currentLanguage).toLowerCase().startsWith('ar'));

  
  const containerStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-light)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-sm)",
    padding: "16px",
    fontFamily: "inherit",
    color: "var(--text-primary)",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "8px",
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
    fontSize: "0.8rem",
    textAlign: isRTL ? "right" : "left",
    padding: "8px 12px",
    borderBottom: "1px solid var(--border-light)",
  };
  const tableCellStyle = {
    padding: "8px 12px",
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

  
  const translations = {
    fr: {
      title: "Traitement des Demandes",
      
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
      process: "Traiter",
      approve: "Approuver",
      reject: "Rejeter",
      excelExport: "Extraction Excel",
      generating: "Génération...",
      
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
   
    ar: {
      title: "معالجة الطلبات",
      subtitle: "معالجة الطلبات المعلقة للموافقة",
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
      process: "معالجة",
      approve: "موافقة",
      reject: "رفض",
      excelExport: "تصدير إكسل",
      generating: "جارٍ التوليد...",
      
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

  
  const arMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const arDays = ["ح","ن","ث","ر","خ","ج","س"]; 

  const toISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; 
  };

  const buildMonthMatrix = (date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = first.getDay(); 
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const cells = [];
    
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
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

  const filterHnadler = (page) => {
    setIsNextPages(false);
    let query = { page: page || 1, limit: 20 };
    if (option !== null) query.option = option;
    if (demandeur !== null) query.demandeur = demandeur;
    if (typeApp !== null) query.typeApp = typeApp;
    if (status !== null) query.status = status;
    if (dateEnvoi !== null) query.dateEnvoi = dateEnvoi;
    if (dateDemande !== null) query.dateDemande = dateDemande;

    dispatch(getDemandesPreviewTeamAll(query));
  };

  const handleValidate = (demandeId, traitementId) => {
    setMotifText("");
    setShowMotifModal({ type: 'approve', demandeId, traitementId });
  };

  const handleRefuse = (demandeId, traitementId) => {
    setMotifText("");
    setShowMotifModal({ type: 'refuse', demandeId, traitementId });
  };

  const arabicKeys = [
    "ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د",
    "ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط",
    "ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","ذ"
  ];

  const appendArabicChar = (target, ch) => {
    if (target === 'demandeur') {
      setDemandeur((prev) => (prev || '') + ch);
    } else if (target === 'motif') {
      setMotifText((prev) => (prev || '') + ch);
    }
  };

  const dispatch = useDispatch();
  const demandePreviewTeamAdmin = useSelector((state) => state.demandePreviewTeamAdmin);
  const {
    loading: demandePreviewTeamAdminLoading,
    error: demandePreviewTeamAdminError,
    success: demandePreviewTeamAdminSuccess,
    demandes,
    pagination,
  } = demandePreviewTeamAdmin;

  const userLogin = useSelector((state) => state.userLogin);
  const {
    userInfo
  } = userLogin;  

  const excelGenerate = useSelector((state) => state.excelGenerate);
  const {
    loading: loadingExcelGenerate,
    error: errorExcelGenerate,
    success: successExcelGenerate,
  } = excelGenerate;


  const demandeApprouveTraitement = useSelector(
    (state) => state.demandeApprouveTraitement
  );
  const {
    success: demandeApprouveTraitementSuccess,
    error: demandeApprouveTraitementError,
  } = demandeApprouveTraitement;

  const demandeRefuseTraitement = useSelector(
    (state) => state.demandeRefuseTraitement
  );
  const {
    success: demandeRefuseTraitementSuccess,
    error: demandeRefuseTraitementError,
  } = demandeRefuseTraitement;

  const handlePageChange = (newPage) => {
    console.log(newPage);
    setCurrentPage(newPage);
    filterHnadler(newPage);
    setIsNextPages(true);
  };

  const renderPageLinks = () => {
    if (totalPages <= 1) {
      return [
        <button key={1} className="btn btn-sm btn-primary rounded-pill px-3 text-white" disabled style={{ minWidth: 36 }}>1</button>
      ];
    }

    const buttons = [];
    const addPage = (p) => buttons.push(
      <button
        key={p}
        className={`btn btn-sm ${p === currentPage ? 'btn-primary text-white' : 'btn-light'} rounded-pill px-3 ${isRTL ? 'ms-1' : 'me-1'}`}
        style={{ minWidth: 36 }}
        onClick={() => handlePageChange(p)}
        disabled={p === currentPage}
      >
        {p}
      </button>
    );
    const addDots = (key) => (
      <span key={key} className={`text-muted ${isRTL ? 'ms-1' : 'me-1'}`}>…</span>
    );

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) addPage(p);
    } else {
      addPage(1);
      if (currentPage > 4) buttons.push(addDots('l'));
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let p = start; p <= end; p++) addPage(p);
      if (currentPage < totalPages - 3) buttons.push(addDots('r'));
      addPage(totalPages);
    }

    return buttons;
  };

  const resetFilterHandler = () => {
    setOption(null);
    setDemandeur(null);
    setTypeApp(null);
    setStatus(null);
    setDateEnvoi(null);
    setDateDemande(null);
    dispatch(getDemandesPreviewTeamAll({ page: 1, limit: 20 }));
  };

  
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  
  const getSignatureType = (traitement) => {
    const isAr = isRTL;
    const mapType = (code) => {
      switch (code) {
        case 'cds':
          return isAr ? 'رئيس المصلحة' : 'chef de service';
        case 'cdd':
          return isAr ? 'رئيس القسم' : 'chef de département';
        case 'hiq':
          return isAr ? 'المدير التسلسلي' : 'directeur hiérarchique';
        case 'dir':
          return isAr ? 'مدير الهيئة' : "directeur de l'entité";
        case 'pdd':
        case 'atr': {
          const titre = (typeof traitement.option === 'object' && traitement.option)
            ? String(traitement.option.autreResponsableTitre || '').trim()
            : '';
          if (titre) return titre;
          return isAr ? 'عنوان غير محدد' : 'titre non défini';
        }
        default:
          return isAr ? 'نوع توقيع غير محدد' : 'type de signature non défini';
      }
    };

    if (traitement && traitement.code && traitement.code.includes('.')) {
      const parts = traitement.code.split('.');
      const types = parts.map(mapType);
      return isAr ? `بصفة ${types.join(' و ')}` : `en tant que ${types.join(' et ')}`;
    }
    const single = traitement && traitement.code ? mapType(traitement.code) : '';
    return isAr ? `بصفة ${single}` : `en tant que ${single}`;
  };
  
  
  const uniqueOptions = useMemo(() => {
    if (!Array.isArray(demandes)) return [];
    const map = new Map();
    demandes.forEach((d) => {
      const opt = d && d.option;
      const id = opt && (opt._id || opt.id);
      const label = opt && opt.libelle;
      if (id && label && !map.has(String(id))) {
        map.set(String(id), String(label));
      }
    });
    return Array.from(map.entries()).map(([id, libelle]) => ({ id, libelle }));
  }, [demandes]);

  const excelHandler = () => {
    
    let filters = {};
    if (option !== null) filters.option = option; 
    if (demandeur !== null) filters.demandeur = demandeur;
    if (typeApp !== null) filters.typeApp = typeApp;
    if (status !== null) filters.status = status;
    if (dateEnvoi !== null) filters.dateEnvoi = dateEnvoi;
    if (dateDemande !== null) filters.dateDemande = dateDemande;

    
    dispatch(generateExcel(filters));
  };

  useEffect(() => {
    if (!callOnce) {
      filterHnadler(1);
      setCallOnce(true);
    }

    if (demandePreviewTeamAdminSuccess) {
      setTotalPages(pagination?.totalPages || 1);
      if (isNextPages) {
        window.scrollTo(1000000, 100000);
      }
    }
  }, [callOnce, demandePreviewTeamAdminSuccess, isNextPages]);

  
  useEffect(() => {
    if (demandeApprouveTraitementSuccess || demandeRefuseTraitementSuccess) {
      dispatch(getDemandesPreviewTeamAll({ page: currentPage, limit: 20 }));
      
      if (demandeApprouveTraitementSuccess) {
        dispatch(resetApprouveTraitement());
        Toast.open({
          type: "success",
          title: "✅ Demande approuvée avec succès !",
          message: "La demande a été approuvée et traitée avec succès",
        });
      }
      if (demandeRefuseTraitementSuccess) {
        dispatch(resetRefuseTraitement());
        Toast.open({
          type: "success",
          title: "✅ Demande refusée avec succès !",
          message: "La demande a été refusée et traitée avec succès",
        });
      }
    }
  }, [demandeApprouveTraitementSuccess, demandeRefuseTraitementSuccess, dispatch]);

  return (
    <>
      {demandePreviewTeamAdminError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamAdminError}
        </Message>
      )}
      {demandeApprouveTraitementError && !demandeApprouveTraitementSuccess && (
        <Message itWillBeHidden type="danger">
          Erreur lors de l'approbation: {demandeApprouveTraitementError}
        </Message>
      )}
      {demandeRefuseTraitementError && !demandeRefuseTraitementSuccess && (
        <Message itWillBeHidden type="danger">
          Erreur lors du refus: {demandeRefuseTraitementError}
        </Message>
      )}
      {errorExcelGenerate && (
        <Message itWillBeHidden type="danger">
          {errorExcelGenerate}
        </Message>
      )}
      {successExcelGenerate && (
        <Message itWillBeHidden type="success">
          Excel généré et téléchargé avec succès !
        </Message>
      )}
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          {demandePreviewTeamAdminLoading && <TableLoading />}

          <>
            {!demandePreviewTeamAdminLoading && demandePreviewTeamAdminSuccess && (
              <>
              <div className="d-flex align-items-center mb-3" style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
                    {t.title}
                  </h2>
                  <small className="text-muted">{t.subtitle}</small>
                </div>
                <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => filterHnadler(1)}
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
                    <span className={isRTL ? 'me-1' : 'ms-1'}>{t.search}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={resetFilterHandler}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{
                      background: 'transparent',
                      border: '1px solid #6c757d',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      padding: '6px 14px',
                      gap: 8,
                      height: 32,
                      color: '#6c757d',
                    }}
                  >
                    <FaSyncAlt />
                    <span className={isRTL ? 'me-1' : 'ms-1'}>{t.reset}</span>
                  </Button>
                </div>
              </div>
              {userInfo && userInfo.service && userInfo.service.libelle && (String(userInfo.service.libelle).toUpperCase() === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || String(userInfo.service.libelle).toUpperCase() === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT") && (
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    type="button"
                    size="sm"
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    onClick={excelHandler}
                    disabled={loadingExcelGenerate}
                    style={{
                      background: '#198754',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      padding: '6px 14px',
                      gap: 8,
                      height: 32,
                    }}
                  >
                    {loadingExcelGenerate ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span className={isRTL ? 'me-1' : 'ms-1'}>{t.generating}</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-file-excel"></i>
                        <span className={isRTL ? 'me-1' : 'ms-1'}>{t.excelExport}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
              </>
            )}

            <div className="table-responsive rounded border bg-body" style={{ overflowX: 'auto' }}>
              <table className="table table-sm mb-0">
                {demandePreviewTeamAdminSuccess && (
                  <thead>
                    <tr>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text" style={{ rowGap: 6 }}>
                          <small className="d-flex align-items-center" style={{ flexDirection: 'row', fontSize: '0.875rem' }}>
                            <FaUser className={isRTL ? 'ms-2' : 'me-2'} style={{ color: '#0d6efd' }} />
                            <span className={isRTL ? 'me-1' : 'ms-1'}>{t.demandeur}</span>
                          </small>
                          <div ref={demandeurGroupRef} className="d-flex align-items-center" style={{ gap: 8, position: 'relative', marginTop: 2, marginBottom: 6 }}>
                            <Form.Control
                              type="text"
                              value={demandeur || ''}
                              onChange={(e) => setDemandeur(e.target.value)}
                              disabled={demandePreviewTeamAdminLoading}
                              size="sm"
                              placeholder={isRTL ? 'اكتب الاسم أو الرقم الوظيفي...' : 'Nom ou matricule...'}
                              style={{ minWidth: 180, textAlign: isRTL ? 'right' : 'left' }}
                              dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            {isRTL && (
                              <Button
                                type="button"
                                variant="light"
                                size="sm"
                                className="rounded-pill"
                                onClick={() => {
                                  setShowArKbDemandeur(prev => {
                                    const next = !prev;
                                    if (!next) { setKbDemandeurPos(null); return next; }
                                    const el = demandeurGroupRef.current;
                                    if (el) {
                                      const rect = el.getBoundingClientRect();
                                      const estimatedWidth = 260;
                                      const gap = 6;
                                      const top = rect.bottom + window.scrollY + gap + 8;
                                      let left = rect.left + window.scrollX;
                                      // align to right edge in RTL
                                      left = rect.right + window.scrollX - estimatedWidth;
                                      const maxLeft = window.scrollX + window.innerWidth - estimatedWidth - 8;
                                      const minLeft = window.scrollX + 8;
                                      left = Math.min(Math.max(left, minLeft), maxLeft);
                                      setKbDemandeurPos({ top, left });
                                    }
                                    return next;
                                  });
                                }}
                                style={{ border: '1px solid var(--border-light)', lineHeight: 1, padding: '2px 8px' }}
                              >
                                <FaKeyboard />
                              </Button>
                            )}
                            {isRTL && showArKbDemandeur && (
                              <div
                                className="border rounded p-2 bg-white shadow-sm"
                                style={{ zIndex: 999999, position: 'fixed', top: (kbDemandeurPos?.top || 0), left: (kbDemandeurPos?.left || 0) }}
                                onMouseDown={(e)=>e.preventDefault()}
                              >
                                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(11, 1fr)', gap: 2 }}>
                                  {arabicKeys.map((k, idx)=> (
                                    <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>appendArabicChar('demandeur', k)}>{k}</Button>
                                  ))}
                                  <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> setDemandeur((prev)=> (prev||'').slice(0,-1))}><FaBackspace /></Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text" style={{ rowGap: 6 }}>
                          <small className="d-flex align-items-center" style={{ flexDirection: 'row', fontSize: '0.875rem' }}>
                            <FaCalendarAlt className={isRTL ? 'ms-2' : 'me-2'} style={{ color: '#0d6efd' }} />
                            <span className={isRTL ? 'me-1' : 'ms-1'}>{t.dateDemande}</span>
                          </small>
                          <div className="d-flex" style={{ marginTop: 2, marginBottom: 6 }}>
                            <Form.Control
                              value={dateDemande || ''}
                              onChange={(e) => setDateDemande(e.target.value)}
                              size="sm"
                              type="date"
                              placeholder={isRTL ? 'يوم/شهر/سنة' : 'jj/mm/aaaa'}
                              style={{ minWidth: 150, textAlign: isRTL ? 'right' : 'left' }}
                              dir={isRTL ? 'rtl' : 'ltr'}
                              lang={isRTL ? 'ar' : 'fr'}
                            />
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text" style={{ rowGap: 6 }}>
                          <small className="d-flex align-items-center" style={{ flexDirection: 'row', fontSize: '0.875rem' }}>
                            <FaCalendarAlt className={isRTL ? 'ms-2' : 'me-2'} style={{ color: '#0d6efd' }} />
                            <span className={isRTL ? 'me-1' : 'ms-1'}>{t.dateEnvoi}</span>
                          </small>
                          <div className="d-flex" style={{ marginTop: 2, marginBottom: 6 }}>
                            <Form.Control
                              value={dateEnvoi || ''}
                              onChange={(e) => setDateEnvoi(e.target.value)}
                              size="sm"
                              type="date"
                              placeholder={isRTL ? 'يوم/شهر/سنة' : 'jj/mm/aaaa'}
                              style={{ minWidth: 150, textAlign: isRTL ? 'right' : 'left' }}
                              dir={isRTL ? 'rtl' : 'ltr'}
                              lang={isRTL ? 'ar' : 'fr'}
                            />
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text" style={{ rowGap: 6 }}>
                          <small className="d-flex align-items-center" style={{ flexDirection: 'row', gap: 6, fontSize: '0.875rem' }}>
                            <FaBriefcase style={{ color: '#0d6efd' }} />
                            <span className={isRTL ? 'me-1' : 'ms-1'}>{t.option}</span>
                          </small>
                          <div className="d-flex" style={{ marginTop: 2, marginBottom: 6 }}>
                            <Form.Select
                              value={option || ''}
                              onChange={(e) => setOption(e.target.value || null)}
                              disabled={demandePreviewTeamAdminLoading}
                              size="sm"
                              style={{ minWidth: 160 }}
                            >
                              <option value="">{isRTL ? '---- اختر خياراً ----' : '---- veuillez sélectionner une option ----'}</option>
                              {uniqueOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.libelle}</option>
                              ))}
                            </Form.Select>
                          </div>
                        </div>
                      </th>

                      {/* Status column removed: approbation shows only items to process */}
                      <th style={{ width: "200px" }}>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>{isRTL ? 'نوع التوقيع' : 'type de signature'}</small>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>{isRTL ? 'معالجة' : t.process}</small>
                        </div>
                      </th>
                    </tr>
                  </thead>
                )}

                <tbody>
                  {demandePreviewTeamAdminSuccess &&
                    demandes &&
                    Array.isArray(demandes) &&
                    demandes.length > 0
                    ? demandes.map((demande) => {
                        // Trouver le traitement en cours pour cet utilisateur
                        const traitementEnCours = demande.traitement?.find(tr => 
                          tr.status === 'en cours' && 
                          tr.utilisateur && 
                          String(tr.utilisateur._id) === String(userInfo?.id)
                        );
                        
                        if (!traitementEnCours) return null;
                        
                        return (
                      <tr 
                        key={traitementEnCours._id}
                        style={{ pointerEvents: "auto" }}
                        onClick={() => navigate(`/details-demande/${demande._id}/traitement/${traitementEnCours._id}`)}
                      >
                        <td>
                          <small className="inline-text">
                            {String(demande.demandeur?.nom || '').toLowerCase()} {String(demande.demandeur?.prenom || '').toLowerCase()}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {moment(demande.dateDemande).format(
                              "DD-MM-YYYY, h:mm"
                            )}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {moment(traitementEnCours.dateEnvoi).format(
                              "DD-MM-YYYY, h:mm"
                            )}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {String(demande.option?.libelle || '').toLowerCase()}
                          </small>
                        </td>

                        <td>{getStatusBadge(traitementEnCours.status)}</td>
                        <td>
                          {(() => {
                            const signatureType = getSignatureType(traitementEnCours);
                            const truncatedText = truncateText(signatureType, 40);
                            
                            return (
                              <OverlayTrigger
                                trigger="hover"
                                placement="top"
                                overlay={
                                  <Popover 
                                    id={`popover-${traitementEnCours._id}`}
                                    style={{ backgroundColor: 'black', color: 'white' }}
                                  >
                                    <Popover.Body style={{ backgroundColor: 'black', color: 'white' }}>
                                      {signatureType}
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <small className="inline-text" style={{ fontSize: "14px" }}>
                                  {truncatedText}
                                </small>
                              </OverlayTrigger>
                            );
                          })()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link
                              className="btn btn-sm btn-light rounded-pill d-flex align-items-center"
                              to={`/details-demande/${demande._id}/traitement/${traitementEnCours._id}`}
                              style={{ gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}
                            >
                              <i className="fa-solid fa-pen"></i>
                              <span className={isRTL ? 'me-1' : 'ms-1'}>{isRTL ? 'معالجة' : t.process}</span>
                            </Link>
                            {traitementEnCours.status === "en cours" && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleValidate(demande._id, traitementEnCours._id);
                                  }}
                                  title="Valider la demande"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRefuse(demande._id, traitementEnCours._id);
                                  }}
                                  title="Refuser la demande"
                                >
                                  <i className="fa-solid fa-times"></i>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                        );
                      }).filter(Boolean)
                    : demandePreviewTeamAdminSuccess && (
                      <tr>
                        <td colSpan={1000}>
                          <div className="py-4">
                            <div className="card border-0 bg-body-tertiary text-center py-5 mx-auto" style={{ maxWidth: 520 }}>
                              <div className="card-body">
                                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' }}>
                                  <i className="fa-regular fa-folder-open" style={{ color: '#0d6efd', fontSize: 28 }}></i>
                                </div>
                                <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                  {isRTL ? 'لم يتم العثور على أي طلب' : 'Aucune demande trouvée'}
                                </div>
                                <div className="text-muted" style={{ fontSize: 13 }}>
                                  {isRTL ? 'حاول تعديل فلاتر البحث لتوسيع النتائج.' : 'Essayez d\'ajuster les filtres pour élargir la recherche.'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
              {demandePreviewTeamAdminSuccess && demandes && (
                <div className="mt-3 d-flex justify-content-center">
                  <div
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{ backdropFilter: 'saturate(180%) blur(6px)', background: 'rgba(13,110,253,0.06)', border: '1px solid var(--border-light)' }}
                  >
                    <button className="btn btn-sm btn-light rounded-pill px-2" disabled={currentPage===1} onClick={()=>handlePageChange(1)}>
                      <i className={isRTL ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'}></i>
                    </button>
                    <button className="btn btn-sm btn-light rounded-pill px-2" disabled={currentPage===1} onClick={()=>handlePageChange(currentPage-1)}>
                      <i className={isRTL ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'}></i>
                    </button>
                    {renderPageLinks()}
                    <button className="btn btn-sm btn-light rounded-pill px-2" disabled={currentPage===totalPages} onClick={()=>handlePageChange(currentPage+1)}>
                      <i className={isRTL ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
                    </button>
                    <button className="btn btn-sm btn-light rounded-pill px-2" disabled={currentPage===totalPages} onClick={()=>handlePageChange(totalPages)}>
                      <i className={isRTL ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right'}></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Motif modal with Arabic keyboard */}
            <Modal show={!!showMotifModal} onHide={() => setShowMotifModal(null)} dir={isRTL ? 'rtl' : 'ltr'} centered size="sm" style={{ maxWidth: 400, margin: 'auto' }}>
              <Modal.Header closeButton className="border-0 py-2" style={{ background: 'var(--bg-primary)' }}>
                <Modal.Title style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <i className={showMotifModal?.type === 'approve' ? 'fa-solid fa-check-circle' : 'fa-solid fa-times-circle'} style={{ color: showMotifModal?.type === 'approve' ? '#198754' : '#dc3545' }}></i>
                  {showMotifModal?.type === 'approve'
                    ? (isRTL ? 'سبب الموافقة' : 'Motif de validation')
                    : (isRTL ? 'سبب الرفض' : 'Motif de refus')}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ background: 'var(--bg-primary)', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, paddingRight: 15 }}>
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{isRTL ? 'نص السبب' : 'Texte du motif'}</Form.Label>
                  <div className="d-flex align-items-center" style={{ gap: 6 }}>
                    <Form.Control as="textarea" rows={2} value={motifText} onChange={(e)=>setMotifText(e.target.value)} style={{ textAlign: isRTL ? 'right' : 'left', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', fontSize: 13, padding: '6px 8px' }} />
                    {isRTL && (
                      <Button type="button" variant="light" size="sm" className="rounded-pill" onClick={()=>setShowArKbMotif((v)=>!v)} style={{ border: '1px solid var(--border-light)', lineHeight: 1, padding: '2px 8px' }}>
                        <FaKeyboard />
                      </Button>
                    )}
                  </div>
                </Form.Group>
                {isRTL && showArKbMotif && (
                  <div className="border rounded p-2 bg-white shadow-sm" style={{ zIndex: 1060, background: 'var(--bg-secondary)', maxWidth: 350 }} onMouseDown={(e)=>e.preventDefault()}>
                    <div className="d-grid" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gap: 2 }}>
                      {arabicKeys.map((k, idx)=> (
                        <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>appendArabicChar('motif', k)}>{k}</Button>
                      ))}
                      <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> setMotifText((prev)=> (prev||'').slice(0,-1))}><FaBackspace /></Button>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="border-0 pt-0" style={{ background: 'var(--bg-primary)', paddingLeft: 15, paddingRight: 15, paddingBottom: 15 }}>
                <Button variant="light" onClick={()=> setShowMotifModal(null)} className="rounded-pill px-3 py-1">
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </Button>
                {showMotifModal?.type === 'approve' ? (
                  <Button variant="primary" className="rounded-pill px-3 py-1" onClick={()=>{
                    const {demandeId, traitementId} = showMotifModal;
                    dispatch(approuveTraitement(demandeId, traitementId, { docContent: '', motifValidation: motifText || (isRTL ? 'تمت الموافقة على الطلب' : 'Demande validée') }));
                    setShowMotifModal(null);
                  }}>
                    {isRTL ? 'تأكيد الموافقة' : 'Valider'}
                  </Button>
                ) : (
                  <Button variant="danger" className="rounded-pill px-3 py-1" onClick={()=>{
                    if (!motifText || !motifText.trim()) return alert(isRTL ? 'سبب الرفض إلزامي' : 'Le motif de refus est obligatoire');
                    const {demandeId, traitementId} = showMotifModal;
                    dispatch(refuseTraitement(demandeId, traitementId, { motifRefus: motifText }));
                    setShowMotifModal(null);
                  }}>
                    {isRTL ? 'تأكيد الرفض' : 'Refuser'}
                  </Button>
                )}
              </Modal.Footer>
            </Modal>
          </>
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesPage;
