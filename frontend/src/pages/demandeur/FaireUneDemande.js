import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/categorie/categorieActions";
import {
  fetchSousCategoriesByCategorieID,
  resetFetchSousCategoriesByCategorieID,
} from "../../redux/sousCategorie/sousCategorieActions";
import { fetchOptionsBySousCategorieID } from "../../redux/option/optionActions";

import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Placeholder,
  Row,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { DamiLoading, Message, Option, WarningMessage } from "../../components";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaSearch, FaList, FaTh, FaArrowLeft, FaTags, FaLayerGroup } from "react-icons/fa";

const FaireUneDemande = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  const [callOnce, setCallOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sousCategorie, setSousCategorie] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [libelle, setLibelle] = useState("");
  const [viewMode, setViewMode] = useState('grid'); 
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const dispatch = useDispatch();

  
  const translations = {
    fr: {
      title: "Faire une demande",
      subtitle: "Sélectionnez une option pour créer votre demande",
      searchOptions: "Rechercher une option",
      optionNamePlaceholder: "Tapez le nom de l'option...",
      categories: "Catégories",
      subcategories: "Sous-catégories",
      clear: "Effacer",
      availableOptions: "Options disponibles",
      page: "Page",
      of: "sur",
      noOptionsFound: "Aucune option trouvée",
      tryDifferentFilters: "Essayez de modifier vos filtres ou votre recherche"
    },
    ar: {
      title: "إنشاء طلب",
      subtitle: "اختر خياراً لإنشاء طلبك",
      searchOptions: "البحث عن خيار",
      optionNamePlaceholder: "اكتب اسم الخيار...",
      categories: "الفئات",
      subcategories: "الفئات الفرعية",
      clear: "مسح",
      availableOptions: "الخيارات المتاحة",
      page: "صفحة",
      of: "من",
      noOptionsFound: "لم يتم العثور على خيارات",
      tryDifferentFilters: "حاول تعديل الفلاتر أو البحث"
    }
  };

  const currentTranslations = translations[currentLanguage] || translations.fr;

  
  const arabicKeys = [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ];

  const insertArabicChar = (currentValue, setValue, char) => {
    if (char === '⌫') {
      setValue(currentValue.slice(0, -1));
    } else if (char === '␣') {
      setValue(currentValue + ' ');
    } else {
      setValue(currentValue + char);
    }
  };

  const categorieList = useSelector((state) => state.categorieList);
  const {
    loading: loadingCategorieList,
    error: errorCategorieList,
    categories,
  } = categorieList;

  const souscategorieListByCategorieID = useSelector(
    (state) => state.souscategorieListByCategorieID
  );

  const {
    loading: loadingSouscategorieListByCategorieID,
    error: errorSouscategorieListByCategorieID,
    souscategories,
  } = souscategorieListByCategorieID;

  const optionListBySousCategorieID = useSelector(
    (state) => state.optionListBySousCategorieID
  );
  const {
    loading: loadingOptionListBySousCategorieID,
    error: errorOptionListBySousCategorieID,
    success: successOptionListBySousCategorieID,
    data,
  } = optionListBySousCategorieID;

  const getSousCategoriesChangeHandler = (event) => {
    if (event.target.dataset.id === "") {
      dispatch(resetFetchSousCategoriesByCategorieID());
    } else {
      setCategorie(event.target.dataset.id);
      dispatch(fetchSousCategoriesByCategorieID(event.target.dataset.id));
    }
  };

  const getSousCategorieHandler = (event) => {
    setSousCategorie(event.target.dataset.id);
    getOptionsFilterHandler(1, event.target.dataset.id, libelle);
  };

  const getOptionsFilterHandler = (page = 1, sc = null, libelle = null) => {
    let query = { page: page || 1, libelle };
    if (sc) query.sousCategorie = sc;
    dispatch(fetchOptionsBySousCategorieID(query));
  };

  
  
  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getOptionsFilterHandler(newPage, sousCategorie, libelle);
  };

  const renderPageLinks = () => {
    const links = [];

    if (totalPages > 1) {
      const range = 20;
      const start = Math.max(1, currentPage - Math.floor(range / 2));
      const end = Math.min(totalPages, start + range);

      links.push(
        <button
          key="first"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;&laquo;
        </button>,
        <button
          key="previous"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
      );

      for (let i = start; i <= end; i++) {
        links.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              i === currentPage ? "active" : ""
            } btn btn-sm btn-light`}
          >
            {i}
          </button>
        );
      }

      links.push(
        <button
          key="next"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>,
        <button
          key="last"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;&raquo;
        </button>
      );

      return links;
    } else {
      links.push(
        <button className={`btn btn-sm btn-light active ml-1`}>1</button>
      );
      return links;
    }
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchCategories());
      getOptionsFilterHandler(1, null, "");
      setCallOnce(true);
    }
    if (successOptionListBySousCategorieID) setTotalPages(data.totalPages);
  }, [callOnce, dispatch, successOptionListBySousCategorieID]);

  
  useEffect(() => {
    return () => {
      setShowArabicKeyboard(false);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      {errorCategorieList && (
        <Message type="danger" itWillBeHidden={true}>
          {errorCategorieList}
        </Message>
      )}
      {errorSouscategorieListByCategorieID && (
        <Message type="danger" itWillBeHidden={true}>
          {errorSouscategorieListByCategorieID}
        </Message>
      )}
      {errorOptionListBySousCategorieID && (
        <Message type="danger" itWillBeHidden={true}>
          {errorOptionListBySousCategorieID}
        </Message>
      )}

      {}
      <div className="d-flex align-items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            {currentTranslations.title}
          </h2>
          <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
            {currentTranslations.subtitle}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-pill"
            style={{ 
              padding: '6px 12px',
              height: 32,
              background: viewMode === 'grid' ? '#4287f5' : 'transparent',
              border: viewMode === 'grid' ? 'none' : '1px solid #dee2e6',
              color: viewMode === 'grid' ? '#fff' : '#6c757d'
            }}
          >
            <FaTh />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-pill"
            style={{ 
              padding: '6px 12px',
              height: 32,
              background: viewMode === 'list' ? '#4287f5' : 'transparent',
              border: viewMode === 'list' ? 'none' : '1px solid #dee2e6',
              color: viewMode === 'list' ? '#fff' : '#6c757d'
            }}
          >
            <FaList />
          </Button>
        </div>
            </div>

      {}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  getOptionsFilterHandler(1, sousCategorie, libelle);
                }}
              >
                <Form.Label className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <FaSearch className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                    {currentTranslations.searchOptions}
                  </div>
                  {currentLanguage === 'ar' && (
                    <Button
                      variant={showArabicKeyboard ? "primary" : "outline-secondary"}
                      size="sm"
                      onClick={() => setShowArabicKeyboard(!showArabicKeyboard)}
                      className="rounded-pill"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 8px',
                        height: 28,
                        background: showArabicKeyboard ? '#4287f5' : 'transparent',
                        border: showArabicKeyboard ? 'none' : '1px solid #dee2e6',
                        color: showArabicKeyboard ? '#fff' : '#6c757d'
                      }}
                    >
                      {showArabicKeyboard ? 'إخفاء' : 'لوحة مفاتيح'}
                    </Button>
                  )}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder={currentTranslations.optionNamePlaceholder}
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    lang={isRTL ? 'ar' : undefined}
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    style={{ 
                      background: '#4287f5', 
                      border: 'none',
                      height: 38,
                      padding: '0 12px'
                    }}
                  >
                    <FaSearch />
                  </Button>
                </InputGroup>
                {currentLanguage === 'ar' && showArabicKeyboard && (
                  <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                      {arabicKeys.map((k) => (
                        <Button 
                          key={k} 
                          size="sm" 
                          variant="light" 
                          onClick={() => insertArabicChar(libelle, setLibelle, k)}
                          style={{ 
                            minWidth: '32px', 
                            fontSize: '0.875rem',
                            height: 28,
                            background: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            color: '#495057'
                          }}
                        >
                          {k}
                        </Button>
                      ))}
                      <Button 
                        size="sm" 
                        variant="light" 
                        onClick={() => insertArabicChar(libelle, setLibelle, '␣')}
                        style={{ 
                          fontSize: '0.75rem',
                          height: 28,
                          background: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        مسافة
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger" 
                        onClick={() => insertArabicChar(libelle, setLibelle, '⌫')}
                        style={{ 
                          fontSize: '0.75rem',
                          height: 28,
                          background: 'transparent',
                          border: '1px solid #dc3545',
                          color: '#dc3545'
                        }}
                      >
                        ⌫
            </Button>
          </div>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
          <h6 className="mb-0 d-flex align-items-center">
            <FaTags className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
            {currentTranslations.categories}
          </h6>
        </Card.Header>
        <Card.Body>
          {loadingCategorieList ? (
            <div className="d-flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <Placeholder key={i} as={Badge} bg="light" style={{ width: 80, height: 32 }} />
              ))}
              </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
          {categories.length > 0 &&
            categories.map((cat) => (
              <Badge
                    key={cat._id}
                    bg={cat._id === categorie ? "primary" : "light"}
                    text={cat._id === categorie ? "white" : "dark"}
                    className="pointer"
                    style={{ 
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      pointerEvents: 'auto',
                      transition: 'all 0.2s ease'
                    }}
                data-id={cat._id}
                onClick={getSousCategoriesChangeHandler}
              >
                {String(cat.libelle).toLowerCase()}
              </Badge>
            ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {}
      {(loadingSouscategorieListByCategorieID || souscategories.length > 0) && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 d-flex align-items-center">
                <FaLayerGroup className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd' }} />
                {currentTranslations.subcategories}
              </h6>
              <Button
                variant="outline-secondary"
                size="sm"
                  onClick={() => {
                    getOptionsFilterHandler(1, null, libelle);
                    setSousCategorie(null);
                  }}
                className="rounded-pill"
                style={{ 
                  padding: '4px 12px',
                  height: 28,
                  background: 'transparent',
                  border: '1px solid #dee2e6',
                  color: '#6c757d',
                  fontSize: '0.75rem'
                }}
              >
                {currentTranslations.clear}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {loadingSouscategorieListByCategorieID ? (
              <div className="d-flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Placeholder key={i} as={Badge} bg="light" style={{ width: 100, height: 32 }} />
                ))}
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
              {souscategories.length > 0 &&
                souscategories.map((souscat) => (
                  <Badge
                      key={souscat._id}
                      bg={sousCategorie === souscat._id ? "secondary" : "light"}
                      text={sousCategorie === souscat._id ? "white" : "dark"}
                      className="pointer"
                      style={{ 
                        padding: '8px 16px',
                        fontSize: '0.875rem',
                        pointerEvents: 'auto',
                        transition: 'all 0.2s ease'
                      }}
                    data-id={souscat._id}
                    onClick={getSousCategorieHandler}
                  >
                    {String(souscat.libelle).toLowerCase()}
                  </Badge>
                ))}
            </div>
          )}
        </Card.Body>
      </Card>
      )}

      {}
      <Card className="border-0 shadow-sm">
        <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="mb-0">
              {currentTranslations.availableOptions}
              {data && data.options && (
                <Badge bg="info" className="ms-2">
                  {data.options.length}
                </Badge>
              )}
            </h6>
            {data && data.options && data.options.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  {currentTranslations.page} {currentPage} {currentTranslations.of} {totalPages}
                </small>
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {loadingOptionListBySousCategorieID ? (
            <Row className="g-4">
              {[...Array(6)].map((_, i) => (
                <Col key={i} xl={4} lg={6} md={6} sm={12}>
                  <DamiLoading mini />
                </Col>
              ))}
            </Row>
          ) : data && data.options.length > 0 ? (
            <Row className="g-4">
              {data.options.map((option) => (
                <Col
                  key={option._id}
                  xl={viewMode === 'grid' ? (windowSize.width > 1640 ? 4 : 6) : 12}
                  lg={viewMode === 'grid' ? 6 : 12}
                  md={viewMode === 'grid' ? 6 : 12}
                  sm={12}
                >
                  <Option option={option} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' }}>
                <i className="fa-regular fa-folder-open" style={{ color: '#0d6efd', fontSize: 28 }}></i>
              </div>
              <h5 className="text-muted mb-2">{currentTranslations.noOptionsFound}</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                {currentTranslations.tryDifferentFilters}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {}
      {totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
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
              style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                height: 32,
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: currentPage === 1 ? '#6c757d' : '#495057'
              }}
            >
              <i className={isRTL ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'}></i>
            </Button>
            <Button
              variant="light"
              size="sm"
              className={`rounded-pill px-2 ${isRTL ? 'ms-2' : 'me-2'}`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                height: 32,
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: currentPage === 1 ? '#6c757d' : '#495057'
              }}
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
                  style={{ 
                    minWidth: 36,
                    height: 32,
                    background: p === currentPage ? '#4287f5' : '#f8f9fa',
                    border: p === currentPage ? 'none' : '1px solid #dee2e6',
                    color: p === currentPage ? '#fff' : '#495057'
                  }}
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
              style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                height: 32,
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: currentPage === totalPages ? '#6c757d' : '#495057'
              }}
            >
              <i className={isRTL ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
            </Button>
            <Button
              variant="light"
              size="sm"
              className={`rounded-pill px-2 ${isRTL ? 'me-1' : 'ms-1'}`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                height: 32,
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: currentPage === totalPages ? '#6c757d' : '#495057'
              }}
            >
              <i className={isRTL ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right'}></i>
            </Button>
          </div>
          </div>
        )}
    </div>
  );
};

export default FaireUneDemande;
