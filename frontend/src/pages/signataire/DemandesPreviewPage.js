import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeam } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DemandesPreviewPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const dispatch = useDispatch();
  const demandePreviewTeam = useSelector((state) => state.demandePreviewTeam);
  const {
    loading: demandePreviewTeamLoading,
    error: demandePreviewTeamError,
    success: demandePreviewTeamSuccess,
    demandes,
  } = demandePreviewTeam;
  const navigate = useNavigate();
  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandesPreviewTeam());
    }
  }, [callOnce]);

  return (
    <>
      {demandePreviewTeamError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamError}
        </Message>
      )}
      <Card className="h-100">
        <Card.Body>
          {demandePreviewTeamLoading && <TableLoading />}
          {demandes && demandes.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: "demandeur",
                  accessor: (row) =>
                    `${row.demandeur.nom} ${row.demandeur.prenom}`,
                  filter: "demandeur",
                },
                {
                  Header: "Fonction",
                  accessor: (row) => `${row.demandeur.fonction} `,
                  filter: "fonction",
                },

                {
                  Header: "option",
                  accessor: "option.libelle",
                  filter: "option",
                },
                {
                  Header: "status",
                  accessor: "status",
                  filter: "status",
                },
              ]}
              data={demandes}
              dropdownFilters={["option", "status"]}
              showDetailsRow={(id) => {
                navigate(`/demandes/apercu/details/${id}`);
              }}
            />
          ) : (
            demandePreviewTeamSuccess && (
              <WarningMessage message={"Aucune demande trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesPreviewPage;
