import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader,
  Message,
  Table,
  TableLoading,
  WarningMessage,
} from "../../components";
import { Dialog, Toast } from "../../services/";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaFolderOpen, FaSitemap, FaPlus, FaSyncAlt, FaTag, FaProjectDiagram, FaKeyboard } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchDirections } from "../../redux/direction/directionActions";
import {
  createCategorie,
  fetchCategories,
  softDeleteCategorie,
  restoreCategorie,
  resetCreateCategorie,
  resetRemoveCategorie,
  resetUpdateCategorie,
  updateCategorie,
} from "../../redux/categorie/categorieActions";
import {
  createSousCategorie,
  fetchSousCategoriesByCategorieID,
  softDeleteSousCategorie,
  restoreSousCategorie,
  resetCreateSousCategorie,
  resetFetchSousCategoriesByCategorieID,
  resetRemoveSousCategorie,
  resetUpdateSousCategorie,
  updateSousCategorie,
} from "../../redux/sousCategorie/sousCategorieActions";



const CategorieListPage = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
const validationCategorieSchema = Yup.object({
    categorieLibelle: Yup.string().required(
      currentLanguage === 'ar' ? 'يجب إدخال التسمية' : "il faut saisire une libelle"
    ),
    direction: Yup.string().required(
      currentLanguage === 'ar' ? 'يجب اختيار إدارة' : "il faut choisire une direction"
    ),
});

