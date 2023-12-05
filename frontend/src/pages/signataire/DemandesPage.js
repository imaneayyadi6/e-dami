import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesToHandle } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card } from "react-bootstrap";
import moment from "moment";
import { getTypeApprobation } from "../../services";
import { useNavigate } from "react-router-dom";

const DemandesPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const demandesToHandle = useSelector(state => state.demandesToHandle);
  const {
    loading: loadingDemandesToHandle,
    error: errorDemandesToHandle,
    success: successDemandesToHandle,
    demandes,
  } = demandesToHandle;

  const showDetailsHandler = (id, idTraitement) => {
    navigate(`/details-demande/${id}/traitement/${idTraitement}`);
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandesToHandle());
      setCallOnce(true);
    }
  }, [callOnce]);

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
          {demandes.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "demandeur",
                  accessor: row =>
                    `${row.demandeur.prenom} ${row.demandeur.nom}`,
                  filter: "demandeur",
                },
                {
                  Header: "date de demande",
                  accessor: row =>
                    `${moment(row.dateDemande).format("YYYY-MM-DD HH:mm")}`,
                  filter: "dateDemande",
                  type: "date",
                },
                {
                  Header: "option",
                  accessor: "option.libelle",
                  filter: "option.libelle",
                },
                {
                  Header: "Type d'approbation",
                  accessor: row =>
                    `${getTypeApprobation(row.traitement[0].code)}`,
                  filter: "code",
                },
                {
                  Header: "status",
                  accessor: "traitement[0].status",
                  filter: "traitement[0].status",
                },
              ]}
              data={demandes}
              dropdownFilters={[
                "option.libelle",
                "code",
                "traitement[0].status",
              ]}
              // showDetailsRow={showDetailsHandler}
              showDetailsRowSpecificData={{
                columns: ["_id", "traitement._id"], 
                function: showDetailsHandler
              }}
            ></Table>
          ) : (
            successDemandesToHandle && (
              <WarningMessage message={"Aucune demande trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesPage;
