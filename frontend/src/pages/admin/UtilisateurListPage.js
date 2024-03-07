import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeUser,
  fetchUsers,
  resetRemoveUser,
} from "../../redux/user/userActions";
import { Card } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast, Dialog } from "../../services";

const UtilisateurListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userList = useSelector((state) => state.userList);
  const {
    loading: loadingUserList,
    error: errorUserList,
    success: successUserList,
    users,
  } = userList;

  const userRemove = useSelector((state) => state.userRemove);
  const {
    loading: loadingUserRemove,
    error: errorUserRemove,
    success: successUserRemove,
  } = userRemove;

  const showDetailsUserHandler = (id) => {
    navigate(`/details-utilisateur/${id}`);
  };

  // const removeUserHandler = id => {
  //   Dialog.open({
  //     title: "Confirmation",
  //     message: "Etes vous sûre de vouloir supprimer ce utilisateur ?",
  //     onYes: () => {
  //       dispatch(removeUser(id));
  //     },
  //   });
  // };

  const updateUserHandler = (id) => {
    navigate(`/modifier-utilisateur/${id}`);
  };

  useEffect(() => {
    if (successUserRemove) {
      dispatch(resetRemoveUser());
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `l'utilisateur a été supprimée avec succès`,
      });
    }
    if (!callOnce) {
      dispatch(fetchUsers());
      setCallOnce(true);
    }
  }, [callOnce, dispatch, successUserRemove]);

  return (
    <>
      {errorUserList && (
        <Message itWillBeHidden={true} type="danger">
          {errorUserList}
        </Message>
      )}

      {errorUserRemove && (
        <Message itWillBeHidden={true} type="danger">
          {errorUserRemove}
        </Message>
      )}
      <Card className="w-100" style={{ overflow: "auto" }}>
        <Card.Body>
          {/* <div className="d-flex justify-content-end">
            <Link className="btn btn-sm btn-dark mb-2" to="/creer-utilisateur">
              <i className="fas fa-plus"></i> Ajouter un utilisateur
            </Link>
          </div> */}
          {loadingUserList && <TableLoading />}

          {users.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: "Matricule",
                  accessor: "matricule",
                  filter: "matricule",
                },
                {
                  Header: "Nom & prenom",
                  accessor: (row) => `${row.nom} ${row.prenom}`,
                  filter: "nom",
                },
                {
                  Header: "Email",
                  accessor: "email",
                  filter: "email",
                },

                {
                  Header: "Fonction",
                  accessor: "fonction",
                  filter: "fonction",
                },
                {
                  Header: "direction",
                  accessor: "direction.libelle",
                  filter: "direction.libelle",
                },
                {
                  Header: "service",
                  accessor: "service.libelle",
                  filter: "service.libelle",
                },
              ]}
              data={users}
              loadingRemove={loadingUserRemove}
              showDetailsRow={showDetailsUserHandler}
              updateRow={updateUserHandler}
              dropdownFilters={["service.libelle", "direction.libelle"]}
            />
          ) : (
            successUserList && (
              <WarningMessage message={"Aucune utilisateur trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default UtilisateurListPage;
