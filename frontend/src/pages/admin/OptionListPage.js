import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteOption,
  fetchOptions,
  resetDeleteOption,
} from "../../redux/option/optionActions";
import { Card } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast, Dialog } from "../../services";
import { OPTION_LIST_REMOVE } from "../../redux/option/optionTypes";

const OptionsListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [active, setActive] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const optionList = useSelector((state) => state.optionList);
  const {
    loading: loadingOptionList,
    error: errorOptionList,
    success: successOptionList,
    options,
  } = optionList;

  const optionDelete = useSelector((state) => state.optionDelete);
  const {
    loading: loadingOptionDelete,
    error: errorOptionDelete,
    success: successOptionDelete,
  } = optionDelete;

  const removeOptionHandler = (id) => {
    const option = options.find((op) => String(op._id) === String(id));
    if (option.notSavedYet) {
      let stoptions = localStorage.getItem("options")
        ? JSON.parse(localStorage.getItem("options"))
        : null;
      if (stoptions) {
        stoptions = stoptions.filter((op) => String(op._id) !== String(id));
        localStorage.setItem("options", JSON.stringify(stoptions));
        dispatch({
          type: OPTION_LIST_REMOVE,
          payload: id,
        });
      }
    } else {
      let message = "";
      if (!option.isDeleted) {
        message = "Etes vous sûre de vouloir activer cette option ?";
        setActive(true);
      } else {
        message = "Etes vous sûre de vouloir desactiver cette option ?";
        setActive(false);
      }

      Dialog.open({
        title: "Confirmation",
        message: message,
        onYes: () => {
          dispatch(deleteOption(id));
        },
      });
    }
  };

  const updateOptionHandler = (id) => {
    const option = options.find((op) => String(op._id) === String(id));
    if (option.notSavedYet) navigate(`/creer-option/${id}`);
    else navigate(`/modifier-option/${id}`);
  };

  const showDetailsHandler = (id) => {
    navigate(`/details-option/${id}`);
  };

  useEffect(() => {
    if (successOptionDelete) {
      if (active) {
        Toast.open({
          type: "success",
          title: "Activation avec succès",
          message: `l' option a été activer avec succès`,
        });
      } else {
        Toast.open({
          type: "success",
          title: "Desactivation avec succès",
          message: `l' option a été deactiver avec succès`,
        });
      }

      dispatch(resetDeleteOption());
    }
    if (!callOnce) {
      dispatch(fetchOptions());
      setCallOnce(true);
    }
  }, [callOnce, dispatch, successOptionDelete, active]);

  return (
    <>
      {errorOptionList && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionList}
        </Message>
      )}

      {errorOptionDelete && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionDelete}
        </Message>
      )}
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-end">
            <Link className="btn btn-sm btn-dark mb-2" to="/creer-option">
              <i className="fas fa-plus"></i> Ajouter une option
            </Link>
          </div>
          {loadingOptionList && <TableLoading />}

          {options.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: "libelle",
                  accessor: "libelle",
                  filter: "libelle",
                },
                {
                  Header: "Type de processus",
                  accessor: "typeProcessus",
                  filter: "typeProcessus",
                },
                {
                  Header: "sous-categorie",
                  accessor: "sousCategorie.libelle",
                  filter: "sousCategorie.libelle",
                },

                {
                  Header: "service",
                  accessor: "service.libelle",
                  filter: "service.libelle",
                },

                {
                  Header: "proprietaire de donnees",
                  accessor: "proprietaireDeDonnees.libelle",
                  filter: "proprietaireDeDonnees.libelle",
                },
              ]}
              data={options}
              loadingRemove={loadingOptionDelete}
              showDetailsRow={showDetailsHandler}
              updateRow={updateOptionHandler}
              removeRow={removeOptionHandler}
              dropdownFilters={[
                "sousCategorie.libelle",
                "service.libelle",
                "proprietaireDeDonnees.libelle",
              ]}
            />
          ) : (
            successOptionList && (
              <WarningMessage message={"Aucune option trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default OptionsListPage;
