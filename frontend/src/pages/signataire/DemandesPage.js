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
                  accessor:
                    `demandeur`,
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
                  Header: "date d'envoi",
                  accessor: row =>
                    `${moment(row.dateEnvoi).format("YYYY-MM-DD HH:mm")}`,
                  filter: "dateEnvoi",
                  type: "date",
                },
                {
                  Header: "option",
                  accessor: "option",
                  filter: "option",
                },
                {
                  Header: "Type d'approbation",
                  accessor: row =>
                    `${getTypeApprobation(row.code)}`,
                  filter: "code",
                },
                {
                  Header: "status",
                  accessor: "status",
                  filter: "status",
                },
              ]}
              data={demandes}
              dropdownFilters={[
                "demandeur",
                "option",
                "code",
                "status",
              ]}
              // showDetailsRow={showDetailsHandler}
              showDetailsRowSpecificData={{
                columns: ["idDemande", "idTraitement"],
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
