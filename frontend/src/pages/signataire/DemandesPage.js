import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesFilterToHandle, getDemandesToHandle, resetGetDemandesToHandle } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Button, Card, Form } from "react-bootstrap";
import moment from "moment";
import { getTypeApprobation } from "../../services";
import { Link, useNavigate } from "react-router-dom";

const DemandesPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const demandesToHandle = useSelector(state => state.demandesToHandle);
  const {
    loading: loadingDemandesToHandle,
    error: errorDemandesToHandle,
    success: successDemandesToHandle,
    data,
  } = demandesToHandle;

  const demandeToHandleFilter = useSelector(state => state.demandeToHandleFilter);
  const {
    loading: loadingDemandesToHandleFilter,
    error: errorDemandesToHandleFilter,
    success: successDemandesToHandleFilter,
    data: dataFilter,
  } = demandeToHandleFilter;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(getDemandesToHandle({ page: newPage }));
  };

  const renderPageLinks = () => {

    const links = [];

    const range = 20;
    const start = Math.max(1, currentPage - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range);

    links.push(
      <button key="first" className="btn btn-sm btn-light" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
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
          className={`${i === currentPage ? 'active' : ''} btn btn-sm btn-light`}
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


  };


  useEffect(() => {
    if (!callOnce) {
      dispatch(resetGetDemandesToHandle())
      dispatch(getDemandesToHandle());
      dispatch(getDemandesFilterToHandle())
      setCallOnce(true);
    }
    if (successDemandesToHandle) {
      setTotalPages(data.totalPages);
    }
  }, [callOnce, successDemandesToHandle]);

  return (
    <>
      {errorDemandesToHandle && (
        <Message itWillBeHidden type='danger'>
          {errorDemandesToHandle}
        </Message>
      )}
      <Card className='h-100'>
        <Card.Body>
          {loadingDemandesToHandle && <TableLoading />}

          {successDemandesToHandleFilter && data && data.traitements.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>demandeur</small>
                        <div className="d-flex">
                          <Form.Select disabled={loadingDemandesToHandleFilter} size="sm">
                            {dataFilter.demandeurs.map(demandeur => (
                              <option key={demandeur._id}>{demandeur.prenom.toLowerCase() + " " + demandeur.nom.toLowerCase()}</option>
                            ))}
                          </Form.Select>
                          <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>date demande</small>
                        <div className="d-flex">
                          <Form.Control size="sm" type="date" /> <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>date envoi</small>
                        <div className="d-flex">
                          <Form.Control size="sm" type="date" />
                          <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>option</small>
                        <div className="d-flex">
                          <Form.Select disabled={loadingDemandesToHandleFilter} size="sm">
                            {dataFilter.options.map(option => (
                              <option key={option._id}>{option.libelle.toLowerCase()}</option>
                            ))}
                          </Form.Select>
                          <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>type d'approbation</small>
                        <div className="d-flex">
                          <Form.Select disabled={loadingDemandesToHandleFilter} size="sm">
                            {dataFilter.typeApp.map(typeA => (
                              <option key={typeA}>{getTypeApprobation(typeA)}</option>
                            ))}
                          </Form.Select>
                          <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>status</small>
                        <div className="d-flex">
                          <Form.Select size="sm">
                            <option value={"en cours"}>en cours</option>
                            <option value={"approuve"}>approuve</option>
                            <option value={"refuse"}>refuse</option>
                          </Form.Select>
                          <Button size="sm">
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className='d-flex flex-column justify-content-center inline-text'>
                        <small>details</small>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>

                  {data.traitements.map(traitement => (
                    <tr>
                      <td><small className="inline-text">{traitement.demandeur}</small></td>
                      <td><small className="inline-text">{moment(traitement.dateDemande).format('DD-MM-YYYY, h:mm')}</small></td>
                      <td><small className="inline-text">{moment(traitement.dateEnvoi).format('DD-MM-YYYY, h:mm')}</small></td>
                      <td><small className="inline-text">{String(traitement.option).toLowerCase()}</small></td>
                      <td><small className="inline-text">{getTypeApprobation(traitement.code)}</small></td>
                      <td><small className={`inline-text  table-text-status-${String(traitement.status).replace(/\s/g, "")}`}>{traitement.status}</small></td>
                      <td>
                        <Link to={`/details-demande/${traitement.idDemande}/traitement/${traitement.idTraitement}`}>
                          <small>traiter</small>
                        </Link>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>

              <div className="d-flex justify-content-center">
                {renderPageLinks()}
              </div>
            </div>

          ) : (
            successDemandesToHandle && (
              <div className="d-flex justify-content-center">
                <WarningMessage message={"Aucune demande trouvée"} />
              </div>
            )
          )}

        </Card.Body>
      </Card >
    </>
  );
};

export default DemandesPage;
