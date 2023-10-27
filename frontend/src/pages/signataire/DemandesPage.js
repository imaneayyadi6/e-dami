import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesToHandle } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card } from "react-bootstrap";
import moment from "moment";

const DemandesPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const dispatch = useDispatch();
  const demandesToHandle = useSelector(state => state.demandesToHandle);
  const {
    loading: loadingDemandesToHandle,
    error: errorDemandesToHandle,
    success: successDemandesToHandle,
    demandes,
  } = demandesToHandle;

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
                  Header: "Date de demande",
                  accessor: row =>
                    `${moment(row.dateEnvoi).format("YYYY-MM-DD")}`,
                  filter: "dateEnvoi",
                },
                {
                  Header: "Demandeur",
                  accessor: row =>
                    `${row.demandeur.nom} ${row.demandeur.prenom}`,
                  filter: "demandeur",
                },
                {
                  Header: "Option",
                  accessor: "option.libelle",
                  filter: "option.libelle",
                },
              ]}
              data={demandes}
              dropdownFilters={["option.libelle"]}></Table>
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
