import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDemande, resetCreateDemande } from "../../redux/demande/demandeActions";
import { Toast } from "../../services";
import { Link, useParams } from "react-router-dom";
import { fetchOptionByID } from "../../redux/option/optionActions";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";
import { Button } from "react-bootstrap";


const FaireUneDemandeOption = () => {
    const [callOnce, setCallOnce] = useState(false);
    const { id } = useParams();
    const optionByID = useSelector(state => state.optionByID);
    const { loading: loadingOptionID, error: errorOptionID, option } = optionByID;

    const demandeCreate = useSelector(state => state.demandeCreate);
    const {
        loading: loadingDemandeCreate,
        error: errorDemandeCreate,
        success: successDemandeCreate,
    } = demandeCreate;

    const dispatch = useDispatch();

    const convertTheValueToAttribute = () => {
        const damiBody = document.querySelector(".dami-body div");
        const damiInputs = damiBody.querySelectorAll(".dami-input");
        for (const damiInput of damiInputs)
            damiInput.setAttribute("value", damiInput.value);

        const damiCheckBoxes = damiBody.querySelectorAll(".dami-check-box");
        for (const damiCheckBox of damiCheckBoxes) {
            if (damiCheckBox.checked) {
                damiCheckBox.setAttribute("value", damiCheckBox.checked);
                damiCheckBox.setAttribute("checked", damiCheckBox.checked);
            }
        }
        const damiRadioButtons = damiBody.querySelectorAll(".dami-radio-button");
        for (const damiRadioButton of damiRadioButtons) {
            if (damiRadioButton.checked) {
                damiRadioButton.setAttribute("value", damiRadioButton.checked);
                damiRadioButton.setAttribute("checked", damiRadioButton.checked);
            }
        }
        const damiTextAreaLines = damiBody.querySelectorAll(".dami-textarea-line");
        for (const damiTextAreaLine of damiTextAreaLines)
            damiTextAreaLine.setAttribute("value", damiTextAreaLine.value);
    };

    const resetDamiFormHandler = () => {
        document.querySelectorAll(".dami-body input").forEach(input => {
            input.value = "";
            if (
                String(input.getAttribute("type")) === "checkbox" ||
                String(input.getAttribute("type")) === "radio"
            ) {
                input.checked = false;
            }
        });
    };



    const faireUneDemandeHandler = () => {
        let isEmpty = true;
        const damiBody = document.querySelector(".dami-body div");
        const damiInputs = damiBody.querySelectorAll(".dami-input");

        for (const damiInput of damiInputs) {
            if (damiInput.value !== "") {
                isEmpty = false;
                break;
            }
        }

        const damiCheckBoxes = damiBody.querySelectorAll(".dami-check-box");
        for (const damiCheckBox of damiCheckBoxes) {
            if (damiCheckBox.checked) {
                isEmpty = false;
                break;
            }
        }

        const damiRadioButtons = damiBody.querySelectorAll(".dami-radio-button");
        for (const damiRadioButton of damiRadioButtons) {
            if (damiRadioButton.checked) {
                isEmpty = false;
                break;
            }
        }
        const damiTextAreaLines = damiBody.querySelectorAll(
            ".dami-textarea-line"
        );
        for (const damiTextAreaLine of damiTextAreaLines) {
            if (damiTextAreaLine.value !== "") {
                isEmpty = false;
                break;
            }
        }
        if (!isEmpty) {
            convertTheValueToAttribute();
            const contenu = damiBody.outerHTML;
            dispatch(createDemande(id, contenu));
        } else {
            Toast.open({
                type: "danger",
                message: "il faut remplire le formulaire !",
            });
        }
        window.scrollTo(0, 0);
    };


    useEffect(() => {
        if (!callOnce) {
            dispatch(fetchOptionByID(id));
            setCallOnce(true);
        }

        if (successDemandeCreate) {
            const damiBody = document.querySelector(".dami-body");

            damiBody.querySelectorAll(".dami-input").forEach(el => {
                el.value = "";
            });
            damiBody.querySelectorAll(".dami-check-box").forEach(el => {
                el.checked = false;
            });
            damiBody.querySelectorAll(".dami-radio-button").forEach(el => {
                el.checked = false;
            });
            damiBody.querySelectorAll(".dami-textarea-line").forEach(el => {
                el.value = "";
            });

            Toast.open({
                type: "success",
                message: "La demande a été effectuée avec succès.",
            });

            dispatch(resetCreateDemande());

        }

    }, [successDemandeCreate, dispatch])


    return (
        <>
            <Link to="/faire-une-demande" className="btn btn-light mb-2">
                <i className="fas fa-arrow-left"></i>{" "}
                options
            </Link>
            {errorOptionID && (
                <Message itWillBeHidden type="danger">
                    {errorOptionID}
                </Message>
            )}
            {errorDemandeCreate && (
                <Message itWillBeHidden type="danger">
                    {errorDemandeCreate}
                </Message>
            )}
            {loadingOptionID && (
                <div className="dami-page-container">
                    <DamiLoading />
                </div>
            )}
            {option && (
                <>
                    <div className="dami-page-container">
                        <Dami option={option} />
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                        <Button className="m-1" variant="dark" onClick={faireUneDemandeHandler}>
                            <i className="fa-solid fa-file-import"></i>{" "}
                            envoyer la demande
                        </Button>
                        <Button className="m-1" variant="outline-secondary" onClick={resetDamiFormHandler}>
                            <i className="fa-solid fa-file-circle-xmark"></i>{" "}
                            réinitialiser les formulaire
                        </Button>
                    </div>
                </>

            )}
            {!option && !loadingOptionID && (
                <WarningMessage message={"optiom 'dami' introuvable !"} />
            )}
        </>
    )
}
export default FaireUneDemandeOption;