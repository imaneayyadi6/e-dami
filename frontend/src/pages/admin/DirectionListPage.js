import React, { useEffect, useState } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader,
  Message,
  Table,
  TableLoading,
  WarningMessage,
} from "../../components";
import {  Dialog, Toast } from "../../services/";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchChefServicesUsers,
  fetchDirecteursUsers,
} from "../../redux/user/userActions";

import {
  createDirection,
  fetchDirections,
  removeDirection,
  resetCreateDirection,
  resetRemoveDirection,
  resetUpdateDirection,
  updateDirection,
} from "../../redux/direction/directionActions";
import {
  createService,
  fetchServicesByDirectionID,
  removeService,
  resetCreateService,
  resetFetchServicesByDirectionID,
  resetRemoveService,
  resetUpdateService,
  updateService,
} from "../../redux/service/serviceActions";


import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";


import { FaSitemap, FaUserTie, FaBuilding, FaPlus, FaSyncAlt, FaTag, FaKeyboard } from "react-icons/fa";

const validationDirectionSchema = Yup.object({
  directionLibelle: Yup.string().required(
    "il faut saisire une libelle (nom de direction)"
  ),
  directeur: Yup.string(),
});

const validationServiceSchema = Yup.object({
  serviceLibelle: Yup.string().required(
    "il faut saisire une libelle (nom de service)"
  ),
  chefService: Yup.string().required("chef de service est requis"),
});

