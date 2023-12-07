import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMesDemandes } from '../../redux/demande/demandeActions';
import { Message, TableLoading, WarningMessage, Table } from '../../components';
import { Card } from 'react-bootstrap';
import moment from "moment";
import { useNavigate } from 'react-router-dom';

const MesDemandesPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const mesDemandes = useSelector(state => state.mesDemandes);
  const {
    loading: mesDemandesLoading,
    error: mesDemandesError,
    success: mesDemandesSuccess,
    demandes
  } = mesDemandes;

  const dispatch = useDispatch();

  const navigate = useNavigate();



  useEffect(() => {
    if (!callOnce) {
      dispatch(getMesDemandes());
      setCallOnce(true);
    }

  }, [callOnce])

  return (
    <>
      {mesDemandesError && (
        <Message itWillBeHidden type='danger'>
          {mesDemandesError}
        </Message>
      )}
      <Card className='h-100'>
        <Card.Body>
          {mesDemandesLoading && <TableLoading />}
          {demandes && demandes.length > 0 ? (
            <Table
              columns={[
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
                  filter: "option",
                },
                {
                  Header: "status",
                  accessor: "status",
                  filter: "status",
                },
              ]}
              data={demandes}
              dropdownFilters={[
                "option",
                "status",
              ]}
              showDetailsRow={(id) => {
                navigate(`/details-demande/${id}`)
              }}
            ></Table>
          ) : (
            mesDemandesSuccess && (
              <WarningMessage message={"Aucune demande trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default MesDemandesPage