import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  fetchOptionByID,
  resetFetchOptionByID,
} from "../../redux/option/optionActions";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";

const DamiDetailsPageCrtOp = () => {
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
      <div className='d-flex justify-content-between align-items-center'>
        <button
          className='btn btn-sm btn-light mb-3'
          onClick={() => {
            dispatch(resetFetchOptionByID());
            navigate('/createur/options');
          }}>
          <i className={`fas ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t('common.back', { defaultValue: 'retour' })}
        </button>
      </div>
      {errorOptionByID && <Message type='danger' itWillBeHidden>{errorOptionByID}</Message>}
      <>

        {loadingOptionByID ? (
          <div className="dami-page-container">
            <DamiLoading />
          </div>
        ) : (
          recoveredOption && (<div className="dami-page-container mt-5">

            <Dami option={recoveredOption} showAdmin />
          </div>
          )
        )}
        {!loadingOptionByID && !recoveredOption && (
          <WarningMessage message={currentLanguage === 'ar' ? 'الخيار (DAMI) غير موجود!' : 'option (DAMI) introuvable !'} />
        )}

      </>
    </div>
  );
};

export default DamiDetailsPageCrtOp;
