import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDemandesFilterToHandle,
  getDemandesToHandle,
  resetGetDemandesToHandle,
} from "../../redux/demande/demandeActions";
import { Message, TableLoading, WarningMessage } from "../../components";
import { Button, Card, Form } from "react-bootstrap";
import moment from "moment";
import { getTypeApprobation } from "../../services";
import { Link } from "react-router-dom";

const DemandesPage = () => {
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
            className={`${
              i === currentPage ? "active" : ""
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
      <Card className="h-100">
        <Card.Body>
          {loadingDemandesToHandle && <TableLoading />}

          <>
            {!loadingDemandesToHandle && successDemandesToHandleFilter && (
              <>
                <Button variant="dark" onClick={filterHnadler}>
                  <i className="fa-solid fa-filter"></i> filtrer
                </Button>
                <Button variant="light" onClick={resetFilterHandler}>
                  <i className="fa-solid fa-filter-circle-xmark"></i> annuler le
                  filter
                </Button>
              </>
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
                        <tr>
                          <td>
                            <small className="inline-text">
                              {traitement.demandeur}
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
                              {String(traitement.option).toLowerCase()}
                            </small>
                          </td>
                          <td>
                            <small className="inline-text">
                              {getTypeApprobation(traitement.code)}
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
