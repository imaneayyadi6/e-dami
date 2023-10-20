import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/categorie/categorieActions";
import {
  fetchSousCategoriesByCategorieID,
  resetFetchSousCategoriesByCategorieID,
} from "../../redux/sousCategorie/sousCategorieActions";
import {
  fetchOptionByID,
  fetchOptionsBySousCategorieID,
  resetFetchOptionByID,
} from "../../redux/option/optionActions";

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Dami, DamiLoading, Message, WarningMessage } from "../../components";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FaireUneDemande = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const disptach = useDispatch();

  const categorieList = useSelector((state) => state.categorieList);
  const {
    loading: loadingCategorieList,
    error: errorCategorieList,
    categories,
  } = categorieList;

  const souscategorieListByCategorieID = useSelector(
    (state) => state.souscategorieListByCategorieID
  );

  const {
    loading: loadingSouscategorieListByCategorieID,
    error: errorSouscategorieListByCategorieID,
    souscategories,
  } = souscategorieListByCategorieID;

  const optionListBySousCategorieID = useSelector(
    (state) => state.optionListBySousCategorieID
  );
  const {
    loading: loadingOptionListBySousCategorieID,
    error: errorOptionListBySousCategorieID,
    options,
  } = optionListBySousCategorieID;

  const optionByID = useSelector((state) => state.optionByID);
  const { loading: loadingOptionID, error: errorOptionID, option } = optionByID;

  const getSousCategoriesChangeHandler = (event) => {
    setSelectedOption(null);
    disptach(fetchSousCategoriesByCategorieID(event.target.value));
    disptach(resetFetchSousCategoriesByCategorieID());
    disptach(resetFetchOptionByID());
  };

  const getOptionsChangeHandler = (event) => {
    setSelectedOption(null);
    disptach(fetchOptionsBySousCategorieID(event.target.value));
    disptach(resetFetchOptionByID());
  };

  const getOptionHandler = (event) => {
    setSelectedOption(event.target.value);
    disptach(fetchOptionByID(event.target.value));
  };

  // const handleConvertToPDF = async () => {
  //   const content = document.getElementById("dami");
  //   content.querySelector(".dami-body").style.minHeight = "780px";
  //   // Use html2canvas to capture the content as an image
  //   const canvas = await html2canvas(content, { scale: 2 });

  //   // Initialize jsPDF with the desired page size and orientation
  //   const pdf = new jsPDF("p", "mm", "a4");

  //   // Calculate the dimensions of the image to fit on the PDF page
  //   const imgWidth = 210; // A4 page width in mm
  //   const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //   // Add the captured image to the PDF
  //   pdf.addImage(
  //     canvas.toDataURL("image/png"),
  //     "PNG",
  //     0,
  //     0,
  //     imgWidth,
  //     imgHeight
  //   );

  //   // Save the PDF with the specified filename
  //   pdf.save(`${option ? option.libelle : "e-dami"}.pdf`);
  //   content.querySelector(".dami-body").style.minHeight = "500px";
  // };

  useEffect(() => {
    if (!callOnce) {
      disptach(fetchCategories());
      setCallOnce(true);
    }
  }, [callOnce, disptach]);

  return (
    <>
      {errorCategorieList && (
        <Message type="danger" itWillBeHidden={true}>
          {errorCategorieList}
        </Message>
      )}
      {errorSouscategorieListByCategorieID && (
        <Message type="danger" itWillBeHidden={true}>
          {errorSouscategorieListByCategorieID}
        </Message>
      )}
      {errorOptionListBySousCategorieID && (
        <Message type="danger" itWillBeHidden={true}>
          {errorOptionListBySousCategorieID}
        </Message>
      )}
      {errorOptionID && (
        <Message type="danger" itWillBeHidden={true}>
          {errorOptionID}
        </Message>
      )}
      {/* <div className="d-flex justify-content-end mb-3">
        <Button variant="dark" size="sm" onClick={handleConvertToPDF}>
          <i className="fa-solid fa-file-import"></i> voire le pdf
        </Button>
      </div> */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <Form.Select
              className="m-1"
              disabled={loadingCategorieList}
              onChange={getSousCategoriesChangeHandler}
            >
              <option value={""}>
                ----- veuillez selectionne une categorie -----
              </option>
              {categories.length > 0 &&
                categories.map((categorie) => (
                  <option value={categorie._id} key={categorie._id}>
                    {categorie.libelle}
                  </option>
                ))}
            </Form.Select>
            <Form.Select
              className="m-1"
              onChange={getOptionsChangeHandler}
              disabled={
                loadingSouscategorieListByCategorieID ||
                souscategories.length === 0
              }
            >
              <option value={""}>
                ----- veuillez selectionne une sous-categorie -----
              </option>
              {souscategories.length > 0 &&
                souscategories.map((sousCategorie) => (
                  <option value={sousCategorie._id} key={sousCategorie._id}>
                    {sousCategorie.libelle}
                  </option>
                ))}
            </Form.Select>
            <Form.Select
              className="m-1"
              disabled={
                loadingSouscategorieListByCategorieID ||
                souscategories.length === 0 ||
                loadingOptionListBySousCategorieID ||
                options.length === 0
              }
              onChange={getOptionHandler}
            >
              <option value={""}>
                ----- veuillez selectionne une option -----
              </option>
              {options.length > 0 &&
                options.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.libelle}
                  </option>
                ))}
            </Form.Select>
          </div>
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Body>
          {selectedOption ? (
            <Row className=" ">
              <Col xl={12} lg={12} md={12} sm={12}>
                {loadingOptionID && <DamiLoading />}
                {option ? (
                  <>
                    <Dami option={option} />
                    <Button className="w-100 mt-2" variant="dark">
                      Demander
                    </Button>
                  </>
                ) : (
                  !loadingOptionID && (
                    <WarningMessage message={"aucune option trouvee"} />
                  )
                )}
              </Col>
            </Row>
          ) : (
            <div className="mt-5">
              <WarningMessage message={"aucune option selectionne"} />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default FaireUneDemande;
