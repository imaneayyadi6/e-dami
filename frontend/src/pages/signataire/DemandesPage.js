import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDemandesFilterToHandle,
  getDemandesToHandle,
  resetGetDemandesToHandle,
} from "../../redux/demande/demandeActions";
import { generateExcel } from "../../redux/generate/generateActions";
import { Message, TableLoading, WarningMessage } from "../../components";
import { Button, Card, Form, OverlayTrigger, Popover } from "react-bootstrap";
import moment from "moment";
import { getTypeApprobation } from "../../services";
import { Link, useNavigate } from "react-router-dom";

const DemandesPage = () => {
  const navigate = useNavigate();
  const [callOnce, setCallOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNextPages, setIsNextPages] = useState(false);

  const [option, setOption] = useState(null);
  const [demandeur, setDemandeur] = useState(null);
  const [typeApp, setTypeApp] = useState(null);
  const [status, setStatus] = useState(null);
  const [dateEnvoi, setDateEnvoi] = useState(null);
  const [dateDemande, setDateDemande] = useState(null);

  const filterHnadler = (page) => {
    setIsNextPages(false);
    let query = { page: page || 1 };
    if (option !== null) query.option = option;
    if (demandeur !== null) query.demandeur = demandeur;
    if (typeApp !== null) query.typeApp = typeApp;
    if (status !== null) query.status = status;
    if (dateEnvoi !== null) query.dateEnvoi = dateEnvoi;
    if (dateDemande !== null) query.dateDemande = dateDemande;

    dispatch(getDemandesToHandle(query));
  };

  const dispatch = useDispatch();
  const demandesToHandle = useSelector((state) => state.demandesToHandle);
  const {
    loading: loadingDemandesToHandle,
    error: errorDemandesToHandle,
    success: successDemandesToHandle,
    data,
  } = demandesToHandle;

    const userLogin = useSelector((state) => state.userLogin);
  const {
    userInfo
  } = userLogin;  

  const excelGenerate = useSelector((state) => state.excelGenerate);
  const {
    loading: loadingExcelGenerate,
    error: errorExcelGenerate,
    success: successExcelGenerate,
  } = excelGenerate;

  const demandeToHandleFilter = useSelector(
    (state) => state.demandeToHandleFilter
  );
  const {
    loading: loadingDemandesToHandleFilter,
    error: errorDemandesToHandleFilter,
    success: successDemandesToHandleFilter,
    data: dataFilter,
  } = demandeToHandleFilter;

  const handlePageChange = (newPage) => {
    console.log(newPage);

    setCurrentPage(newPage);
    filterHnadler(newPage);
    setIsNextPages(true);
  };

  const renderPageLinks = () => {
    const links = [];

    if (totalPages > 1) {
      const range = 20;
      const start = Math.max(1, currentPage - Math.floor(range / 2));
      const end = Math.min(totalPages, start + range);

      links.push(
        <button
          key="first"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;&laquo;
        </button>,
        <button
          key="previous"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
      );

      for (let i = start; i <= end; i++) {
        links.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${i === currentPage ? "active" : ""
              } btn btn-sm btn-light`}
          >
            {i}
          </button>
        );
      }

      links.push(
        <button
          key="next"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>,
        <button
          key="last"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;&raquo;
        </button>
      );

      return links;
    } else {
      links.push(
        <button className={`btn btn-sm btn-light active ml-1`}>1</button>
      );
      return links;
    }
  };

  const resetFilterHandler = () => {
    setOption(null);
    setDemandeur(null);
    setTypeApp(null);
    setStatus(null);
    setDateEnvoi(null);
    setDateDemande(null);
    dispatch(getDemandesToHandle());
  };

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Fonction pour obtenir le type de signature
  const getSignatureType = (traitement) => {
    const getSignatureTypeForCode = (code) => {
      switch (code) {
        case 'cds':
          return "chef de service";
        case 'cdd':
          return "chef de département";
        case 'hiq':
          return "directeur hiérarchique";
        case 'pdd':
          return "propriétaire de données";
        case 'atr':
          // Vérifier si option est un objet ou une string
          if (typeof traitement.option === 'object' && traitement.option !== null) {
            return (traitement.option.autreResponsableTitre || "titre non défini").toLowerCase();
          } else {
            return "titre non défini (option non trouvée)";
          }
        case 'dir':
          return "directeur de l'entité";
        default:
          return "type de signature non défini";
      }
    };

    // Vérifier si le code contient des points (codes multiples)
    if (traitement.code.includes('.')) {
      const codes = traitement.code.split('.');
      const signatureTypes = codes.map(code => getSignatureTypeForCode(code));
      return `en tant que ${signatureTypes.join(' et ')}`;
    } else {
      // Code simple
      return `en tant que ${getSignatureTypeForCode(traitement.code)}`;
    }
  };
  
  const excelHandler = () => {
    // Collect current filter parameters
    let filters = {};
    if (option !== null) filters.option = option;
    if (demandeur !== null) filters.demandeur = demandeur;
    if (typeApp !== null) filters.typeApp = typeApp;
    if (status !== null) filters.status = status;
    if (dateEnvoi !== null) filters.dateEnvoi = dateEnvoi;
    if (dateDemande !== null) filters.dateDemande = dateDemande;

    // Dispatch the Excel generation action with filters
    dispatch(generateExcel(filters));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(resetGetDemandesToHandle());
      dispatch(getDemandesToHandle());
      dispatch(getDemandesFilterToHandle());
      setCallOnce(true);
    }

    if (successDemandesToHandle) {
      setTotalPages(data.totalPages);
      if (isNextPages) {
        window.scrollTo(1000000, 100000);
      }
    }
  }, [callOnce, successDemandesToHandle, isNextPages]);

  return (
    <>
      {errorDemandesToHandle && (
        <Message itWillBeHidden type="danger">
          {errorDemandesToHandle}
        </Message>
      )}
      {errorDemandesToHandleFilter && (
        <Message itWillBeHidden type="danger">
          {errorDemandesToHandleFilter}
        </Message>
      )}
      {errorExcelGenerate && (
        <Message itWillBeHidden type="danger">
          {errorExcelGenerate}
        </Message>
      )}
      {successExcelGenerate && (
        <Message itWillBeHidden type="success">
          Excel généré et téléchargé avec succès !
        </Message>
      )}
      <Card className="h-100">
        <Card.Body>
          {loadingDemandesToHandle && <TableLoading />}

          <>
            {!loadingDemandesToHandle && successDemandesToHandleFilter && (
              <div className="d-flex justify-content-between">
                <div>
                  <Button variant="dark" onClick={filterHnadler}>
                    <i className="fa-solid fa-filter"></i> filtrer
                  </Button>
                  <Button variant="light" onClick={resetFilterHandler}>
                    <i className="fa-solid fa-filter-circle-xmark"></i> annuler le
                    filter
                  </Button>
                </div>
                {userInfo && userInfo.service && userInfo.service.libelle && (String(userInfo.service.libelle).toUpperCase() === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || String(userInfo.service.libelle).toUpperCase() === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT") && (
                  <div>
                    <Button 
                      variant="success" 
                      onClick={excelHandler}
                      disabled={loadingExcelGenerate}
                    >
                      {loadingExcelGenerate ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Génération...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-file-excel"></i> extraction excel
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <hr />
            <div className="table-responsive">
              <table className="table table-sm">
                {successDemandesToHandleFilter && (
                  <thead>
                    <tr>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>demandeur</small>
                          <div className="d-flex">
                            <Form.Select
                              value={demandeur}
                              onChange={(e) => setDemandeur(e.target.value)}
                              disabled={loadingDemandesToHandleFilter}
                              size="sm"
                            >
                              <option value={""}>
                                ----veuillez selectionner un demandeur ----
                              </option>
                              {dataFilter &&
                                dataFilter.demandeurs.length > 0 &&
                                dataFilter.demandeurs.map((demandeur) => (
                                  <option
                                    key={demandeur._id}
                                    value={demandeur._id}
                                  >
                                    {demandeur.prenom.toLowerCase() +
                                      " " +
                                      demandeur.nom.toLowerCase()}
                                  </option>
                                ))}
                            </Form.Select>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>date demande</small>
                          <div className="d-flex">
                            <Form.Control
                              value={dateDemande}
                              onChange={(e) => setDateDemande(e.target.value)}
                              size="sm"
                              type="date"
                            />
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>date envoi</small>
                          <div className="d-flex">
                            <Form.Control
                              value={dateEnvoi}
                              onChange={(e) => setDateEnvoi(e.target.value)}
                              size="sm"
                              type="date"
                            />
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>option</small>
                          <div className="d-flex">
                            <Form.Select
                              value={option}
                              onChange={(e) => setOption(e.target.value)}
                              disabled={loadingDemandesToHandleFilter}
                              size="sm"
                            >
                              <option value={""}>
                                ----veuillez selectionner une option ----
                              </option>

                              {dataFilter.options.map((option) => (
                                <option key={option._id} value={option._id}>
                                  {option.libelle.toLowerCase()}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </div>
                      </th>

                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>status</small>
                          <div className="d-flex">
                            <Form.Select
                              size="sm"
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                            >
                              <option value={""}>
                                ----veuillez selectionner un type un status ----
                              </option>

                              <option value={"en cours"}>en cours</option>
                              <option value={"approuve"}>approuve</option>
                              <option value={"refuse"}>refuse</option>
                            </Form.Select>
                          </div>
                        </div>
                      </th>
                      <th style={{ width: "200px" }}>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>type de signature</small>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex flex-column justify-content-center inline-text">
                          <small>traiter</small>
                        </div>
                      </th>
                    </tr>
                  </thead>
                )}

                <tbody>
                  {successDemandesToHandleFilter &&
                    data &&
                    data.traitements.length > 0
                    ? data.traitements.map((traitement) => (
                      <tr 
                        key={traitement.idTraitement}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/details-demande/${traitement.idDemande}/traitement/${traitement.idTraitement}`)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                      >
                        <td>
                          <small className="inline-text">
                            {String(traitement.demandeur).toLowerCase()}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {moment(traitement.dateDemande).format(
                              "DD-MM-YYYY, h:mm"
                            )}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {moment(traitement.dateEnvoi).format(
                              "DD-MM-YYYY, h:mm"
                            )}
                          </small>
                        </td>
                        <td>
                          <small className="inline-text">
                            {String(traitement.option?.libelle || traitement.option).toLowerCase()}
                          </small>
                        </td>

                        <td>
                          <small
                            className={`table-text-status-${String(
                              traitement.status
                            ).replace(/\s/g, "")}`}
                          >
                            {traitement.status}
                          </small>
                        </td>
                        <td>
                          {(() => {
                            const signatureType = getSignatureType(traitement);
                            const truncatedText = truncateText(signatureType, 40);
                            
                            return (
                              <OverlayTrigger
                                trigger="hover"
                                placement="top"
                                overlay={
                                  <Popover 
                                    id={`popover-${traitement.idTraitement}`}
                                    style={{ backgroundColor: 'black', color: 'white' }}
                                  >
                                    <Popover.Body style={{ backgroundColor: 'black', color: 'white' }}>
                                      {signatureType}
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <small className="inline-text" style={{ fontSize: "14px" }}>
                                  {truncatedText}
                                </small>
                              </OverlayTrigger>
                            );
                          })()}
                        </td>
                        <td>
                          <Link
                            className="btn btn-sm btn-light"
                            to={`/details-demande/${traitement.idDemande}/traitement/${traitement.idTraitement}`}
                          >
                            traiter
                          </Link>
                        </td>
                      </tr>
                    ))
                    : successDemandesToHandle && (
                      <tr>
                        <td colSpan={1000}>
                          <div className="d-flex justify-content-center py-5">
                            <WarningMessage
                              message={"Aucune demande trouvée"}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
              {successDemandesToHandleFilter && data && (
                <div className="d-flex justify-content-center align-items-center">
                  <small>
                    Page{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {currentPage} de {totalPages}
                    </span>
                  </small>
                  {renderPageLinks()}
                </div>
              )}
            </div>
          </>
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesPage;
