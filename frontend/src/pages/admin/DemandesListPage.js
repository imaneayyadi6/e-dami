import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeamAll } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RTable from "../../components/RTable";

const DemandesListPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const dispatch = useDispatch();
  const demandePreviewTeamAdmin = useSelector(
    (state) => state.demandePreviewTeamAdmin
  );

  const {
    loading: demandePreviewTeamAdminLoading,
    error: demandePreviewTeamAdminError,
    success: demandePreviewTeamAdminSuccess,
    demandes,
  } = demandePreviewTeamAdmin;
  const navigate = useNavigate();

  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandesPreviewTeamAll());
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <>
      {demandePreviewTeamAdminError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamAdminError}
        </Message>
      )}

      <Card>
        <Card.Body>
          {demandePreviewTeamAdminLoading && <TableLoading />}
          {demandes && demandes.length > 0 && (
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
              showDetailsLink={`/demandes/apercu/details`}
              // showDetailsRow={(id) => {
              //   navigate(`/demandes/apercu/details/${id}`);
              // }}
            />
          )}
          {demandePreviewTeamAdminSuccess &&
            !demandePreviewTeamAdminLoading &&
            demandes.lenght === 0 && (
              <WarningMessage message={"Aucune demande trouvée"} />
            )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesListPage;