const validationSousCategorieSchema = Yup.object({
    sousCategorieLibelle: Yup.string().required(
      currentLanguage === 'ar' ? 'يجب إدخال التسمية' : "il faut saisire une libelle"
    ),
});
  const [callOnce, setCallOnce] = useState(false);
  const [categorieShow, setCategorieShow] = useState(false);
  const [sousCategorieShow, setSousCategorieShow] = useState(false);
  const [forceArabicCategorie, setForceArabicCategorie] = useState(false);
  const [forceArabicSousCategorie, setForceArabicSousCategorie] = useState(currentLanguage === 'ar');
  const categorieInputRef = useRef(null);
  const sousCategorieInputRef = useRef(null);

  const arabicKeys = [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ];

  const insertArabicChar = (ref, currentValue, setFieldValue, field, char) => {
    const input = ref.current;
    if (!input) return;
    const start = input.selectionStart ?? currentValue.length;
    const end = input.selectionEnd ?? currentValue.length;
    let next = currentValue;
    if (char === '⌫') {
      if (start === end && start > 0) {
        next = currentValue.slice(0, start - 1) + currentValue.slice(end);
        setTimeout(() => {
          input.setSelectionRange(start - 1, start - 1);
        }, 0);
      } else if (start !== end) {
        next = currentValue.slice(0, start) + currentValue.slice(end);
        setTimeout(() => {
          input.setSelectionRange(start, start);
        }, 0);
      }
    } else {
      const toInsert = char === '␣' ? ' ' : char;
      next = currentValue.slice(0, start) + toInsert + currentValue.slice(end);
      const newCaret = start + toInsert.length;
      setTimeout(() => {
        input.setSelectionRange(newCaret, newCaret);
      }, 0);
    }
    setFieldValue(field, next);
    
    setTimeout(() => input.focus(), 0);
  };
  const [confirmDelete, setConfirmDelete] = useState({ show: false, type: null, id: null, label: '' });
  const [isCategorieUpdateForm, setIsCategorieUpdateForm] = useState(false);
  const [isSousCategorieUpdateForm, setIsSousCategorieUpdateForm] =
    useState(false);

  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [updatedCategorieId, setUpdatedCategorieId] = useState(null);
  const [updatedSousCategorieId, setUpdatedSousCategorieId] = useState(null);
  const [selectedCategorieLibelle, setSelectedCategorieLibelle] =
    useState(null);
  const [categorieInitialValues] = useState({
    categorieLibelle: "",
    direction: "",
  });
  const [sousCategorieInitialValues] = useState({
    sousCategorieLibelle: "",
  });

  const dispatch = useDispatch();

  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    directions,
  } = directionList;

  const categorieList = useSelector((state) => state.categorieList);
  const {
    loading: loadingCategorieList,
    error: errorCategorieList,
    success: successCategorieListSuccess,
    categories,
  } = categorieList;

  const souscategorieListByCategorieID = useSelector(
    (state) => state.souscategorieListByCategorieID
  );

  const {
    loading: loadingSouscategorieListByCategorieID,
    error: errorSouscategorieListByCategorieID,
    success: successSousCategorieListSuccess,
    souscategories,
  } = souscategorieListByCategorieID;

  const categorieCreate = useSelector((state) => state.categorieCreate);
  const {
    loading: loadingCreateCategorie,
    error: errorCreateCategorie,
    categorie: createdCategorie,
  } = categorieCreate;

  const categorieUpdate = useSelector((state) => state.categorieUpdate);
  const {
    loading: loadingUpdateCategorie,
    error: errorUpdateCategorie,
    success: successUpdateCategorie,
    categorie: updatedCategorie,
  } = categorieUpdate;

  const categorieRemove = useSelector((state) => state.categorieRemove);
  const {
    loading: loadingRemoveCategorie,
    error: errorRemoveCategorie,
    success: successRemoveCategorie,
  } = categorieRemove;

  const sousCategorieCreate = useSelector((state) => state.sousCategorieCreate);
  const {
    loading: loadingCreateSousCategorie,
    error: errorCreateSousCategorie,
    sousCategorie: createdSousCategorie,
  } = sousCategorieCreate;

  const sousCategorieUpdate = useSelector((state) => state.sousCategorieUpdate);
  const {
    loading: loadingUpdateSousCategorie,
    error: errorUpdateSousCategorie,
    success: successUpdateSousCategorie,
    sousCategorie: updatedSousCategorie,
  } = sousCategorieUpdate;

  const sousCategorieRemove = useSelector((state) => state.sousCategorieRemove);
  const {
    loading: loadingRemoveSousCategorie,
    error: errorRemoveSousCategorie,
    success: successRemoveSousCategorie,
  } = sousCategorieRemove;

  const categorieForm = useFormik({
    initialValues: categorieInitialValues,
    validationSchema: validationCategorieSchema,
    onSubmit: (values) => {
      const { categorieLibelle, direction } = values;

      if (!isCategorieUpdateForm) {
        dispatch(
          createCategorie({ libelle: categorieLibelle, direction: direction })
        );
      } else {
        dispatch(
          updateCategorie(updatedCategorieId, {
            libelle: categorieLibelle,
            direction: direction,
          })
        );
      }
    },
  });

  const sousCategorieForm = useFormik({
    initialValues: sousCategorieInitialValues,
    validationSchema: validationSousCategorieSchema,
    onSubmit: (values) => {
      const { sousCategorieLibelle } = values;

      if (!isSousCategorieUpdateForm) {
        dispatch(
          createSousCategorie({
            libelle: sousCategorieLibelle,
            categorie: selectedCategorie,
          })
        );
      } else {
        dispatch(
          updateSousCategorie(updatedSousCategorieId, {
            libelle: sousCategorieLibelle,
          })
        );
      }
    },
  });

  
  const hideCategorieModalHandler = () => {
    setCategorieShow(false);
    setIsCategorieUpdateForm(false);
    categorieForm.resetForm();
  };

  const removeCategorieHandler = (id) => {
    const cat = categories.find((c) => String(c._id) === String(id));
    setConfirmDelete({ show: true, type: 'categorie', id, label: cat?.libelle || '' });
  };

  const updateCategorieHandler = (id) => {
    setCategorieShow(true);
    setIsCategorieUpdateForm(true);
    setUpdatedCategorieId(id);
    const upLibelle = categories.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;

    const categorie = categories.find(
      (cat) => cat !== null && String(cat._id) === String(id)
    );
    const direction = categorie.direction;
    const upDirection = direction ? direction._id : null;
    const categorieObject = {
      categorieLibelle: upLibelle,
      direction: upDirection,
    };

    categorieForm.setValues(categorieObject);
  };

  
  const hideSousCategorieModalHandler = () => {
    setSousCategorieShow(false);
    setIsSousCategorieUpdateForm(false);
    sousCategorieForm.resetForm();
  };

  const getSousCategoriesHandler = (id) => {
    setSelectedCategorie(id);
    const upLibelle = categories.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;
    setSelectedCategorieLibelle(upLibelle);
    dispatch(fetchSousCategoriesByCategorieID(id));
  };

  const removeSousCategorieHandler = (id) => {
    const sc = souscategories.find((s) => String(s._id) === String(id));
    setConfirmDelete({ show: true, type: 'sous', id, label: sc?.libelle || '' });
  };

  const updateSousCategorieHandler = (id) => {
    setSousCategorieShow(true);
    setIsSousCategorieUpdateForm(true);
    setUpdatedSousCategorieId(id);
    const upLibelle = souscategories.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;

    const categorieObject = {
      sousCategorieLibelle: upLibelle,
    };

    sousCategorieForm.setValues(categorieObject);
  };

  useEffect(() => {
    if (createdCategorie) {
      dispatch(resetCreateCategorie());
      setCategorieShow(false);
      categorieForm.resetForm();
      Toast.open({
        type: "success",
        title: "✅ Catégorie créée avec succès !",
        message: "La catégorie a été créée et ajoutée avec succès",
      });
    }

    if (successRemoveCategorie) {
      dispatch(resetRemoveCategorie());
      dispatch(resetFetchSousCategoriesByCategorieID());
      setSelectedCategorie(null);
      dispatch(fetchCategories());
      setConfirmDelete({ show: false, type: null, id: null, label: '' });
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `la catégorie a été supprimée avec succès`,
      });
    }

    if (successUpdateCategorie) {
      dispatch(resetUpdateCategorie());
      setSelectedCategorieLibelle(updatedCategorie.libelle);
      setCategorieShow(false);
      categorieForm.resetForm();
    }

    if (createdSousCategorie) {
      dispatch(resetCreateSousCategorie());
      setSousCategorieShow(false);
      sousCategorieForm.resetForm();
      Toast.open({
        type: "success",
        title: "✅ Sous-catégorie créée avec succès !",
        message: "La sous-catégorie a été créée et ajoutée avec succès",
      });
    }

    if (successRemoveSousCategorie) {
      dispatch(resetRemoveSousCategorie());
      if (selectedCategorie) {
        dispatch(fetchSousCategoriesByCategorieID(selectedCategorie));
      }
      setConfirmDelete({ show: false, type: null, id: null, label: '' });
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `la sous-catégorie a été supprimée avec succès`,
      });
    }

    if (successUpdateSousCategorie) {
      dispatch(resetUpdateSousCategorie());

      setSousCategorieShow(false);
      sousCategorieForm.resetForm();
    }

    if (!callOnce) {
      dispatch(fetchDirections());
      dispatch(fetchCategories());
      setCallOnce(true);
    }
  }, [
    callOnce,
    dispatch,
    createdCategorie,
    successRemoveCategorie,
    successUpdateCategorie,
    updatedCategorie,
    createdSousCategorie,
    successRemoveSousCategorie,
    successUpdateSousCategorie,
    updatedSousCategorie,
  ]);
  const title = currentLanguage === 'ar' ? 'الفئات والفئات الفرعية' : t('categories.title', { defaultValue: 'Catégories & sous-catégories' });
  const subtitle = currentLanguage === 'ar' ? 'إدارة الفئات والفئات الفرعية' : t('categories.subtitle', { defaultValue: 'Gérer les catégories et les sous-catégories' });
  const addCategoryLabel = currentLanguage === 'ar' ? 'إضافة فئة' : t('categories.addCategory', { defaultValue: 'Ajouter une catégorie' });
  const addSubCategoryLabel = currentLanguage === 'ar' ? 'إضافة فئة فرعية' : t('categories.addSubCategory', { defaultValue: 'Ajouter une sous-catégorie' });
  const selectedCategoryText = currentLanguage === 'ar' ? 'الفئة المحددة :' : t('categories.selectedCategory', { defaultValue: 'catégorie sélectionnée :' });
  const noCategoriesText = currentLanguage === 'ar' ? 'لا توجد فئات' : t('categories.none', { defaultValue: 'Aucune catégorie trouvée' });
  const noSubCategoriesText = currentLanguage === 'ar' ? 'لا توجد فئات فرعية' : t('subcategories.none', { defaultValue: 'Aucune sous-catégorie trouvée' });
  const noSubCategorySelectedText = currentLanguage === 'ar' ? 'لم يتم تحديد فئة فرعية' : t('subcategories.noneSelected', { defaultValue: 'Aucune sous-categorie selectionnée' });
  const hintText = currentLanguage === 'ar'
    ? "لعرض العناصر التابعة (الفئات الفرعية) لصفّ (فئة)، انقر على الصف في الجدول"
    : t('categories.hint', { defaultValue: "Pour afficher les enfants d'une ligne (catégorie) vous devez cliquer sur la ligne dans le tableau" });

  return (
    <>
      {}
      <div className="d-flex align-items-center mb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
            <FaFolderOpen style={{ color: '#0d6efd' }} />
            {title}
          </h2>
          <small className="text-muted">{subtitle}</small>
        </div>
      </div>
      {}
      <Modal
        centered
        size="md"
        show={categorieShow}
        onHide={hideCategorieModalHandler}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', justifyContent: isRTL ? 'flex-end' : 'flex-start', textAlign: isRTL ? 'right' : 'left' }}>
            <FaFolderOpen className="text-primary" />
            <h6 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {currentLanguage === 'ar' ? 'إضافة/تعديل فئة' : 'Ajouter / Modifier une catégorie'}
            </h6>
          </div>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-primary)' }}>
          {loadingCreateCategorie && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingUpdateCategorie && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorCreateCategorie && (
            <Message itWillBeHidden={true} type="danger">
              {errorCreateCategorie}
            </Message>
          )}
          {errorUpdateCategorie && (
            <Message itWillBeHidden={true} type="danger">
              {errorUpdateCategorie}
            </Message>
          )}
          <Form onSubmit={categorieForm.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-1" style={{ gap: 8 }}>
              <Form.Label className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                {currentLanguage === 'ar' ? 'التسمية' : 'Libellé'}
              </Form.Label>
              {currentLanguage === 'ar' && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill d-inline-flex align-items-center"
                  onClick={() => setForceArabicCategorie((v) => !v)}
                  style={{ padding: '2px 8px', gap: 6 }}
                >
                  <FaKeyboard />
                  <span className={isRTL ? 'me-1' : 'ms-1'}>{forceArabicCategorie ? 'إيقاف' : 'لوحة مفاتيح عربية'}</span>
                </Button>
              )}
            </div>
            <Form.Control
              placeholder={currentLanguage === 'ar' ? 'مثال: الإعلام الآلي، المالية، الموارد البشرية ...' : 'Ex: Informatique, Finance, RH ...'}
              disabled={loadingCreateCategorie}
              name="categorieLibelle"
              onChange={categorieForm.handleChange}
              onBlur={categorieForm.handleBlur}
              value={categorieForm.values.categorieLibelle}
              size="sm"
              style={{ textAlign: (isRTL || forceArabicCategorie) ? 'right' : 'left', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
              dir={(isRTL || forceArabicCategorie) ? 'rtl' : 'ltr'}
              lang={(isRTL || forceArabicCategorie) ? 'ar' : undefined}
              ref={categorieInputRef}
            />
            {currentLanguage === 'ar' && forceArabicCategorie && (
              <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                  {arabicKeys.map((k) => (
                    <Button key={k} size="sm" variant="light" onClick={() => insertArabicChar(categorieInputRef, categorieForm.values.categorieLibelle, categorieForm.setFieldValue, 'categorieLibelle', k)}>{k}</Button>
                  ))}
                  <Button size="sm" variant="light" onClick={() => insertArabicChar(categorieInputRef, categorieForm.values.categorieLibelle, categorieForm.setFieldValue, 'categorieLibelle', '␣')}>{currentLanguage === 'ar' ? 'مسافة' : 'Espace'}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => insertArabicChar(categorieInputRef, categorieForm.values.categorieLibelle, categorieForm.setFieldValue, 'categorieLibelle', '⌫')}>⌫</Button>
                </div>
              </div>
            )}
            {categorieForm.touched.categorieLibelle &&
              categorieForm.errors.categorieLibelle && (
                <small className="text-danger d-block">
                  {categorieForm.errors.categorieLibelle}
                </small>
              )}
            <Form.Label className="mt-3 mb-1" style={{ color: 'var(--text-secondary)' }}>
              {currentLanguage === 'ar' ? 'الإدارة' : 'Direction'}
            </Form.Label>
            <Form.Select
              disabled={loadingDirectionList || loadingCreateCategorie}
              name="direction"
              onChange={categorieForm.handleChange}
              onBlur={categorieForm.handleBlur}
              value={categorieForm.values.direction}
              size="sm"
              style={{ textAlign: isRTL ? 'right' : 'left', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
            >
              <option>
                {currentLanguage === 'ar' ? '---- يرجى اختيار إدارة ----' : '---- veuillez selectionner une direction ----'}
              </option>
              {directions.length > 0 &&
                directions.map((direction) => (
                  <option key={direction._id} value={direction._id}>
                    {direction.libelle}
                  </option>
                ))}
            </Form.Select>
            {categorieForm.touched.direction &&
              categorieForm.errors.direction && (
                <small className="text-danger d-block">
                  {categorieForm.errors.direction}
                </small>
              )}
            <Button type="submit" className="mt-3 w-100 rounded-pill d-flex align-items-center justify-content-center" style={{ background: '#4287f5', border: 'none' }}>
              {currentLanguage === 'ar' ? 'حفظ' : 'Enregistrer'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {}

      {}
      <Modal
        centered
        size="md"
        show={sousCategorieShow}
        onHide={hideSousCategorieModalHandler}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', justifyContent: isRTL ? 'flex-end' : 'flex-start', textAlign: isRTL ? 'right' : 'left' }}>
            <FaSitemap className="text-primary" />
            <h6 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {currentLanguage === 'ar' ? 'إضافة/تعديل فئة فرعية' : 'Ajouter / Modifier une sous-catégorie'}
            </h6>
          </div>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-primary)' }}>
          {loadingCreateSousCategorie && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingUpdateSousCategorie && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorCreateSousCategorie && (
            <Message itWillBeHidden={true} type="danger">
              {errorCreateSousCategorie}
            </Message>
          )}
          {errorUpdateSousCategorie && (
            <Message itWillBeHidden={true} type="danger">
              {errorUpdateSousCategorie}
            </Message>
          )}
          <Form onSubmit={sousCategorieForm.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-1" style={{ gap: 8 }}>
              <Form.Label className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                {currentLanguage === 'ar' ? 'التسمية' : 'Libellé'}
              </Form.Label>
              {(isRTL || currentLanguage === 'ar') && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill d-inline-flex align-items-center"
                  onClick={() => setForceArabicSousCategorie((v) => !v)}
                  style={{ padding: '2px 8px', gap: 6 }}
                >
                  <FaKeyboard />
                  <span className={isRTL ? 'me-1' : 'ms-1'}>{forceArabicSousCategorie ? 'إيقاف' : 'لوحة مفاتيح عربية'}</span>
                </Button>
              )}
            </div>
            <Form.Control
              name="sousCategorieLibelle"
              value={sousCategorieForm.values.sousCategorieLibelle}
              placeholder={currentLanguage === 'ar' ? 'مثال: JD Edwards، محطة العمل ...' : 'Ex: JD Edwards, Poste de travail ...'}
              onChange={sousCategorieForm.handleChange}
              onBlur={sousCategorieForm.handleBlur}
              size="sm"
              style={{ textAlign: (isRTL || forceArabicSousCategorie) ? 'right' : 'left', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
              dir={(isRTL || forceArabicSousCategorie) ? 'rtl' : 'ltr'}
              lang={(isRTL || forceArabicSousCategorie) ? 'ar' : undefined}
              ref={sousCategorieInputRef}
            />
            {currentLanguage === 'ar' && forceArabicSousCategorie && (
              <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                  {arabicKeys.map((k) => (
                    <Button key={k} size="sm" variant="light" onClick={() => insertArabicChar(sousCategorieInputRef, sousCategorieForm.values.sousCategorieLibelle, sousCategorieForm.setFieldValue, 'sousCategorieLibelle', k)}>{k}</Button>
                  ))}
                  <Button size="sm" variant="light" onClick={() => insertArabicChar(sousCategorieInputRef, sousCategorieForm.values.sousCategorieLibelle, sousCategorieForm.setFieldValue, 'sousCategorieLibelle', '␣')}>{currentLanguage === 'ar' ? 'مسافة' : 'Espace'}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => insertArabicChar(sousCategorieInputRef, sousCategorieForm.values.sousCategorieLibelle, sousCategorieForm.setFieldValue, 'sousCategorieLibelle', '⌫')}>⌫</Button>
                </div>
              </div>
            )}
            {sousCategorieForm.touched.sousCategorieLibelle &&
              sousCategorieForm.errors.sousCategorieLibelle && (
                <small className="text-danger d-block">
                  {sousCategorieForm.errors.sousCategorieLibelle}
                </small>
              )}
            <Button type="submit" className="mt-3 w-100 rounded-pill d-flex align-items-center justify-content-center" style={{ background: '#4287f5', border: 'none' }}>
              {currentLanguage === 'ar' ? 'حفظ' : 'Enregistrer'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {}

      {errorDirectionList && (
        <Message itWillBeHidden={true} type="danger">
          {errorDirectionList}
        </Message>
      )}
      {errorCategorieList && (
        <Message itWillBeHidden={true} type="danger">
          {errorCategorieList}
        </Message>
      )}
      {errorRemoveCategorie && (
        <Message itWillBeHidden={true} type="danger">
          {errorRemoveCategorie}
        </Message>
      )}

      {errorSouscategorieListByCategorieID && (
        <Message itWillBeHidden={true} type="danger">
          {errorSouscategorieListByCategorieID}
        </Message>
      )}

      {errorRemoveSousCategorie && (
        <Message itWillBeHidden={true} type="danger">
          {errorRemoveSousCategorie}
        </Message>
      )}
      <Message variant="info">
        {hintText}
      </Message>

      {}
      <Modal centered show={confirmDelete.show} onHide={() => setConfirmDelete({ show: false, type: null, id: null, label: '' })} dir={isRTL ? 'rtl' : 'ltr'}>
        <Modal.Header closeButton>
          <h6 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {currentLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirmation de suppression'}
          </h6>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3" style={{ color: 'var(--text-primary)' }}>
            {currentLanguage === 'ar'
              ? `هل أنت متأكد من حذف ${confirmDelete.type === 'sous' ? 'الفئة الفرعية' : 'الفئة'}${confirmDelete.label ? `: ${confirmDelete.label}` : ''}؟`
              : `Êtes-vous sûr de vouloir supprimer ${confirmDelete.type === 'sous' ? 'la sous-catégorie' : 'la catégorie'}${confirmDelete.label ? ` : ${confirmDelete.label}` : ''} ?`}
          </p>
          <div className="d-flex" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Button
              size="sm"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ background: '#dc3545', border: 'none', padding: '6px 14px' }}
              onClick={() => {
                if (confirmDelete.type === 'sous') {
                  dispatch(softDeleteSousCategorie(confirmDelete.id));
                } else if (confirmDelete.type === 'categorie') {
                  dispatch(softDeleteCategorie(confirmDelete.id));
                }
              }}
              disabled={loadingRemoveCategorie || loadingRemoveSousCategorie}
            >
              {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ padding: '6px 14px' }}
              onClick={() => setConfirmDelete({ show: false, type: null, id: null, label: '' })}
              disabled={loadingRemoveCategorie || loadingRemoveSousCategorie}
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          
          {loadingCategorieList && <TableLoading />}
          {categories.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: (
                    <span className="d-inline-flex align-items-center" style={{ gap: 6 }}>
                      <FaTag style={{ color: '#0d6efd' }} />
                      {currentLanguage === 'ar' ? 'التسمية' : t('categories.label', { defaultValue: 'Libellé' })}
                    </span>
                  ),
                  accessor: "libelle",
                  filter: "libelle",
                  enableArabicKeyboard: true,
                },
                {
                  Header: (
                    <span className="d-inline-flex align-items-center" style={{ gap: 6 }}>
                      <FaProjectDiagram style={{ color: '#0d6efd' }} />
                      {currentLanguage === 'ar' ? 'الإدارة' : t('categories.direction', { defaultValue: 'Direction' })}
                    </span>
                  ),
                  accessor: "direction.libelle",
                  filter: "direction.libelle",
                },
              ]}
              data={categories.filter((c) => !c.isDeleted)}
              loadingRemove={loadingRemoveCategorie}
              removeRow={removeCategorieHandler}
              updateRow={updateCategorieHandler}
              rowClick={getSousCategoriesHandler}
              dropdownFilters={["direction.libelle"]}
              headerActions={
                <>
                  <Button
                    size="sm"
                    onClick={() => { setIsCategorieUpdateForm(false); setCategorieShow(true); }}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{ background: '#4287f5', border: 'none', padding: '6px 14px', gap: 8 }}
                  >
                    <FaPlus />
                    <span className={isRTL ? 'me-1' : 'ms-1'}>{addCategoryLabel}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => { dispatch(fetchCategories()); setSelectedCategorie(null); dispatch(resetFetchSousCategoriesByCategorieID()); }}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{ padding: '6px 14px', gap: 8 }}
                  >
                    <FaSyncAlt />
                    <span className={isRTL ? 'me-1' : 'ms-1'}>{currentLanguage === 'ar' ? 'تحديث' : t('common.refresh', { defaultValue: 'Actualiser' })}</span>
                  </Button>
                </>
              }
            />
          ) : (
            successCategorieListSuccess && (
              <WarningMessage message={noCategoriesText} />
            )
          )}
        </Card.Body>
      </Card>
      <hr />
      {selectedCategorie ? (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <p className="mt-1">
                <small>{selectedCategoryText}</small>{" "}
                <span style={{ fontWeight: "bold" }}>
                  {selectedCategorieLibelle}
                </span>
              </p>
              <Button
                size="sm"
                className="rounded-pill d-flex align-items-center justify-content-center"
                onClick={(e) => {
                  setIsSousCategorieUpdateForm(false);
                  setSousCategorieShow(true);
                }}
                style={{ background: '#4287f5', border: 'none', gap: 8, padding: '6px 14px' }}
              >
                <FaSitemap />
                <span className={isRTL ? 'me-1' : 'ms-1'}>{addSubCategoryLabel}</span>
              </Button>
            </div>
            {loadingSouscategorieListByCategorieID && <TableLoading />}
            {souscategories.length > 0 ? (
              <Table
                columns={[
                  {
                    Header: "ID",
                    accessor: "_id",
                    show: false,
                  },
                  {
                    Header: (
                      <span className="d-inline-flex align-items-center" style={{ gap: 6 }}>
                        <FaTag style={{ color: '#0d6efd' }} />
                        {currentLanguage === 'ar' ? 'التسمية' : t('subcategories.label', { defaultValue: 'Libellé' })}
                      </span>
                    ),
                    accessor: "libelle",
                    filter: "libelle",
                  },
                ]}
                data={souscategories.filter((s) => !s.isDeleted)}
                loadingRemove={loadingRemoveSousCategorie}
                removeRow={removeSousCategorieHandler}
                updateRow={updateSousCategorieHandler}
              />
            ) : (
              successSousCategorieListSuccess && (
                <WarningMessage message={noSubCategoriesText} />
              )
            )}
          </Card.Body>
        </Card>
      ) : (
        <WarningMessage message={noSubCategorySelectedText} />
      )}
    </>
  );
};

export default CategorieListPage;
