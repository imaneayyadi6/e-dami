import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteOption,
  fetchOptions,
  resetDeleteOption,
} from "../../redux/option/optionActions";
import { Card } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast, Dialog } from "../../services";
import { OPTION_LIST_REMOVE } from "../../redux/option/optionTypes";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaBriefcase, FaSitemap, FaBuilding, FaUserShield, FaPlus, FaSyncAlt, FaProjectDiagram } from "react-icons/fa";

const OptionsListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [active, setActive] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    if (option.notSavedYet) {
      let stoptions = localStorage.getItem("options")
        ? JSON.parse(localStorage.getItem("options"))
        : null;
      if (stoptions) {
        stoptions = stoptions.filter((op) => String(op._id) !== String(id));
        localStorage.setItem("options", JSON.stringify(stoptions));
        dispatch({
          type: OPTION_LIST_REMOVE,
          payload: id,
        });
      }
    } else {
      let message = "";
      if (!option.isDeleted) {
        message = "Etes vous sûre de vouloir activer cette option ?";
        setActive(true);
      } else {
        message = "Etes vous sûre de vouloir desactiver cette option ?";
        setActive(false);
      }

      Dialog.open({
        title: "Confirmation",
        message: message,
        onYes: () => {
          dispatch(deleteOption(id));
        },
      });
    }
  };

  const updateOptionHandler = (id) => {
    if (!id) return;
    const option = options.find((op) => String(op._id) === String(id));
    if (option && option.notSavedYet) {
      navigate(`/admin/creer-option`);
      return;
    }
    navigate(`/admin/modifier-option/${encodeURIComponent(id)}`);
  };

  const showDetailsHandler = (id) => {
    navigate(`/admin/details-option/${id}`);
  };

  useEffect(() => {
    if (successOptionDelete) {
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

      dispatch(resetDeleteOption());
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
              <h4 className="mb-1" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentLanguage === 'ar' ? 'الخيارات (دامي)' : t('options.title', { defaultValue: 'Options (DAMI)' })}</h4>
              <small className="text-muted">{currentLanguage === 'ar' ? 'إدارة واستشارة خيارات دامي' : t('options.subtitle', { defaultValue: 'Gérer et consulter les options DAMI' })}</small>
            </div>
            <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', order: isRTL ? 2 : 2, flexShrink: 0 }}>
              <Link className="btn btn-sm btn-primary rounded-pill d-flex align-items-center" to="/admin/creer-option" style={{ gap: 6, background: '#4287f5', border: 'none' }}>
                <FaPlus />
                <span>{currentLanguage === 'ar' ? 'إضافة خيار' : t('options.add', { defaultValue: 'Ajouter une option' })}</span>
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center"
                onClick={() => dispatch(fetchOptions())}
                style={{ gap: 6 }}
              >
                <FaSyncAlt />
                <span>{currentLanguage === 'ar' ? 'تحديث' : t('common.refresh', { defaultValue: 'Actualiser' })}</span>
              </button>
            </div>
          </div>
          {loadingOptionList && <TableLoading />}

          {options.length > 0 ? (
            <div className="table-responsive rounded border bg-body">
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
                          {currentLanguage === 'ar' ? 'التسمية' : t('options.label', { defaultValue: 'Libellé' })}
                          <FaBriefcase className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaBriefcase className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'التسمية' : t('options.label', { defaultValue: 'Libellé' })}
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
                          {currentLanguage === 'ar' ? 'نوع العملية' : t('options.processType', { defaultValue: 'Type de processus' })}
                          <FaProjectDiagram className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaProjectDiagram className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'نوع العملية' : t('options.processType', { defaultValue: 'Type de processus' })}
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
                          {currentLanguage === 'ar' ? 'الفئة الفرعية' : t('options.subcategory', { defaultValue: 'Sous-catégorie' })}
                          <FaSitemap className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaSitemap className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'الفئة الفرعية' : t('options.subcategory', { defaultValue: 'Sous-catégorie' })}
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
                          {currentLanguage === 'ar' ? 'المصلحة' : t('options.service', { defaultValue: 'Service' })}
                          <FaBuilding className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaBuilding className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'المصلحة' : t('options.service', { defaultValue: 'Service' })}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "service.libelle",
                  filter: "service.libelle",
                },

                {
                  Header: (
                    <span className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? (
                        <>
                          {currentLanguage === 'ar' ? 'مالك البيانات' : t('options.dataOwner', { defaultValue: 'Propriétaire de données' })}
                          <FaUserShield className="ms-2" style={{ color: '#0d6efd' }} />
                        </>
                      ) : (
                        <>
                          <FaUserShield className="me-2" style={{ color: '#0d6efd' }} />
                          {currentLanguage === 'ar' ? 'مالك البيانات' : t('options.dataOwner', { defaultValue: 'Propriétaire de données' })}
                        </>
                      )}
                    </span>
                  ),
                  accessor: "proprietaireDeDonnees.libelle",
                  filter: "proprietaireDeDonnees.libelle",
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
                "proprietaireDeDonnees.libelle",
              ]}
              headerActions={null}
            />
            </div>
          ) : (
            successOptionList && (
              <WarningMessage message={currentLanguage === 'ar' ? 'لا توجد خيارات' : 'Aucune option trouvée'} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default OptionsListPage;
