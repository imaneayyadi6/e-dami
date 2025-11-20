import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteOption,
  fetchOptions,
  resetDeleteOption,
} from "../../redux/option/optionActions";
import { Card, Modal, Button } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../../services";
import { FaPlus, FaSyncAlt, FaBriefcase, FaSitemap, FaBuilding, FaProjectDiagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const OptionListPageAdmin = () => {
  const [callOnce, setCallOnce] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [active, setActive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, label: '' });
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
  const optionList = useSelector((state) => state.optionList);
  const {
    loading: loadingOptionList,
    error: errorOptionList,
    success: successOptionList,
    options,
  } = optionList;

  const optionDelete = useSelector((state) => state.optionDelete);
  const {
    loading: loadingOptionDelete,
    error: errorOptionDelete,
    success: successOptionDelete,
  } = optionDelete;

  const removeOptionHandler = (id) => {
    const option = options.find((op) => String(op._id) === String(id));
    setActive(!option.isDeleted);
    setConfirmDelete({ show: true, id, label: option?.libelle || '' });
  };

  const updateOptionHandler = (id) => {
    if (!id) return;
    navigate(`/admin/modifier-option/${encodeURIComponent(id)}`);
  };

  const showDetailsHandler = (id) => {
    navigate(`/admin/details-option/${id}`);
  };

  useEffect(() => {
    if (successOptionDelete) {
      dispatch(resetDeleteOption());
      if (active) {
        Toast.open({
          type: "success",
          title: "Activation avec succès",
          message: `l' option a été activer avec succès`,
        });
      } else {
        Toast.open({
          type: "success",
          title: "Desactivation avec succès",
          message: `l' option a été deactiver avec succès`,
        });
      }
    }
    if (!callOnce) {
      dispatch(fetchOptions());
      setCallOnce(true);
    }
  }, [callOnce, dispatch, successOptionDelete, active]);

  return (
    <>
      {errorOptionList && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionList}
        </Message>
      )}

      {errorOptionDelete && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionDelete}
        </Message>
      )}
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3" style={{ justifyContent: 'space-between', flexDirection: 'row', gap: 12, flexWrap: 'nowrap' }}>
            <div style={{ textAlign: isRTL ? 'right' : 'left', order: isRTL ? 1 : 1 }}>
              <h4 className="mb-1" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentLanguage === 'ar' ? 'الخيارات (دامي)' : 'Options (DAMI)'}</h4>
              <small className="text-muted">{currentLanguage === 'ar' ? 'إدارة واستشارة خيارات دامي' : 'Gérer et consulter les options DAMI'}</small>
            </div>
            <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', order: isRTL ? 2 : 2, flexShrink: 0 }}>
              <Link className="btn btn-sm btn-primary rounded-pill d-flex align-items-center" to="/admin/creer-option" style={{ gap: 6, background: '#4287f5', border: 'none' }}>
                <FaPlus />
                <span>{currentLanguage === 'ar' ? 'إضافة خيار' : 'Ajouter une option'}</span>
              </Link>
              <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center" onClick={() => dispatch(fetchOptions())} style={{ gap: 6 }}>
                <FaSyncAlt />
                <span>{currentLanguage === 'ar' ? 'تحديث' : 'Actualiser'}</span>
              </button>
            </div>
          </div>
          {loadingOptionList && <TableLoading />}

          {options && options.length > 0 ? (
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
                          {currentLanguage === 'ar' ? 'التسمية' : 'Libellé'}
                          <FaBriefcase className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaBriefcase className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'التسمية' : 'Libellé'}
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
                          {currentLanguage === 'ar' ? 'نوع العملية' : 'Type de processus'}
                          <FaProjectDiagram className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaProjectDiagram className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'نوع العملية' : 'Type de processus'}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "typeProcessus",
                  filter: "typeProcessus",
                  enableArabicKeyboard: true,
                },
                {
                  Header: (
                    <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? (
                        <>
                          {currentLanguage === 'ar' ? 'الفئة الفرعية' : 'Sous-catégorie'}
                          <FaSitemap className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaSitemap className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'الفئة الفرعية' : 'Sous-catégorie'}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "sousCategorie.libelle",
                  filter: "sousCategorie.libelle",
                },
                {
                  Header: (
                    <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? (
                        <>
                          {currentLanguage === 'ar' ? 'المصلحة' : 'Service'}
                          <FaBuilding className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaBuilding className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'المصلحة' : 'Service'}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "service.libelle",
                  filter: "service.libelle",
                },
                {
                  Header: currentLanguage === 'ar' ? 'المنشئ' : 'Créateur',
                  accessor: (row) => {
                    if (row.createur && row.createur.nom && row.createur.prenom) {
                      return `${row.createur.prenom} ${row.createur.nom}`;
                    } else if (row.createur && row.createur.nom) {
                      return row.createur.nom;
                    } else {
                      return currentLanguage === 'ar' ? 'غير محدد' : 'Non défini';
                    }
                  },
                  filter: "createur.nom",
                },
              ]}
              data={Array.isArray(options) ? options : []}
              loadingRemove={loadingOptionDelete}
              showDetailsRow={showDetailsHandler}
              updateRow={updateOptionHandler}
              removeRow={removeOptionHandler}
              dropdownFilters={[
                "sousCategorie.libelle",
                "service.libelle",
                "createur.nom",
              ]}
              headerActions={null}
            />
          ) : (
            successOptionList && (
              <WarningMessage message={currentLanguage === 'ar' ? 'لا توجد خيارات' : 'Aucune option trouvée'} />
            )
          )}
        </Card.Body>
      </Card>
      {}
      <Modal centered show={confirmDelete.show} onHide={() => setConfirmDelete({ show: false, id: null, label: '' })} dir={isRTL ? 'rtl' : 'ltr'}>
        <Modal.Header closeButton>
          <h6 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {currentLanguage === 'ar' ? 'تأكيد' : 'Confirmation'}
          </h6>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3" style={{ color: 'var(--text-primary)' }}>
            {currentLanguage === 'ar'
              ? `هل أنت متأكد من ${active ? 'تفعيل' : 'تعطيل'} الخيار${confirmDelete.label ? `: ${confirmDelete.label}` : ''}؟`
              : `Êtes-vous sûr de vouloir ${active ? 'activer' : 'désactiver'} l'option${confirmDelete.label ? ` : ${confirmDelete.label}` : ''} ?`}
          </p>
          <div className="d-flex" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Button
              size="sm"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ background: active ? '#198754' : '#dc3545', border: 'none', padding: '6px 14px' }}
              onClick={() => {
                dispatch(deleteOption(confirmDelete.id));
                setConfirmDelete({ show: false, id: null, label: '' });
              }}
              disabled={loadingOptionDelete}
            >
              {currentLanguage === 'ar' ? (active ? 'تأكيد' : 'حذف') : (active ? 'Confirmer' : 'Supprimer')}
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              className="rounded-pill d-flex align-items-center justify-content-center"
              style={{ padding: '6px 14px' }}
              onClick={() => setConfirmDelete({ show: false, id: null, label: '' })}
              disabled={loadingOptionDelete}
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OptionListPageAdmin;


