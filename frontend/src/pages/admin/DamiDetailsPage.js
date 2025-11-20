import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  fetchOptionByID,
  resetFetchOptionByID,
} from "../../redux/option/optionActions";
import { Card, Button } from "react-bootstrap";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";

const DamiDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const { currentLanguage, isRTL } = useLanguageSync();
  const { t } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const optionByID = useSelector(state => state.optionByID);
  const {
    loading: loadingOptionByID,
    error: errorOptionByID,
    option: recoveredOption,
    success: successOptionByID,
  } = optionByID;

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchOptionByID(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill d-flex align-items-center"
          onClick={() => {
            dispatch(resetFetchOptionByID());
            navigate('/admin/options');
          }}
          style={{ 
            gap: 6,
            height: 32,
            background: 'transparent',
            border: '1px solid #dee2e6',
            color: '#6c757d',
            padding: '4px 12px'
          }}
        >
          <FaArrowLeft className={isRTL ? 'ms-1' : 'me-1'} />
          {t('common.back', { defaultValue: 'retour' })}
        </Button>
      </div>

      {errorOptionByID && <Message type='danger' itWillBeHidden>{errorOptionByID}</Message>}
      
      {loadingOptionByID ? (
        <div className="dami-page-container">
          <DamiLoading />
        </div>
      ) : recoveredOption ? (
        <Card className="border-0 shadow-sm">
          <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '1rem 1.5rem' }}>
            <h5 className="mb-0 d-flex align-items-center" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              <FaFileAlt className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd', fontSize: '1.2rem' }} />
              {t('admin.optionDetails', { defaultValue: 'Détails de l\'option DAMI' })}
            </h5>
          </Card.Header>
          <Card.Body className="p-0" style={{ minHeight: '500px' }}>
            <div style={{ padding: '1.5rem', fontSize: isRTL ? '1rem' : '0.95rem', lineHeight: '1.6' }}>
              <Dami option={recoveredOption} showAdmin />
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)' }}>
              <FaFileAlt style={{ color: '#dc3545', fontSize: 28 }} />
            </div>
            <h5 className="text-muted mb-2">
              {currentLanguage === 'ar' ? 'الخيار (DAMI) غير موجود!' : 'option (DAMI) introuvable !'}
            </h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              {currentLanguage === 'ar' ? 'الخيار المطلوب غير موجود أو تم حذفه' : 'L\'option demandée n\'existe pas ou a été supprimée'}
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DamiDetailsPage;
