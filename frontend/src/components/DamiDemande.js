import React, { useEffect, useRef, useState } from "react";

const DamiDemande = ({ demande }) => {
  const cleanDocRef = useRef(null);

  const [sigTypes] = useState({
    cds: "Approbation Chef de Service",
    hiq: "Approbation Directeur Hiearchique",
    pdd: "Approbation Proprietaire de donnees",
    dir: `Approbation Directeur de la direction Infrastructures et système d information`,
    pdg: "Approbation President-directeur generale",
  });

  const removeBtnsAndLayoutsFromCreateModal = () => {
    if (cleanDocRef && cleanDocRef.current) {
      cleanDocRef.current
        .querySelectorAll(".divider .btn-remove-divider-children")
        .forEach(element => {
          element.remove();
        });
      cleanDocRef.current.querySelectorAll(".divider div").forEach(element => {
        element.style.borderRight = "none";
      });
      cleanDocRef.current.querySelectorAll(".btn-add-chk").forEach(element => {
        element.remove();
      });
      cleanDocRef.current
        .querySelectorAll(".btn-remove-chk")
        .forEach(element => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-remove-component")
        .forEach(element => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".btn-remove-checkbox-label-header")
        .forEach(element => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-add-checkbox-label-header")
        .forEach(element => {
          element.remove();
        });

      cleanDocRef.current
        .querySelectorAll(".btn-remove-checkbox-line")
        .forEach(element => {
          element.remove();
        });
      cleanDocRef.current
        .querySelectorAll(".btn-add-checkbox-line")
        .forEach(element => {
          element.remove();
        });

      cleanDocRef.current.querySelectorAll("[readonly]").forEach(element => {
        element.removeAttribute("readonly");
      });
      cleanDocRef.current.querySelectorAll(".disabled").forEach(element => {
        element.setAttribute("disabled", true);
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      removeBtnsAndLayoutsFromCreateModal();
    }, 100);
  }, []);

  return (
    <div className={`dami`} id='dami'>
      <div className='dami-header'>
        <div className='dami-snrt-logo'>
          <img alt='dami-logo' src='/images/logo.png' className='dami-logo' />
        </div>
        <div className='dami-lb-tp'>
          <span className='d-block dami-type-de-processus'>
            {demande.option.typeProcessus}
          </span>
          <span className='d-block dami-libelle'>{demande.option.libelle}</span>
        </div>
        <div className='dami-codification'>
          <table className='dami-codification-table '>
            <tr>
              <td>document</td>
              <td>
                <span className='dami-header-codi-item dami-header-document'>
                  {demande.option.header.document}
                </span>
              </td>
            </tr>
            <tr>
              <td>classification</td>
              <td>
                <span className='dami-header-codi-item dami-header-classification'>
                  {demande.option.header.classification}
                </span>
              </td>
            </tr>
            <tr>
              <td>creation</td>
              <td>
                <span className='dami-header-codi-item dami-header-creation'>
                  {new Date(
                    demande.option.header.creation
                  ).toLocaleDateString()}
                </span>
              </td>
            </tr>
            <tr>
              <td>maj</td>
              <td>
                <span className='dami-header-codi-item dami-header-maj'>
                  {new Date(demande.option.header.maj).toLocaleDateString()}
                </span>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div className='demandeur-section'>
        <table>
          <tr>
            <td>
              <label>Date demande:</label>
            </td>
            <td>
              <input
                className='dami-input '
                value={new Date(demande.dateDemande).toLocaleDateString()}
              />
            </td>
            <td>
              <label>Direction</label>
            </td>
            <td>
              <input
                className='dami-input w-100'
                value={demande.demandeur.direction}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Nom:</label>
            </td>
            <td>
              <input className='dami-input ' value={demande.demandeur.nom} />
            </td>
            <td>
              <label>Prenom</label>
            </td>
            <td>
              <input
                className='dami-input w-100'
                value={demande.demandeur.prenom}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Matricule:</label>
            </td>
            <td>
              <input
                className='dami-input '
                value={demande.demandeur.matricule}
              />
            </td>
            <td>
              <label>Service</label>
            </td>
            <td>
              <input
                className='dami-input w-100'
                value={demande.demandeur.service}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Email:</label>
            </td>
            <td>
              <input className='dami-input' value={demande.demandeur.email} />
            </td>
            <td>
              <label>Gsm</label>
            </td>
            <td>
              <input
                className='dami-input w-100'
                value={demande.demandeur.gsm}
              />
            </td>
          </tr>
        </table>
      </div>
      <div className='dami-body p-2'>
        <div
          ref={cleanDocRef}
          dangerouslySetInnerHTML={{
            __html: demande.contenu,
          }}></div>
      </div>
      {demande.option.signataires && demande.option.signataires.length > 0 && (
        <div className='dami-footer'>
          <div className='signataires'>
            {demande.option.signataires.map(sig => (
              <div className='directeur-lib' key={sig}>
                <span>{sigTypes[sig]}</span>
              </div>
            ))}
          </div>
          <div className='signataires-ch'>
            {demande.option.signataires.map(sig => (
              <div className='sig-item' key={sig}>
                <div className=''>
                  <label>Nom:</label>
                  <input className='dami-input' />
                </div>
                <div className=''>
                  <label>Prenom:</label>
                  <input className='dami-input' />
                </div>
                <div
                  className='d-flex align-items-center'
                  style={{ marginTop: "5px" }}>
                  <label>Decision:</label>
                  <div className='ml-1'>
                    <label>Oui</label>
                    <input className='dami-check-box mr-1' />
                  </div>
                  <div>
                    <label>Non</label>
                    <input className='dami-check-box mr-1' />
                  </div>
                </div>

                <div className=''>
                  <label>Observation:</label>
                  <input className='dami-input w-75' />
                </div>

                <div className=''>
                  <label>Date:</label>
                  <input className='dami-input' />
                </div>
                <div className='mt-1'>
                  <label>Signature & cachet:</label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DamiDemande;
