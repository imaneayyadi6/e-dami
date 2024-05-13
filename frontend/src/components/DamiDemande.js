import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { capitalizeFirstLetter } from "../services";

const DamiDemande = ({ demande }) => {
  const cleanDocRef = useRef(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [sigTypes] = useState({
    cds: "Approbation Chef de Service",
    cdd: "Approbation Chef de Departement",
    hiq: "Approbation Directeur Hiearchique",
    pdd: "Approbation Proprietaire de donnees",
    dir: `Approbation Directeur de la  `,
    pdg: "Approbation President-directeur generale",
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
      // cleanDocRef.current.querySelectorAll(".dami-check-box").forEach(element => {
      //   console.log(element)
      // });
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

  useEffect(() => {
    setTimeout(() => {
      removeBtnsAndLayoutsFromCreateModal();
      makeRemoveReadOnly();
    }, 300);
  }, []);

  return (
    <div className={`dami`} id="dami">
      <div className="dami-header">
        <div className="dami-snrt-logo">
          <img alt="dami-logo" src="/images/logo.png" className="dami-logo" />
        </div>
        <div className="dami-lb-tp">
          <span className="d-block dami-type-de-processus">
            {demande.option.typeProcessus}
          </span>
          <span className="d-block dami-libelle">
            {demande &&
              demande.option &&
              demande.option.libelle &&
              demande.option.libelle.toLowerCase()}
          </span>
        </div>
        <div className="dami-codification">
          <table className="dami-codification-table ">
            <tr>
              <td>document</td>
              <td>
                <span className="dami-header-codi-item dami-header-document">
                  {demande.option.header.document}
                </span>
              </td>
            </tr>
            <tr>
              <td>classification</td>
              <td>
                <span className="dami-header-codi-item dami-header-classification">
                  {demande.option.header.classification}
                </span>
              </td>
            </tr>
            <tr>
              <td>creation</td>
              <td>
                <span className="dami-header-codi-item dami-header-creation">
                  {new Date(
                    demande.option.header.creation
                  ).toLocaleDateString()}
                </span>
              </td>
            </tr>
            <tr>
              <td>maj</td>
              <td>
                <span className="dami-header-codi-item dami-header-maj">
                  {new Date(demande.option.header.maj).toLocaleDateString()}
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
              <label>Date demande:</label>
            </td>
            <td>
              <input
                className="dami-input "
                value={new Date(demande.dateDemande).toLocaleDateString()}
              />
            </td>
            <td>
              <label>Direction</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande &&
                  demande.demandeur &&
                  demande.demandeur.direction &&
                  capitalizeFirstLetter(demande.demandeur.direction.libelle)
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Nom:</label>
            </td>
            <td>
              <input
                className="dami-input "
                value={capitalizeFirstLetter(demande.demandeur.nom)}
              />
            </td>
            <td>
              <label>Prenom</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={capitalizeFirstLetter(demande.demandeur.prenom)}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Matricule:</label>
            </td>
            <td>
              <input
                className="dami-input "
                value={demande.demandeur.matricule}
              />
            </td>
            <td>
              <label>Service</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande &&
                  demande.demandeur &&
                  demande.demandeur.service &&
                  demande.demandeur.service.libelle &&
                  capitalizeFirstLetter(demande.demandeur.service.libelle)
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Email:</label>
            </td>
            <td>
              <input
                className="dami-input"
                value={demande.demandeur.email.toLowerCase()}
              />
            </td>
            <td>
              <label>Gsm</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={demande.demandeur.gsm}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Departement</label>
            </td>
            <td>
              <input
                className="dami-input w-100"
                value={
                  demande &&
                  demande.demandeur &&
                  demande.demandeur.deparatement &&
                  capitalizeFirstLetter(demande.demandeur.deparatement.libelle)
                }
              />
            </td>
          </tr>
        </table>
      </div>
      <div className="dami-body p-2">
        <div
          ref={cleanDocRef}
          dangerouslySetInnerHTML={{
            __html: demande.contenu,
          }}
        ></div>
      </div>
      {demande.option.signataires && demande.option.signataires.length > 0 && (
        <div className="dami-footer">
          <div className="signataires">
            {demande.option.signataires.map((sig) => (
              <div className="directeur-lib" key={sig}>
                <span>{sigTypes[sig]}</span>
                {sig === "dir" && (
                  <span>{demande.dirLibelle.toLowerCase()}</span>
                )}
              </div>
            ))}
          </div>
          <div className="signataires-ch">
            {demande.option.signataires.map((sig) => (
              <div className="sig-item" key={sig}>
                <div className="">
                  <label>Nom:</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig)
                        ? capitalizeFirstLetter(
                            demande.sig.find((sg) => sg && sg.code === sig).nom
                          )
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && capitalizeFirstLetter(userInfo.nom)
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr.code === String(sig)
                          ) && capitalizeFirstLetter(userInfo.nom)
                    }
                  />
                </div>
                <div className="">
                  <label>Prenom:</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig)
                        ? capitalizeFirstLetter(
                            demande.sig.find((sg) => sg && sg.code === sig)
                              .prenom
                          )
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id)
                          ) &&
                          demande.traitement
                            .find(
                              (tr) =>
                                String(tr.utilisateur) === String(userInfo.id)
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && capitalizeFirstLetter(userInfo.prenom)
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr.code === String(sig)
                          ) && capitalizeFirstLetter(userInfo.prenom)
                    }
                  />
                </div>
                <div
                  className="d-flex align-items-center"
                  style={{ marginTop: "5px" }}
                >
                  <label>Decision:</label>
                  <div className="ml-1">
                    <label>Oui</label>
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
                        )
                        .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && `chk-app-${userInfo.id}`
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code === String(sig)
                          ) && `chk-app-${userInfo.id}`
                    }

                    ${
                      demande.sig.find((sg) => sg && sg.code === sig) &&
                      demande.sig.find((sg) => sg && sg.code === sig).approuve
                        ? "checked"
                        : ""
                    } `}
                    />
                  </div>
                  <div>
                    <label>Non</label>
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
                          )
                          .code.split(".").length > 1
                          ? demande.traitement.find(
                              (tr) =>
                                String(tr.utilisateur) ===
                                  String(userInfo.id) &&
                                tr &&
                                tr.code
                                  .split(".")
                                  .find((cd) => String(cd) === String(sig))
                            ) && `chk-rfs-${userInfo.id}`
                          : demande.traitement.find(
                              (tr) =>
                                String(tr.utilisateur) ===
                                  String(userInfo.id) &&
                                tr &&
                                tr.code === String(sig)
                            ) && `chk-rfs-${userInfo.id}`
                      } ${
                        demande.sig.find((sg) => sg && sg.code === sig) &&
                        demande.sig.find((sg) => sg && sg.code === sig).refuse
                          ? "checked"
                          : ""
                      } `}
                    />
                  </div>
                </div>

                <div className="">
                  <label>Date:</label>
                  <input
                    className="dami-input"
                    value={
                      demande.sig.find((sg) => sg && sg.code === sig) &&
                      demande.sig.find((sg) => sg && sg.code === sig)
                        .dateTraitement
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
                            )
                            .code.split(".").length > 1
                        ? demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code
                                .split(".")
                                .find((cd) => String(cd) === String(sig))
                          ) && new Date().toLocaleDateString()
                        : demande.traitement.find(
                            (tr) =>
                              String(tr.utilisateur) === String(userInfo.id) &&
                              tr &&
                              tr.code === String(sig)
                          ) && new Date().toLocaleDateString()
                    }
                  />
                </div>
                {/* <div className="mt-1">
                  <label>Signature & cachet:</label>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DamiDemande;
