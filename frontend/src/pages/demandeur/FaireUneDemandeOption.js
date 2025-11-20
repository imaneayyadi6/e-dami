import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createDemande,
  resetCreateDemande,
} from "../../redux/demande/demandeActions";
import { Toast } from "../../services";
import { Link, useParams } from "react-router-dom";
import { fetchOptionByID } from "../../redux/option/optionActions";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const FaireUneDemandeOption = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguageSync();
  const [callOnce, setCallOnce] = useState(false);
  const { id } = useParams();
  const optionByID = useSelector((state) => state.optionByID);
  const { loading: loadingOptionID, error: errorOptionID, option } = optionByID;

  const demandeCreate = useSelector((state) => state.demandeCreate);
  const {
    loading: loadingDemandeCreate,
    error: errorDemandeCreate,
    success: successDemandeCreate,
  } = demandeCreate;

  const dispatch = useDispatch();

  const convertTheValueToAttribute = () => {
    const damiBody = document.querySelector(".dami-body div");
    const damiInputs = damiBody.querySelectorAll(".dami-input");
    for (const damiInput of damiInputs)
      damiInput.setAttribute("value", damiInput.value);

    const damiCheckBoxes = damiBody.querySelectorAll(".dami-check-box");
    for (const damiCheckBox of damiCheckBoxes) {
      if (damiCheckBox.checked) {
        damiCheckBox.setAttribute("value", damiCheckBox.checked);
        damiCheckBox.setAttribute("checked", damiCheckBox.checked);
      }
    }
    const damiRadioButtons = damiBody.querySelectorAll(".dami-radio-button");
    for (const damiRadioButton of damiRadioButtons) {
      if (damiRadioButton.checked) {
        damiRadioButton.setAttribute("value", damiRadioButton.checked);
        damiRadioButton.setAttribute("checked", damiRadioButton.checked);
      }
    }
    const damiTextAreaLines = damiBody.querySelectorAll(".dami-textarea-line");
    for (const damiTextAreaLine of damiTextAreaLines)
      damiTextAreaLine.setAttribute("value", damiTextAreaLine.value);
  };

  const resetDamiFormHandler = () => {
    document.querySelectorAll(".dami-body input").forEach((input) => {
      input.value = "";
      
      input.style.borderColor = "";
      input.style.backgroundColor = "";
      if (
        String(input.getAttribute("type")) === "checkbox" ||
        String(input.getAttribute("type")) === "radio"
      ) {
        input.checked = false;
      }
    });
    
    
    document.querySelectorAll(".dami-body textarea").forEach((textarea) => {
      textarea.value = "";
      textarea.style.borderColor = "";
      textarea.style.backgroundColor = "";
    });
  };

  const faireUneDemandeHandler = () => {
    const damiBody = document.querySelector(".dami-body div");
    if (!damiBody) {
      Toast.open({
        type: "danger",
        title: t('dami.toast.errorTitle', { defaultValue: 'Erreur' }),
        message: t('dami.toast.formNotFound', { defaultValue: 'Formulaire non trouvé !' }),
      });
      return;
    }

    let hasAnyInput = false;
    let allFieldsFilled = true;
    let emptyFields = [];

    
    const damiInputs = damiBody.querySelectorAll(".dami-input");
    const damiCheckBoxes = damiBody.querySelectorAll(".dami-check-box");
    const damiRadioButtons = damiBody.querySelectorAll(".dami-radio-button");
    const damiTextAreaLines = damiBody.querySelectorAll(".dami-textarea-line");

    
    if (damiInputs.length === 0 && damiCheckBoxes.length === 0 && 
        damiRadioButtons.length === 0 && damiTextAreaLines.length === 0) {
      hasAnyInput = false;
      allFieldsFilled = true;
    } else {
      hasAnyInput = true;
      
      
      for (const damiInput of damiInputs) {
        if (!damiInput.value || damiInput.value.trim() === "") {
          allFieldsFilled = false;
          emptyFields.push(t('dami.fields.input', { defaultValue: 'champ de saisie' }));
        }
      }

      
      if (damiCheckBoxes.length > 0) {
        let hasCheckedBox = false;
        for (const damiCheckBox of damiCheckBoxes) {
          if (damiCheckBox.checked) {
            hasCheckedBox = true;
            break;
          }
        }
        if (!hasCheckedBox) {
          allFieldsFilled = false;
          emptyFields.push(t('dami.fields.checkbox', { defaultValue: 'case à cocher' }));
        }
      }

      
      if (damiRadioButtons.length > 0) {
        let hasSelectedRadio = false;
        for (const damiRadioButton of damiRadioButtons) {
          if (damiRadioButton.checked) {
            hasSelectedRadio = true;
            break;
          }
        }
        if (!hasSelectedRadio) {
          allFieldsFilled = false;
          emptyFields.push(t('dami.fields.radio', { defaultValue: 'bouton radio' }));
        }
      }

      
      for (const damiTextAreaLine of damiTextAreaLines) {
        if (!damiTextAreaLine.value || damiTextAreaLine.value.trim() === "") {
          allFieldsFilled = false;
          emptyFields.push(t('dami.fields.textarea', { defaultValue: 'zone de texte' }));
        }
      }
    }

    if (!hasAnyInput) {
      
      convertTheValueToAttribute();
      const contenu = damiBody.outerHTML;
      
      dispatch(createDemande(id, contenu));
    } else if (allFieldsFilled) {
      
      convertTheValueToAttribute();
      const contenu = damiBody.outerHTML;
      
      dispatch(createDemande(id, contenu));
    } else {
      
      const uniqueEmptyFields = [...new Set(emptyFields)];
      
      
      damiInputs.forEach(input => {
        if (!input.value || input.value.trim() === "") {
          input.style.borderColor = "#dc3545";
          input.style.backgroundColor = "#fff5f5";
        }
      });
      
      damiTextAreaLines.forEach(textarea => {
        if (!textarea.value || textarea.value.trim() === "") {
          textarea.style.borderColor = "#dc3545";
          textarea.style.backgroundColor = "#fff5f5";
        }
      });
      
      Toast.open({
        type: "danger",
        title: t('dami.toast.incompleteTitle', { defaultValue: '⚠️ Formulaire incomplet' }),
        message: t('dami.toast.incompleteMessage', { defaultValue: 'Veuillez remplir tous les champs obligatoires : {{fields}}' }, { fields: uniqueEmptyFields.join(', ') }),
      });
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchOptionByID(id));
      setCallOnce(true);
    }

    if (successDemandeCreate) {
      const damiBody = document.querySelector(".dami-body");

      damiBody.querySelectorAll(".dami-input").forEach((el) => {
        el.value = "";
        el.style.borderColor = "";
        el.style.backgroundColor = "";
      });
      damiBody.querySelectorAll(".dami-check-box").forEach((el) => {
        el.checked = false;
      });
      damiBody.querySelectorAll(".dami-radio-button").forEach((el) => {
        el.checked = false;
      });
      damiBody.querySelectorAll(".dami-textarea-line").forEach((el) => {
        el.value = "";
        el.style.borderColor = "";
        el.style.backgroundColor = "";
      });

      Toast.open({
        type: "success",
        title: t('dami.toast.successTitle', { defaultValue: '✅ Demande envoyée avec succès !' }),
        message: t('dami.toast.successMessage', { defaultValue: 'Votre demande a été créée et envoyée avec succès' }),
      });

      dispatch(resetCreateDemande());
      dispatch(fetchOptionByID(id));
    }
  }, [successDemandeCreate, dispatch]);

  
  useEffect(() => {
    const damiBody = document.querySelector(".dami-body");
    if (damiBody) {
      const resetFieldStyle = (element) => {
        element.style.borderColor = "";
        element.style.backgroundColor = "";
      };

      
      damiBody.querySelectorAll(".dami-input").forEach((input) => {
        input.addEventListener("input", () => resetFieldStyle(input));
        input.addEventListener("focus", () => resetFieldStyle(input));
      });

      damiBody.querySelectorAll(".dami-textarea-line").forEach((textarea) => {
        textarea.addEventListener("input", () => resetFieldStyle(textarea));
        textarea.addEventListener("focus", () => resetFieldStyle(textarea));
      });

      damiBody.querySelectorAll(".dami-check-box").forEach((checkbox) => {
        checkbox.addEventListener("change", () => resetFieldStyle(checkbox));
      });

      damiBody.querySelectorAll(".dami-radio-button").forEach((radio) => {
        radio.addEventListener("change", () => resetFieldStyle(radio));
      });
    }
  }, [option]);

  return (
    <>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <Link 
          to="/demandeur/faire-une-demande" 
          className="btn btn-sm btn-outline-secondary rounded-pill mb-2 d-flex align-items-center"
          style={{ 
            gap: 6,
            height: 32,
            background: 'transparent',
            border: '1px solid #dee2e6',
            color: '#6c757d',
            padding: '4px 12px'
          }}
        >
          <i className={`fas ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> 
          {t('dami.backToOptions', { defaultValue: 'options' })}
        </Link>
      </div>
      {errorOptionID && (
        <Message itWillBeHidden type="danger">
          {errorOptionID}
        </Message>
      )}
      {errorDemandeCreate && (
        <Message itWillBeHidden type="danger">
          {errorDemandeCreate}
        </Message>
      )}
      {loadingOptionID && (
        <div className="dami-page-container">
          <DamiLoading />
        </div>
      )}
      {option && (
        <>
          <div className="dami-page-container" dir={isRTL ? 'rtl' : 'ltr'}>
            <Dami option={option} />
          </div>
          <div className="d-flex justify-content-center mt-3 gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
            <Button
              className="rounded-pill d-flex align-items-center"
              variant="primary"
              onClick={faireUneDemandeHandler}
              disabled={loadingDemandeCreate}
              style={{ 
                gap: 8,
                height: 40,
                background: '#4287f5',
                border: 'none',
                color: '#fff',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              {loadingDemandeCreate ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                  <span>{t('dami.actions.sending', { defaultValue: 'Envoi en cours...' })}</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-import"></i> 
                  {t('dami.actions.sendRequest', { defaultValue: 'Envoyer la demande' })}
                </>
              )}
            </Button>
            <Button
              className="rounded-pill d-flex align-items-center"
              variant="outline-secondary"
              onClick={resetDamiFormHandler}
              style={{ 
                gap: 8,
                height: 40,
                background: 'transparent',
                border: '1px solid #dee2e6',
                color: '#6c757d',
                padding: '8px 20px',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              <i className="fa-solid fa-file-circle-xmark"></i> 
              {t('dami.actions.resetForm', { defaultValue: 'Réinitialiser' })}
            </Button>
          </div>
        </>
      )}
      {!option && !loadingOptionID && (
        <WarningMessage message={t('dami.errors.optionNotFound', { defaultValue: "option 'dami' introuvable !" })} />
      )}
    </>
  );
};
export default FaireUneDemandeOption;
