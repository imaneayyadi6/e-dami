import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteOption,
  deleteOptionCrtOp,
  fetchOptionsCrtOp,
  resetDeleteOptionCrtOp,
} from "../../redux/option/optionActions";
import { Card } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast, Dialog } from "../../services";
import { OPTION_CRTOP_LIST_REMOVE } from "../../redux/option/optionTypes";

const OptionListPageCrtOp = () => {
  const [callOnce, setCallOnce] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [active, setActive] = useState(false);
  const optionCrtOpList = useSelector((state) => state.optionCrtOpList);
  const {
    loading: loadingOptionCrtOpList,
    error: errorOptionCrtOpList,
    success: successOptionCrtOpList,
    options,
  } = optionCrtOpList;

  const optionCrtOpDelete = useSelector((state) => state.optionCrtOpDelete);
  const {
    loading: loadingOptionCrtOpDelete,
    error: errorOptionCrtOpDelete,
    success: successOptionCrtOpDelete,
    // option: deletedOption,
  } = optionCrtOpDelete;

  const removeOptionHandler = (id) => {
    const option = options.find((op) => String(op._id) === String(id));
    if (option.notSavedYet) {
      let stoptions = localStorage.getItem("options")
        ? JSON.parse(localStorage.getItem("options"))
        : null;
      if (stoptions) {
        stoptions = stoptions.filter((op) => String(op._id) !== String(id));
        localStorage.setItem("options", JSON.stringify(stoptions));
        dispatch({ type: OPTION_CRTOP_LIST_REMOVE, payload: id });
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
          dispatch(deleteOptionCrtOp(id));
        },
      });
    }
  };

  const updateOptionHandler = (id) => {
    const option = options.find((op) => String(op._id) === String(id));
    if (option.notSavedYet) navigate(`/creer-option/crt-op/${id}`);
    else navigate(`/modifier-option/crt-op/${id}`);
  };

  const showDetailsHandler = (id) => {
    navigate(`/details-option/crt-op/${id}`);
  };

  useEffect(() => {
    if (successOptionCrtOpDelete) {
      dispatch(resetDeleteOptionCrtOp());
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
    }
    if (!callOnce) {
      dispatch(fetchOptionsCrtOp());
      setCallOnce(true);
    }
  }, [callOnce, dispatch, successOptionCrtOpDelete, active]);

  return (
    <>
      {errorOptionCrtOpList && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionCrtOpList}
        </Message>
      )}

      {errorOptionCrtOpDelete && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionCrtOpDelete}
        </Message>
      )}
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-end">
            <Link
              className="btn btn-sm btn-dark mb-2"
              to="/creer-option/crt-op"
            >
              <i className="fas fa-plus"></i> Ajouter une option
            </Link>
          </div>
          {loadingOptionCrtOpList && <TableLoading />}

          {options && options.length > 0 ? (
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

                // {
                //   Header: "proprietaire de donnees",
                //   accessor: "proprietaireDeDonnees.libelle",
                //   filter: "proprietaireDeDonnees.libelle",
                // },
              ]}
              data={options}
              loadingRemove={loadingOptionCrtOpDelete}
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
            successOptionCrtOpList && (
              <WarningMessage message={"Aucune option trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default OptionListPageCrtOp;