const DirectionListPage = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  const [callOnce, setCallOnce] = useState(false);
  const [directionShow, setDirectionShow] = useState(false);
  const [serviceShow, setServiceShow] = useState(false);
  const [isDirectionUpdateForm, setIsDirectionUpdateForm] = useState(false);
  const [isServiceUpdateForm, setIsServiceUpdateForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, type: null, id: null, label: '' });
  const [forceArabicDirection, setForceArabicDirection] = useState(false);
  const [forceArabicService, setForceArabicService] = useState(false);
  const directionInputRef = React.useRef(null);
  const serviceInputRef = React.useRef(null);

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
  
  const localizeError = (message) => {
    if (!message) return message;
    if (currentLanguage === 'ar') {
      if (String(message).toLowerCase() === 'utilisateur est deja un chef se service') {
        return 'المستخدم بالفعل رئيس مصلحة';
      }
    }
    return message;
  };

  
  const validationDirectionSchema = Yup.object({
    directionLibelle: Yup.string().required(
      currentLanguage === 'ar'
        ? 'يجب إدخال التسمية (اسم الإدارة)'
        : "il faut saisire une libelle (nom de direction)"
    ),
    directeur: Yup.string(),
  });

  
  const validationServiceSchema = Yup.object({
    serviceLibelle: Yup.string().required(
      currentLanguage === 'ar'
        ? 'يجب إدخال التسمية (اسم المصلحة)'
        : 'il faut saisire une libelle (nom de service)'
    ),
    chefService: Yup.string().required(
      currentLanguage === 'ar'
        ? 'رئيس المصلحة إجباري'
        : 'chef de service est requis'
    ),
  });

  const [selectedDirection, setSelectedDirection] = useState(null);
  const [updatedDirectionId, setUpdatedDirectionId] = useState(null);
  const [updatedServiceId, setUpdatedServiceId] = useState(null);
  const [selectedDirectionLibelle, setSelectedDirectionLibelle] =
    useState(null);

  const [directionInitialValues] = useState({
    directionLibelle: "",
    directeur: "",
  });
  const [serviceInitialValues] = useState({
    serviceLibelle: "",
    chefService: "",
  });

  const dispatch = useDispatch();

  const userDirecteursList = useSelector((state) => state.userDirecteursList);
  const {
    loading: loadingDirecteurList,
    error: errorDirecteurist,
    utilisateurs: directeurs,
  } = userDirecteursList;

  const userChefServiceList = useSelector((state) => state.userChefServiceList);
  const {
    loading: loadingChefServiceList,
    error: errorChefServiceList,
    utilisateurs: chefServices,
  } = userChefServiceList;

  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    success: successDirectionList,
    directions,
  } = directionList;

  const serviceListByDirectionID = useSelector(
    (state) => state.serviceListByDirectionID
  );

  const {
    loading: loadingServiceListByDirectionID,
    error: errorServiceListByDirectionID,
    success: successServiceListByDirectionID,
    services,
  } = serviceListByDirectionID;

  const directionCreate = useSelector((state) => state.directionCreate);
  const {
    loading: loadingDirectionCreate,
    error: errorDirectionCreate,
    direction: createdDirectionCreate,
  } = directionCreate;

  const directionUpdate = useSelector((state) => state.directionUpdate);
  const {
    loading: loadingDirectionUpdate,
    error: errorDirectionUpdate,
    success: successDirectionUpdate,
    direction: updatedDirection,
  } = directionUpdate;

  const directionRemove = useSelector((state) => state.directionRemove);
  const {
    loading: loadingDirectionRemove,
    error: errorDirectionRemove,
    success: successDirectionRemove,
  } = directionRemove;

  const serviceCreate = useSelector((state) => state.serviceCreate);
  const {
    loading: loadingServiceCreate,
    error: errorServiceCreate,
    service: createdService,
  } = serviceCreate;

  const serviceUpdate = useSelector((state) => state.serviceUpdate);
  const {
    loading: loadingServiceUpdate,
    error: errorServiceUpdate,
    success: successServiceUpdate,
    service: updatedService,
  } = serviceUpdate;

  const serviceRemove = useSelector((state) => state.serviceRemove);
  const {
    loading: loadingServiceRemove,
    error: errorServiceRemove,
    success: successServiceRemove,
  } = serviceRemove;

  const directionForm = useFormik({
    initialValues: directionInitialValues,
    validationSchema: validationDirectionSchema,
    onSubmit: (values) => {
      const { directionLibelle, directeur } = values;

      if (!isDirectionUpdateForm) {
        dispatch(
          createDirection({ libelle: directionLibelle, directeur: directeur })
        );
      } else {
        dispatch(
          updateDirection(updatedDirectionId, {
            libelle: directionLibelle,
            directeur: directeur,
          })
        );
      }
    },
  });

  const serviceForm = useFormik({
    initialValues: serviceInitialValues,
    validationSchema: validationServiceSchema,
    onSubmit: (values) => {
      const { serviceLibelle, chefService } = values;

      if (!isServiceUpdateForm) {
        dispatch(
          createService({
            libelle: serviceLibelle,
            direction: selectedDirection,
            chefService: chefService,
          })
        );
      } else {
        dispatch(
          updateService(updatedServiceId, {
            libelle: serviceLibelle,
            chefService: chefService,
          })
        );
      }
    },
  });

  
  const hideDirectionModalHandler = () => {
    setDirectionShow(false);
    setIsDirectionUpdateForm(false);
    directionForm.resetForm();
  };

  const removeDirectionHandler = (id) => {
    const dir = directions.find((d) => String(d._id) === String(id));
    setConfirmDelete({ show: true, type: 'direction', id, label: dir?.libelle || '' });
  };

  const updateDirectionHandler = (id) => {
    setDirectionShow(true);
    setIsDirectionUpdateForm(true);
    setUpdatedDirectionId(id);
    const upLibelle = directions.find(
      (dir) => String(dir._id) === String(id)
    ).libelle;

    const directeur = directions.find(
      (dir) => String(dir._id) === String(id)
    ).directeur;
    const upDirecteur = directeur ? directeur._id : null;
    const directionObject = {
      directionLibelle: upLibelle,
      directeur: upDirecteur,
    };
    directionForm.setValues(directionObject);
  };

  
  const hideServiceModalHandler = () => {
    setServiceShow(false);
    setIsServiceUpdateForm(false);
    serviceForm.resetForm();
    dispatch(resetUpdateService());
    dispatch(resetCreateService());
  };

  const getServicesHandler = (id) => {
    setSelectedDirection(id);
    const upLibelle = directions.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;
    setSelectedDirectionLibelle(upLibelle);
    dispatch(fetchServicesByDirectionID(id));
  };

  const removeServiceHandler = (id) => {
    const srv = services.find((s) => String(s._id) === String(id));
    setConfirmDelete({ show: true, type: 'service', id, label: srv?.libelle || '' });
  };

  const updateServiceHandler = (id) => {
    setServiceShow(true);
    setIsServiceUpdateForm(true);
    setUpdatedServiceId(id);
    const chefService = services.find(
      (srv) => String(srv._id) === String(id)
    ).chefService;
    const upChefService = chefService ? chefService._id : null;
    const upLibelle = services.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;
    const serviceObject = {
      serviceLibelle: upLibelle,
      chefService: upChefService,
    };

    serviceForm.setValues(serviceObject);
  };

  useEffect(() => {
    if (createdDirectionCreate) {
      dispatch(resetCreateDirection());
      setDirectionShow(false);
      directionForm.resetForm();
      Toast.open({
        type: "success",
        title: currentLanguage === 'ar' ? "تم الإنشاء بنجاح" : "Creation avec success",
        message: currentLanguage === 'ar' ? "تم إضافة الإدارة بنجاح" : "la direction a été ajoutée avec succès",
      });
    }

    if (successDirectionRemove) {
      dispatch(resetRemoveDirection());
      dispatch(resetFetchServicesByDirectionID());
      setSelectedDirection(null);
      Toast.open({
        type: "success",
        title: currentLanguage === 'ar' ? "تم الحذف بنجاح" : "Suppression avec succès",
        message: currentLanguage === 'ar' ? "تم حذف الإدارة بنجاح" : "la direction a été supprimée avec succès",
      });
    }

    if (successDirectionUpdate) {
      dispatch(resetUpdateDirection());
      setSelectedDirectionLibelle(updatedDirection.libelle);
      setDirectionShow(false);
      directionForm.resetForm();
    }

    if (createdService) {
      dispatch(resetCreateService());
      setServiceShow(false);
      serviceForm.resetForm();
      Toast.open({
        type: "success",
        title: currentLanguage === 'ar' ? "تم الإنشاء بنجاح" : "Creation avec success",
        message: currentLanguage === 'ar' ? "تم إضافة الخدمة بنجاح" : "le service a été ajoutée avec succès",
      });
    }

    if (successServiceRemove) {
      dispatch(resetRemoveService());

      Toast.open({
        type: "success",
        title: currentLanguage === 'ar' ? "تم الحذف بنجاح" : "Suppression avec succès",
        message: currentLanguage === 'ar' ? "تم حذف الخدمة بنجاح" : "le service a été supprimée avec succès",
      });
    }

    if (successServiceUpdate) {
      dispatch(resetUpdateService());

      setServiceShow(false);
      serviceForm.resetForm();
    }

    if (!callOnce) {
      dispatch(fetchDirections());
      dispatch(fetchDirecteursUsers());
      dispatch(fetchChefServicesUsers());

      setCallOnce(true);
    }
  }, [
    callOnce,
    dispatch,
    createdDirectionCreate,
    successDirectionRemove,
    successDirectionUpdate,
    updatedDirection,
    createdService,
    successServiceRemove,
    successServiceUpdate,
    updatedService,
  ]);

  return (
    <>
      {}
      <Modal
        centered
        size="md"
        show={directionShow}
        onHide={hideDirectionModalHandler}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Modal.Header closeButton style={{ flexDirection: isRTL ? 'row-reverse' : 'row', borderBottom: '1px solid var(--border-light)' }}>
          <h6 className="d-flex align-items-center w-100" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', textAlign: isRTL ? 'right' : 'left' }}>
            <FaSitemap className={isRTL ? 'ms-2' : 'me-2'} />
            {currentLanguage === 'ar' ? 'إضافة/تعديل إدارة' : t('direction.modal.titleDirection', { defaultValue: 'Ajouter / Modifier une direction' })}
          </h6>
        </Modal.Header>
        <Modal.Body dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-primary)' }}>
          {loadingDirectionCreate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingDirectionUpdate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorDirectionCreate && (
            <Message itWillBeHidden={true} type="danger">
              {localizeError(errorDirectionCreate)}
            </Message>
          )}
          {errorDirectionUpdate && (
            <Message itWillBeHidden={true} type="danger">
              {localizeError(errorDirectionUpdate)}
            </Message>
          )}
          <Form onSubmit={directionForm.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-1" style={{ gap: 8 }}>
              <label className="mb-0">{currentLanguage === 'ar' ? 'التسمية' : t('direction.form.label', { defaultValue: 'Libellé' })}</label>
              {currentLanguage === 'ar' && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill d-inline-flex align-items-center"
                  onClick={() => setForceArabicDirection((v) => !v)}
                  style={{ padding: '2px 8px', gap: 6 }}
                >
                  <FaKeyboard />
                  <span className={isRTL ? 'me-1' : 'ms-1'}>{forceArabicDirection ? 'إيقاف' : 'لوحة مفاتيح عربية'}</span>
                </Button>
              )}
            </div>
            <Form.Control
              placeholder={currentLanguage === 'ar' ? 'مثال: المالية، البنية التحتية وأنظمة المعلومات...' : t('direction.form.placeholder', { defaultValue: 'Ex: Financière, Infrastructures et systèmes d’information...' })}
              disabled={loadingDirectionCreate}
              name="directionLibelle"
              onChange={directionForm.handleChange}
              onBlur={directionForm.handleBlur}
              value={directionForm.values.directionLibelle}
              size="sm"
              style={{ textAlign: (isRTL || forceArabicDirection) ? 'right' : 'left' }}
              dir={(isRTL || forceArabicDirection) ? 'rtl' : 'ltr'}
              lang={(isRTL || forceArabicDirection) ? 'ar' : undefined}
              ref={directionInputRef}
            />
            {currentLanguage === 'ar' && forceArabicDirection && (
              <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                  {arabicKeys.map((k) => (
                    <Button key={k} size="sm" variant="light" onClick={() => insertArabicChar(directionInputRef, directionForm.values.directionLibelle, directionForm.setFieldValue, 'directionLibelle', k)}>{k}</Button>
                  ))}
                  <Button size="sm" variant="light" onClick={() => insertArabicChar(directionInputRef, directionForm.values.directionLibelle, directionForm.setFieldValue, 'directionLibelle', '␣')}>{currentLanguage === 'ar' ? 'مسافة' : 'Espace'}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => insertArabicChar(directionInputRef, directionForm.values.directionLibelle, directionForm.setFieldValue, 'directionLibelle', '⌫')}>⌫</Button>
                </div>
              </div>
            )}
            {directionForm.touched.directionLibelle &&
              directionForm.errors.directionLibelle && (
                <small className="text-danger d-block">
                  {directionForm.errors.directionLibelle}
                </small>
              )}
            <label className="mt-3">{currentLanguage === 'ar' ? 'المدير' : t('direction.form.director', { defaultValue: 'Directeur' })}</label>
            <Form.Select
              disabled={loadingDirecteurList || loadingDirectionCreate}
              name="directeur"
              onChange={directionForm.handleChange}
              onBlur={directionForm.handleBlur}
              value={directionForm.values.directeur}
            >
              <option value={""}>
                {currentLanguage === 'ar' ? '---- يرجى اختيار مدير ----' : '— Sélectionnez un utilisateur (directeur) —'}
              </option>
              {directeurs.length > 0 &&
                directeurs.map((utilisateur) => (
                  <option key={utilisateur._id} value={utilisateur._id}>
                    {utilisateur.prenom} {utilisateur.nom}
                  </option>
                ))}
            </Form.Select>
            {directionForm.touched.directeur &&
              directionForm.errors.directeur && (
                <small className="text-danger d-block">
                  {directionForm.errors.directeur}
                </small>
              )}
            <Button className="mt-3 w-100 rounded-pill d-flex align-items-center justify-content-center" type="submit" style={{ background: '#4287f5', border: 'none' }}>
              {isDirectionUpdateForm
                ? (currentLanguage === 'ar' ? 'تحديث' : t('direction.actions.update', { defaultValue: 'Mettre à jour' }))
                : (currentLanguage === 'ar' ? 'حفظ' : t('direction.actions.create', { defaultValue: 'Créer' }))}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {}

      {}
      <Modal
        centered
        size="md"
        show={serviceShow}
        onHide={hideServiceModalHandler}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Modal.Header closeButton style={{ flexDirection: isRTL ? 'row-reverse' : 'row', borderBottom: '1px solid var(--border-light)' }}>
          <h6 className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <FaBuilding className={isRTL ? 'ms-2' : 'me-2'} />
            {currentLanguage === 'ar' ? 'إضافة/تعديل خدمة' : t('direction.modal.titleService', { defaultValue: 'Ajouter / Modifier un service' })}
          </h6>
        </Modal.Header>
        <Modal.Body dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-primary)' }}>
          {loadingServiceCreate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingServiceUpdate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorServiceCreate && (
            <Message itWillBeHidden={true} type="danger">
              {localizeError(errorServiceCreate)}
            </Message>
          )}
          {errorServiceUpdate && (
            <Message itWillBeHidden={true} type="danger">
              {localizeError(errorServiceUpdate)}
            </Message>
          )}
          {errorChefServiceList && (
            <Message itWillBeHidden={true} type="danger">
              {localizeError(errorChefServiceList)}
            </Message>
          )}
          <Form onSubmit={serviceForm.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-1" style={{ gap: 8 }}>
              <label className="mb-0">{currentLanguage === 'ar' ? 'التسمية' : t('direction.service.label', { defaultValue: 'Libellé' })}</label>
              {currentLanguage === 'ar' && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill d-inline-flex align-items-center"
                  onClick={() => setForceArabicService((v) => !v)}
                  style={{ padding: '2px 8px', gap: 6 }}
                >
                  <FaKeyboard />
                  <span className={isRTL ? 'me-1' : 'ms-1'}>{forceArabicService ? 'إيقاف' : 'لوحة مفاتيح عربية'}</span>
                </Button>
              )}
            </div>
            <Form.Control
              name="serviceLibelle"
              value={serviceForm.values.serviceLibelle}
              placeholder={currentLanguage === 'ar' ? 'مثال: المحاسبة، الإنتاج المعلوماتي...' : t('direction.service.placeholder', { defaultValue: 'Ex: Comptabilité, Production informatique...' })}
              onChange={serviceForm.handleChange}
              onBlur={serviceForm.handleBlur}
              size="sm"
              style={{ textAlign: (isRTL || forceArabicService) ? 'right' : 'left' }}
              dir={(isRTL || forceArabicService) ? 'rtl' : 'ltr'}
              lang={(isRTL || forceArabicService) ? 'ar' : undefined}
              ref={serviceInputRef}
            />
            {currentLanguage === 'ar' && forceArabicService && (
              <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                  {arabicKeys.map((k) => (
                    <Button key={k} size="sm" variant="light" onClick={() => insertArabicChar(serviceInputRef, serviceForm.values.serviceLibelle, serviceForm.setFieldValue, 'serviceLibelle', k)}>{k}</Button>
                  ))}
                  <Button size="sm" variant="light" onClick={() => insertArabicChar(serviceInputRef, serviceForm.values.serviceLibelle, serviceForm.setFieldValue, 'serviceLibelle', '␣')}>{currentLanguage === 'ar' ? 'مسافة' : 'Espace'}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => insertArabicChar(serviceInputRef, serviceForm.values.serviceLibelle, serviceForm.setFieldValue, 'serviceLibelle', '⌫')}>⌫</Button>
                </div>
              </div>
            )}
            {serviceForm.touched.serviceLibelle &&
              serviceForm.errors.serviceLibelle && (
                <small className="text-danger d-block">
                  {serviceForm.errors.serviceLibelle}
                </small>
              )}
            <label className="mt-3">{currentLanguage === 'ar' ? 'رئيس المصلحة' : t('direction.service.chief', { defaultValue: 'Chef de service' })}</label>
            <Form.Select
              disabled={loadingChefServiceList || loadingServiceCreate}
              name="chefService"
              onChange={serviceForm.handleChange}
              onBlur={serviceForm.handleBlur}
              value={serviceForm.values.chefService}
            >
              <option value={""}>
                {currentLanguage === 'ar' ? '— يرجى اختيار مستخدم (رئيس المصلحة) —' : '— Sélectionnez un utilisateur (chef de service) —'}
              </option>
              {chefServices.length > 0 &&
                chefServices.map((utilisateur) => (
                  <option key={utilisateur._id} value={utilisateur._id}>
                    {utilisateur.prenom} {utilisateur.nom}
                  </option>
                ))}
            </Form.Select>
            {serviceForm.touched.chefService &&
              serviceForm.errors.chefService && (
                <small className="text-danger d-block">
                  {serviceForm.errors.chefService}
                </small>
              )}
            <Button className="mt-3 w-100 rounded-pill d-flex align-items-center justify-content-center" type="submit" style={{ background: '#4287f5', border: 'none' }}>
              {isServiceUpdateForm
                ? (currentLanguage === 'ar' ? 'تحديث' : t('direction.actions.update', { defaultValue: 'Mettre à jour' }))
                : (currentLanguage === 'ar' ? 'حفظ' : t('direction.actions.create', { defaultValue: 'Créer' }))}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {}

      {errorDirecteurist && (
        <Message itWillBeHidden={true} type="danger">
          {localizeError(errorDirecteurist)}
        </Message>
      )}
      {errorDirectionList && (
        <Message itWillBeHidden={true} type="danger">
          {localizeError(errorDirectionList)}
        </Message>
      )}
      {errorDirectionRemove && (
        <Message itWillBeHidden={true} type="danger">
          {localizeError(errorDirectionRemove)}
        </Message>
      )}

      {errorServiceListByDirectionID && (
        <Message itWillBeHidden={true} type="danger">
          {localizeError(errorServiceListByDirectionID)}
        </Message>
      )}

      {errorServiceRemove && (
        <Message itWillBeHidden={true} type="danger">
          {localizeError(errorServiceRemove)}
        </Message>
      )}
      <Message variant="info">
        {currentLanguage === 'ar'
          ? "لعرض العناصر التابعة (الخدمات) لإدارة معيّنة، انقر على صفّها في الجدول"
          : t('direction.hint', { defaultValue: "Pour afficher les enfants d'une direction, cliquez sur sa ligne." })}
      </Message>

      {}
      <div className="d-flex align-items-center mb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSitemap style={{ color: '#0d6efd' }} />
            {currentLanguage === 'ar' ? 'الإدارات والخدمات' : t('direction.titleFull', { defaultValue: 'Directions & Services' })}
          </h2>
          <small className="text-muted">{currentLanguage === 'ar' ? 'إدارة الإدارات والخدمات' : t('direction.subtitle', { defaultValue: 'Gérer les directions et les services' })}</small>
        </div>
      </div>

      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          {loadingDirectionList && <TableLoading />}
          {directions.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: (
                    <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? (
                        <>
                          {currentLanguage === 'ar' ? 'التسمية' : t('direction.label', { defaultValue: 'Libellé' })}
                          <FaTag className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaTag className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'التسمية' : t('direction.label', { defaultValue: 'Libellé' })}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "libelle",
                  filter: "libelle",
                  enableArabicKeyboard: true,
                },
                {
                  Header: (
                    <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? (
                        <>
                          {currentLanguage === 'ar' ? 'المدير' : t('direction.director', { defaultValue: 'Directeur' })}
                          <FaUserTie className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaUserTie className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'المدير' : t('direction.director', { defaultValue: 'Directeur' })}
                        </>
                      )}
                    </span>
                  ),
                  accessor: (row) => {
                    const { directeur } = row;
                    if (directeur)
                      return `${directeur.nom} ${directeur.prenom}`;
                  },
                  id: 'directeur',
                  filter: "directeur",
                  Cell: ({ row }) => {
                    const { directeur } = row.original;
                    if (directeur && directeur.nom) {
                      return `${directeur.nom} ${directeur.prenom || ""}`;
                    }
                    return "";
                  },
                },
              ]}
              data={directions}
              loadingRemove={loadingDirectionRemove}
              removeRow={removeDirectionHandler}
              updateRow={updateDirectionHandler}
              rowClick={getServicesHandler}
              dropdownFilters={[`directeur`]}
              headerActions={
                <>
                  <Button
                    size="sm"
                    onClick={() => { setIsDirectionUpdateForm(false); setDirectionShow(true); }}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{ background: '#4287f5', border: 'none', padding: '6px 14px', gap: 8 }}
                  >
                    <FaPlus />
                    <span className={isRTL ? 'me-1' : 'ms-1'}>{currentLanguage === 'ar' ? 'إضافة إدارة' : t('direction.add', { defaultValue: 'Ajouter une direction' })}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => { dispatch(fetchDirections()); setSelectedDirection(null); }}
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
            successDirectionList && (
              <WarningMessage message={currentLanguage === 'ar' ? 'لا توجد إدارات' : t('direction.empty', { defaultValue: 'Aucune direction trouvée' })} />
            )
          )}
        </Card.Body>
      </Card>
      <div className="d-flex align-items-center my-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <hr className="flex-grow-1" style={{ borderColor: 'var(--border-light)' }} />
        <div className="px-3" style={{ 
          background: 'var(--bg-primary)', 
          color: 'var(--text-muted)', 
          fontSize: '0.875rem',
          fontWeight: 500,
          textAlign: isRTL ? 'right' : 'left'
        }}>
          {currentLanguage === 'ar' ? 'الخدمات التابعة' : 'Services associés'}
        </div>
        <hr className="flex-grow-1" style={{ borderColor: 'var(--border-light)' }} />
      </div>
      {selectedDirection ? (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%' }}>
              <p className="mt-1 mb-0 d-flex align-items-center" style={{ gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row', textAlign: isRTL ? 'right' : 'left', order: isRTL ? 2 : 0 }}>
                {currentLanguage === 'ar' ? (
                  <>
                    <span style={{ fontWeight: 'bold' }}>{selectedDirectionLibelle}</span>
                    <small>الإدارة المحددة :</small>
                  </>
                ) : (
                  <>
                    <small>{currentLanguage === 'ar' ? 'الإدارة المحددة :' : 'Direction sélectionnée :'}</small>
                    <span style={{ fontWeight: 'bold' }}>{selectedDirectionLibelle}</span>
                  </>
                )}
              </p>
              <Button
                size="sm"
                className="rounded-pill d-flex align-items-center justify-content-center"
                onClick={(e) => {
                  setIsServiceUpdateForm(false);
                  setServiceShow(true);
                }}
                style={{ background: '#4287f5', border: 'none', gap: 8, padding: '6px 14px', flexDirection: isRTL ? 'row-reverse' : 'row', order: isRTL ? 1 : 0 }}
              >
                <FaPlus />
                <span>{currentLanguage === 'ar' ? 'إضافة خدمة' : t('direction.service.add', { defaultValue: 'Ajouter un service' })}</span>
              </Button>
            </div>
            {loadingServiceListByDirectionID && <TableLoading />}
            {services.length > 0 ? (
              <Table
                columns={[
                  {
                    Header: "ID",
                    accessor: "_id",
                    show: false,
                  },
                  {
                    Header: (
                      <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                        {isRTL ? (
                          <>
                            {currentLanguage === 'ar' ? 'التسمية' : t('direction.service.label', { defaultValue: 'Libellé' })}
                            <FaTag className="ms-2" style={{ color: '#0d6efd' }} />
                          </>
                        ) : (
                          <>
                            <FaTag className="me-2" style={{ color: '#0d6efd' }} />
                            {currentLanguage === 'ar' ? 'التسمية' : t('direction.service.label', { defaultValue: 'Libellé' })}
                          </>
                        )}
                      </span>
                    ),
                    accessor: "libelle",
                    filter: "libelle",
                  },
                  {
                    Header: (
                      <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                        {isRTL ? (
                          <>
                            {currentLanguage === 'ar' ? 'رئيس المصلحة' : t('direction.service.chief', { defaultValue: 'Chef de service' })}
                            <FaUserTie className="ms-2" style={{ color: '#0d6efd' }} />
                          </>
                        ) : (
                          <>
                            <FaUserTie className="me-2" style={{ color: '#0d6efd' }} />
                            {currentLanguage === 'ar' ? 'رئيس المصلحة' : t('direction.service.chief', { defaultValue: 'Chef de service' })}
                          </>
                        )}
                      </span>
                    ),
                    accessor: (row) => {
                      const { chefService } = row;
                      if (chefService)
                        return `${chefService.nom} ${chefService.prenom}`;
                    },
                    id: 'chefService',
                    filter: "chefService",
                    Cell: ({ row }) => {
                      const { chefService } = row.original;
                      if (chefService && chefService.nom) {
                        return `${chefService.nom} ${chefService.prenom || ""}`;
                      }
                      return "";
                    },
                  },
                ]}
                data={services}
                loadingRemove={loadingServiceRemove}
                removeRow={removeServiceHandler}
                updateRow={updateServiceHandler}
              />
            ) : (
              successServiceListByDirectionID && (
                <WarningMessage message={currentLanguage === 'ar' ? 'لا توجد مصالح' : t('direction.service.empty', { defaultValue: 'Aucun service trouvé' })} />
              )
            )}
          </Card.Body>
        </Card>
      ) : (
        <WarningMessage message={currentLanguage === 'ar' ? 'لم يتم تحديد إدارة' : 'Aucune direction sélectionnée'} />
      )}

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
              ? `هل أنت متأكد من حذف ${confirmDelete.type === 'service' ? 'الخدمة' : 'الإدارة'}${confirmDelete.label ? `: ${confirmDelete.label}` : ''}؟`
              : `Êtes-vous sûr de vouloir supprimer ${confirmDelete.type === 'service' ? 'le service' : 'la direction'}${confirmDelete.label ? ` : ${confirmDelete.label}` : ''} ?`}
          </p>
          <div className="d-flex" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Button
              size="sm"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ background: '#dc3545', border: 'none', padding: '6px 14px' }}
              onClick={() => {
                if (confirmDelete.type === 'service') {
                  dispatch(removeService(confirmDelete.id));
                } else if (confirmDelete.type === 'direction') {
                  dispatch(removeDirection(confirmDelete.id));
                }
                setConfirmDelete({ show: false, type: null, id: null, label: '' });
              }}
              disabled={loadingDirectionRemove || loadingServiceRemove}
            >
              {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ padding: '6px 14px' }}
              onClick={() => setConfirmDelete({ show: false, type: null, id: null, label: '' })}
              disabled={loadingDirectionRemove || loadingServiceRemove}
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DirectionListPage;
