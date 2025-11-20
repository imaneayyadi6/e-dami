import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { capitalizeFirstLetter } from "../services";
import { getCodeFromResp } from "../services/getCodeFromResp";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";

const Dami = ({ option, showAdmin = false, mini = false }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguageSync();
  const cleanDocRef = useRef(null);
  const [sigTypes] = useState({
    cds: t('dami.sigTypes.cds', { defaultValue: 'Approbation Chef de Service' }),
    cdd: t('dami.sigTypes.cdd', { defaultValue: 'Approbation Chef de Departement' }),
    hiq: t('dami.sigTypes.hiq', { defaultValue: 'Approbation Directeur Hiearchique' }),
    pdd: t('dami.sigTypes.pdd', { defaultValue: 'Approbation Proprietaire de donnees' }),
    atr: t('dami.sigTypes.atr', { defaultValue: 'Approbation de ' }),
    dir: t('dami.sigTypes.dir', { defaultValue: 'Approbation Directeur de la ' }),
    dg: t('dami.sigTypes.dg', { defaultValue: 'Approbation directeur général' }),
    pdg: t('dami.sigTypes.pdg', { defaultValue: 'Approbation président-directeur général' }),
  });

  const [vOption, setVOption] = useState(option);

  const removeBtnsAndLayoutsFromCreateModal = () => {
    if (cleanDocRef && cleanDocRef.current) {
      cleanDocRef.current
        .querySelectorAll(".divider .btn-remove-divider-children")
        .forEach((element) => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".divider div")
        .forEach((element) => {
          element.style.borderRight = "none";
        });
      cleanDocRef.current
        .querySelectorAll(".btn-add-chk")
        .forEach((element) => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".btn-remove-chk")
        .forEach((element) => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-remove-component")
        .forEach((element) => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".btn-remove-checkbox-label-header")
        .forEach((element) => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-add-checkbox-label-header")
        .forEach((element) => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-remove-checkbox-line")
        .forEach((element) => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".btn-add-checkbox-line")
        .forEach((element) => {
          element.remove();
        });

      cleanDocRef.current.querySelectorAll("[readonly]").forEach((element) => {
        element.removeAttribute("readonly");
      });
      cleanDocRef.current.querySelectorAll(".disabled").forEach((element) => {
        element.setAttribute("disabled", true);
      });

      cleanDocRef.current
        .querySelectorAll(".btn-condtion")
        .forEach((element) => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".section-condtion .btn-remove-divider-children")
        .forEach((element) => {
          element.remove();
        });
    }
  };

  const makeRemoveReadOnly = () => {
    if (cleanDocRef && cleanDocRef.current) {
      cleanDocRef.current
        .querySelectorAll(".dami-input")
        .forEach((damiInput) => {
          damiInput.readOnly = false;
        });
      cleanDocRef.current
        .querySelectorAll(".dami-textarea-line")
        .forEach((damiInput) => {
          damiInput.readOnly = false;
        });
    }
  };

  const verfySectionCond = () => {

    if (
      option.sectionConditions !== null &&
      option.sectionConditions !== undefined
    ) {
      const sectionCondtions = document.querySelectorAll(".section-condtion");
      for (const seccon of sectionCondtions) {
        const code = option.sectionConditions[seccon.getAttribute("id")];
        if (String(getCodeFromResp(userInfo), null, option) !== String(code)) {
          const overlay = document.createElement("div");
          overlay.className = "overlay";
          seccon.appendChild(overlay);
        } else {
          if (seccon.querySelector(".overlay")) {
            seccon.querySelector(".overlay").remove();
          }
        }
      }
    }
  };

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    setTimeout(() => {
      removeBtnsAndLayoutsFromCreateModal();
      makeRemoveReadOnly();
    }, 100);
  }, []);

  useEffect(() => {
    verfySectionCond();
  }, 100);

  const applyEvents = () => {
    console.log("event apply");
    if (option.conditions) {
      for (const cd of option.conditions) {
        const el = document.querySelector(
          `.dami-body  [data-conditionid='${cd.element}']`
        );
        el.addEventListener("click", () => {
          setVOption({ ...option, conditions: option.conditions });
        });
      }
    }
  };

  console.log(option.conditions);
  useEffect(() => {
    applyEvents();
  }, []);

  return (
    <div className={`dami ${mini ? "mini-dami" : ""}`} id="dami" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="dami-header">
        <div className="dami-snrt-logo">
          <img alt="dami-logo" src="/images/logo.png" className="dami-logo" />
        </div>
        <div className="dami-lb-tp">
          <span className="d-block dami-type-de-processus">
            {option.typeProcessus}
          </span>
          <span className="d-block dami-libelle">{option.libelle}</span>
        </div>
        <div className="dami-codification">
          <table className="dami-codification-table ">
            <tr>
              <td>{t('dami.header.document', { defaultValue: 'document' })}</td>
              <td>
                <span className="dami-header-codi-item dami-header-document">
                  {option.header && option.header.document}
                </span>
              </td>
            </tr>
            <tr>
              <td>{t('dami.header.classification', { defaultValue: 'classification' })}</td>
              <td>
                <span className="dami-header-codi-item dami-header-classification">
                  {option.header && option.header.classification}
                </span>
              </td>
            </tr>
            <tr>
              <td>{t('dami.header.creation', { defaultValue: 'creation' })}</td>
              <td>
                <span className="dami-header-codi-item dami-header-creation">
                  {option.header && option.header.creation && new Date(option.header.creation).toLocaleDateString()}
                </span>
              </td>
            </tr>
            <tr>
              <td>{t('dami.header.update', { defaultValue: 'maj' })}</td>
              <td>
                <span className="dami-header-codi-item dami-header-maj">
                  {option.header && option.header.maj && new Date(option.header.maj).toLocaleDateString()}
                </span>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div className="demandeur-section">
        <table>
          <tr>
            <td>
              <label>{t('dami.form.dateRequest', { defaultValue: 'Date demande:' })}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={new Date().toLocaleDateString()}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{t('dami.form.department', { defaultValue: 'Depratement' })}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  !showAdmin && userInfo && userInfo.departement
                    ? capitalizeFirstLetter(userInfo.departement.libelle)
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{t('dami.form.matricule', { defaultValue: 'Matricule:' })}</label>
            </td>
            <td>
              <input
                className="dami-input "
                value={!showAdmin && userInfo ? userInfo.matricule : ""}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{t('dami.form.service', { defaultValue: 'Service' })}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  !showAdmin && userInfo && userInfo.service
                    ? capitalizeFirstLetter(userInfo.service.libelle)
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{t('dami.form.lastName', { defaultValue: 'Nom:' })}</label>
            </td>
            <td>
              <input
                className="dami-input "
                value={
                  !showAdmin && userInfo
                    ? capitalizeFirstLetter(userInfo.nom)
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{t('dami.form.firstName', { defaultValue: 'Prenom' })}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  !showAdmin && userInfo
                    ? capitalizeFirstLetter(userInfo.prenom)
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{t('dami.form.email', { defaultValue: 'Email:' })}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={
                  !showAdmin && userInfo && userInfo.email
                    ? userInfo.email.toLowerCase()
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{t('dami.form.gsm', { defaultValue: 'Gsm' })}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  !showAdmin && userInfo && userInfo.gsm ? userInfo.gsm : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{t('dami.form.direction', { defaultValue: 'Direction' })}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  !showAdmin && userInfo && userInfo.direction
                    ? capitalizeFirstLetter(userInfo.direction.libelle)
                    : ""
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </div>
      <div className="dami-body p-2">
        <div
          ref={cleanDocRef}
          dangerouslySetInnerHTML={{
            __html: option.contenu,
          }}
        ></div>
      </div>
      {vOption.signataires && vOption.signataires.length > 0 && (
        <div className="dami-footer">
          <div className="signataires">
            {vOption.signataires.map((sig) =>
              vOption &&
                vOption.conditions &&
                vOption.conditions.findIndex(
                  (c) => String(c.type) === String(sig)
                ) !== -1 ? (
                document.querySelector(
                  `.dami-body [data-conditionid='${vOption.conditions.find(
                    (c) => String(c.type) === String(sig)
                  ).element
                  }']`
                ) &&
                document.querySelector(
                  `.dami-body [data-conditionid='${vOption.conditions.find(
                    (c) => String(c.type) === String(sig)
                  ).element
                  }']`
                ).checked && (
                  <div className="directeur-lib" key={sig}>
                    <span>{sigTypes[sig]}</span>
                    {sig === "dir" && (
                      <span>
                        {option &&
                          vOption.dirLibelle &&
                          vOption.dirLibelle.toLowerCase()} 
                      </span>
                    )}
                    {sig === "atr" && (
                      <span>
                        {option &&
                          vOption.autreResponsableTitre &&
                          vOption.autreResponsableTitre.toLowerCase()}
                      </span>
                    )}
                  </div>
                )
              ) : (
                <div className="directeur-lib" key={sig}>
                  <span>{sigTypes[sig]}</span>
                  {sig === "dir" && (
                    <span>
                      {option &&
                        vOption.dirLibelle &&
                        vOption.dirLibelle.toLowerCase()}
                    </span>
                  )}

                  {sig === "atr" && (
                    <span>
                      {option &&
                        vOption.autreResponsableTitre &&
                        vOption.autreResponsableTitre.toLowerCase()}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
          <div className="signataires-ch">
            {vOption.signataires.map((sig) =>
              vOption &&
                vOption.conditions &&
                vOption.conditions.findIndex(
                  (c) => String(c.type) === String(sig)
                ) !== -1 ? (
                document.querySelector(
                  `.dami-body [data-conditionid='${vOption.conditions.find(
                    (c) => String(c.type) === String(sig)
                  ).element
                  }']`
                ) &&
                document.querySelector(
                  `.dami-body [data-conditionid='${vOption.conditions.find(
                    (c) => String(c.type) === String(sig)
                  ).element
                  }']`
                ).checked && (
                  <div className="sig-item" key={sig}>
                    <div className="">
                      <label>{t('dami.form.lastName', { defaultValue: 'Nom:' })}</label>
                      <input className="dami-input" />
                    </div>
                    <div className="">
                      <label>{t('dami.form.firstName', { defaultValue: 'Prenom:' })}</label>
                      <input className="dami-input" />
                    </div>
                    <div
                      className="d-flex align-items-center"
                      style={{ marginTop: "5px" }}
                    >
                      <label>{t('dami.form.decision', { defaultValue: 'Decision:' })}</label>
                      <div className="ml-1">
                        <label>{t('dami.form.yes', { defaultValue: 'Oui' })}</label>
                        <input className="dami-check-box mr-1" />
                      </div>
                      <div>
                        <label>{t('dami.form.no', { defaultValue: 'Non' })}</label>
                        <input className="dami-check-box mr-1" />
                      </div>
                    </div>

                    {}

                    <div className="">
                      <label>{t('dami.form.date', { defaultValue: 'Date:' })}</label>
                      <input className="dami-input" />
                    </div>
                    {}
                  </div>
                )
              ) : (
                <div className="sig-item" key={sig}>
                  <div className="">
                    <label>{t('dami.form.lastName', { defaultValue: 'Nom:' })}</label>
                    <input className="dami-input" />
                  </div>
                  <div className="">
                    <label>{t('dami.form.firstName', { defaultValue: 'Prenom:' })}</label>
                    <input className="dami-input" />
                  </div>
                  <div
                    className="d-flex align-items-center"
                    style={{ marginTop: "5px" }}
                  >
                    <label>{t('dami.form.decision', { defaultValue: 'Decision:' })}</label>
                    <div className="ml-1">
                      <label>{t('dami.form.yes', { defaultValue: 'Oui' })}</label>
                      <input className="dami-check-box mr-1" />
                    </div>
                    <div>
                      <label>{t('dami.form.no', { defaultValue: 'Non' })}</label>
                      <input className="dami-check-box mr-1" />
                    </div>
                  </div>

                  {}

                  <div className="">
                    <label>{t('dami.form.date', { defaultValue: 'Date:' })}</label>
                    <input className="dami-input" />
                  </div>
                  {}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dami;
