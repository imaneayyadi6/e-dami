import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMesDemandes } from '../../redux/demande/demandeActions';
import { Message, TableLoading, WarningMessage, Table } from '../../components';
import { Card } from 'react-bootstrap';

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
    console.log("### [use effect from mes demandes] ###")
    if (!callOnce) {
      console.log("### [call once] ###")
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
                  Header: "ID",
                  accessor: "_id",
                  show: false,
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
            />
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