import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { capitalizeFirstLetter } from "../services";
import { getCodeFromResp } from "../services/getCodeFromResp";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";

const DamiDemande = ({ demande }) => {
  const cleanDocRef = useRef(null);
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  
  const translations = {
    fr: {
      document: "document",
      classification: "classification", 
      creation: "creation",
      maj: "maj",
      requestDate: "Date demande:",
      department: "Departement",
      name: "Nom:",
      firstName: "Prenom",
      matricule: "Matricule:",
      service: "Service",
      email: "Email:",
      gsm: "Gsm",
      direction: "Direction",
      decision: "Decision:",
      yes: "Oui",
      no: "Non",
      date: "Date:",
      signature: "Signature & cachet:",
      interim: "interim"
    },
    ar: {
      document: "وثيقة",
      classification: "تصنيف",
      creation: "إنشاء",
      maj: "تحديث",
      requestDate: "تاريخ الطلب:",
      department: "قسم",
      name: "الاسم:",
      firstName: "الاسم الأول",
      matricule: "رقم التسجيل:",
      service: "خدمة",
      email: "البريد الإلكتروني:",
      gsm: "الهاتف المحمول",
      direction: "إدارة",
      decision: "قرار:",
      yes: "نعم",
      no: "لا",
      date: "تاريخ:",
      signature: "توقيع وختم:",
      interim: "مؤقت"
    }
  };

  const currentTranslations = translations[currentLanguage] || translations.fr;

  const [sigTypes] = useState({
    cds: t('dami.sigTypes.cds', { defaultValue: currentLanguage === 'ar' ? 'موافقة رئيس الخدمة' : 'Approbation Chef de Service' }),
    cdd: t('dami.sigTypes.cdd', { defaultValue: currentLanguage === 'ar' ? 'موافقة رئيس القسم' : 'Approbation Chef de Departement' }),
    hiq: t('dami.sigTypes.hiq', { defaultValue: currentLanguage === 'ar' ? 'موافقة المدير الهرمي' : 'Approbation Directeur Hiearchique' }),
    atr: t('dami.sigTypes.atr', { defaultValue: currentLanguage === 'ar' ? 'موافقة ' : 'Approbation de ' }),
    pdd: t('dami.sigTypes.pdd', { defaultValue: currentLanguage === 'ar' ? 'موافقة مالك البيانات' : 'Approbation Proprietaire de donnees' }),
    dir: t('dami.sigTypes.dir', { defaultValue: currentLanguage === 'ar' ? 'موافقة مدير ' : 'Approbation Directeur de la ' }),
    dg: t('dami.sigTypes.dg', { defaultValue: currentLanguage === 'ar' ? 'موافقة المدير العام' : 'Approbation directeur generale' }),
    pdg: t('dami.sigTypes.pdg', { defaultValue: currentLanguage === 'ar' ? 'موافقة الرئيس المدير العام' : 'Approbation President-directeur generale' }),
  });

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
      
      
      
    }
  };

  const makeRemoveReadOnly = () => {
    if (cleanDocRef && cleanDocRef.current) {
      cleanDocRef.current
        .querySelectorAll(".dami-input")
        .forEach((damiInput) => {
          damiInput.readOnly = true;
        });
      cleanDocRef.current
        .querySelectorAll(".dami-textarea-line")
        .forEach((damiInput) => {
          damiInput.readOnly = true;
        });
      cleanDocRef.current
        .querySelectorAll(".dami-check-box")
        .forEach((damiInput) => {
          damiInput.readOnly = true;
          damiInput.disabled = true;
        });
      cleanDocRef.current
        .querySelectorAll(".dami-radio-button")
        .forEach((damiInput) => {
          damiInput.readOnly = true;
          damiInput.disabled = true;
        });
    }
  };

  const verfySectionCond = () => {
    if (
      demande?.option?.sectionConditions !== null &&
      demande?.option?.sectionConditions !== undefined
    ) {
      const sectionCondtions = document.querySelectorAll(".section-condtion");
      for (const seccon of sectionCondtions) {
        const code =
          demande?.option?.sectionConditions?.[seccon.getAttribute("id")];
        console.log(
          `${code} is equal ${getCodeFromResp(
            userInfo,
            demande?.demandeur,
            demande?.option
          )} ${
            String(
              getCodeFromResp(userInfo, demande?.demandeur, demande?.option)
            ) === String(code)
          } `
        );
        if (seccon.querySelector(".overlay")) {
          seccon.querySelector(".overlay").remove();
        }
        if (
          String(
            getCodeFromResp(userInfo, demande?.demandeur, demande?.option)
          ) === String(code)
        ) {
          seccon.querySelectorAll(".dami-input").forEach((damiInput) => {
            damiInput.readOnly = false;
          });
          seccon
            .querySelectorAll(".dami-textarea-line")
            .forEach((damiInput) => {
              damiInput.readOnly = false;
            });
          seccon.querySelectorAll(".dami-check-box").forEach((damiInput) => {
            damiInput.readOnly = false;
            damiInput.disabled = false;
          });
          seccon.querySelectorAll(".dami-radio-button").forEach((damiInput) => {
            damiInput.readOnly = false;
            damiInput.disabled = false;
          });
        } else {
          const overlay = document.createElement("div");
          overlay.className = "overlay";
          seccon.appendChild(overlay);
        }
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      removeBtnsAndLayoutsFromCreateModal();
      makeRemoveReadOnly();
    }, 300);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      verfySectionCond();
    }, 400);
  });

  return (
    <div className={`dami`} id="dami" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="dami-header">
        <div className="dami-snrt-logo">
          <img alt="dami-logo" src="/images/logo.png" className="dami-logo" />
        </div>
        <div className="dami-lb-tp">
          <span className="d-block dami-type-de-processus">
            {demande?.option?.typeProcessus || ''}
          </span>
          <span className="d-block dami-libelle">
            {demande &&
              demande?.option &&
              demande.option.libelle &&
                  String(demande?.option?.libelle || '').toLowerCase()}
          </span>
        </div>
        <div className="dami-codification">
          <table className="dami-codification-table ">
            <tr>
              <td>{currentTranslations.document}</td>
              <td>
                <span className="dami-header-codi-item dami-header-document">
                  {demande?.option?.header?.document || ''}
                </span>
              </td>
            </tr>
            <tr>
              <td>{currentTranslations.classification}</td>
              <td>
                <span className="dami-header-codi-item dami-header-classification">
                  {demande?.option?.header?.classification || ''}
                </span>
              </td>
            </tr>
            <tr>
              <td>{currentTranslations.creation}</td>
              <td>
                <span className="dami-header-codi-item dami-header-creation">
                  {demande?.option?.header?.creation ? new Date(
                    demande?.option?.header?.creation
                  ).toLocaleDateString() : ''}
                </span>
              </td>
            </tr>
            <tr>
              <td>{currentTranslations.maj}</td>
              <td>
                <span className="dami-header-codi-item dami-header-maj">
                  {demande?.option?.header?.maj ? new Date(demande.option.header.maj).toLocaleDateString() : ''}
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
              <label>{currentTranslations.requestDate}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={demande?.dateDemande ? new Date(demande.dateDemande).toLocaleDateString() : ''}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{currentTranslations.department}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande?.demandeur?.deparatement?.libelle &&
                  capitalizeFirstLetter(demande?.demandeur?.deparatement?.libelle || '')
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{currentTranslations.name}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={capitalizeFirstLetter(demande?.demandeur?.nom || '')}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{currentTranslations.firstName}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={capitalizeFirstLetter(demande?.demandeur?.prenom || '')}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{currentTranslations.matricule}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={demande?.demandeur?.matricule || ''}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{currentTranslations.service}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande?.demandeur?.service?.libelle &&
                  capitalizeFirstLetter(demande?.demandeur?.service?.libelle || '')
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{currentTranslations.email}</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={demande?.demandeur?.email ? String(demande?.demandeur?.email).toLowerCase() : ""}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
            <td>
              <label>{currentTranslations.gsm}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={demande?.demandeur?.gsm || ''}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>{currentTranslations.direction}</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande?.demandeur?.direction?.libelle &&
                  capitalizeFirstLetter(demande?.demandeur?.direction?.libelle || '')
                }
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />
            </td>
          </tr>
        </table>
      </div>
      <div className="dami-body p-2">
        <div
          ref={cleanDocRef}
          dangerouslySetInnerHTML={{
            __html: demande?.contenu || '',
          }}
        ></div>
      </div>
      {demande?.option?.signataires && demande?.option?.signataires?.length > 0 && (
        <div className="dami-footer">
          <div className="signataires">
            {demande?.option?.signataires && demande?.option?.signataires?.map((sig) => (
              <div className="directeur-lib" key={sig}>
                <span>{sigTypes[sig]}</span>
                {sig === "dir" && (
                  <span>{demande?.dirLibelle ? String(demande.dirLibelle).toLowerCase() : ""}</span>
                )}
                {sig === "atr" && (
                  <span>
                    {demande?.option &&
                      demande?.option?.autreResponsableTitre &&
                      String(demande?.option?.autreResponsableTitre || '').toLowerCase()}
                  </span>
                )}
                {demande?.traitement?.find((tr) =>
                  tr && tr.code && tr.code.split(".").find((cd) => String(cd) === String(sig))
                )?.interim && <span> ({currentTranslations.interim})</span>}
              </div>
            ))}
          </div>
          <div className="signataires-ch">
            {demande?.option?.signataires && demande?.option?.signataires?.map((sig) => (
              <div className="sig-item" key={sig}>
                <div className="">
                  <label>{currentTranslations.name}</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig)
                        ? capitalizeFirstLetter(
                            demande.sig.find((sg) => sg && sg.code === sig)?.nom || ""
                          )
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ).code &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr && tr.code &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && capitalizeFirstLetter(userInfo.nom)
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr && tr.code && tr.code === String(sig)
                          ) && capitalizeFirstLetter(userInfo.nom)
                    }
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  />
                </div>
                <div className="">
                  <label>{currentTranslations.firstName}</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig)
                        ? capitalizeFirstLetter(
                            demande.sig.find((sg) => sg && sg.code === sig)?.prenom || ""
                          )
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ).code &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr && tr.code &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && capitalizeFirstLetter(userInfo.prenom)
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr && tr.code && tr.code === String(sig)
                          ) && capitalizeFirstLetter(userInfo.prenom)
                    }
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  />
                </div>
                <div
                  className="d-flex align-items-center"
                  style={{ marginTop: "5px" }}
                >
                  <label>{currentTranslations.decision}</label>
                  <div className="ml-1">
                    <label>{currentTranslations.yes}</label>
                    <input
                      type="checkbox"
                      className={`dami-check-box mr-1 
                    ${
                      demande.traitement.find(
                        (tr) => String(tr.utilisateur) === String(userInfo.id)
                      ) &&
                      demande.traitement
                        .find(
                          (tr) => String(tr.utilisateur) === String(userInfo.id)
                        ) &&
                      demande.traitement
                        .find(
                          (tr) => String(tr.utilisateur) === String(userInfo.id)
                        ).code &&
                      demande.traitement
                        .find(
                          (tr) => String(tr.utilisateur) === String(userInfo.id)
                        )
                        .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && `chk-app-${userInfo.id}`
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code && tr.code === String(sig)
                          ) && `chk-app-${userInfo.id}`
                    }

                    ${
                      demande.sig.find((sg) => sg && sg.code === sig) &&
                      demande.sig.find((sg) => sg && sg.code === sig)?.approuve
                        ? "checked"
                        : ""
                    } `}
                    />
                  </div>
                  <div>
                    <label>{currentTranslations.no}</label>
                    <input
                      type="checkbox"
                      className={`dami-check-box mr-1  ${
                        demande.traitement.find(
                          (tr) => String(tr.utilisateur) === String(userInfo.id)
                        ) &&
                        demande.traitement
                          .find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                        demande.traitement
                          .find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ).code &&
                        demande.traitement
                          .find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          )
                          .code.split(".").length > 1
                          ? demande.traitement.find(
                              (tr) =>
                                String(tr.utilisateur) ===
                                  String(userInfo.id) &&
                                tr &&
                                tr.code &&
                                tr.code
                                  .split(".")
                                  .find((cd) => String(cd) === String(sig))
                            ) && `chk-rfs-${userInfo.id}`
                          : demande.traitement.find(
                              (tr) =>
                                String(tr.utilisateur) ===
                                  String(userInfo.id) &&
                                tr &&
                                tr.code && tr.code === String(sig)
                            ) && `chk-rfs-${userInfo.id}`
                      } ${
                        demande.sig.find((sg) => sg && sg.code === sig) &&
                        demande.sig.find((sg) => sg && sg.code === sig)?.refuse
                          ? "checked"
                          : ""
                      } `}
                    />
                  </div>
                </div>

                <div className="">
                  <label>{currentTranslations.date}</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig) &&
                      demande.sig.find((sg) => sg && sg.code === sig)?.dateTraitement
                        ? new Date(
                            demande.sig.find(
                              (sg) => sg && sg.code === sig
                            ).dateTraitement
                          ).toLocaleDateString()
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            ).code &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && new Date().toLocaleDateString()
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code && tr.code === String(sig)
                          ) && new Date().toLocaleDateString()
                    }
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  />
                </div>
                {}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DamiDemande;
