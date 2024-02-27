import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/categorie/categorieActions";
import {
  fetchSousCategoriesByCategorieID,
  resetFetchSousCategoriesByCategorieID,
} from "../../redux/sousCategorie/sousCategorieActions";
import { fetchOptionsBySousCategorieID } from "../../redux/option/optionActions";

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { DamiLoading, Message, Option } from "../../components";

import { Toast } from "../../services";

const FaireUneDemande = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sousCategorie, setSousCategorie] = useState(null);
  const [categorie, setCategorie] = useState(null);

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
    success: successOptionListBySousCategorieID,
    data,
  } = optionListBySousCategorieID;

  const getSousCategoriesChangeHandler = (event) => {
    if (event.target.value === "") {
      disptach(resetFetchSousCategoriesByCategorieID());
      getOptionsFilterHandler();
    } else {
      setCategorie(event.target.value);
      disptach(fetchSousCategoriesByCategorieID(event.target.value));
    }
  };

  const getSousCategorieHandler = (event) => {
    setSousCategorie(event.target.value);
  };

  const getOptionsFilterHandler = (page = 1) => {
    let query = { page: page || 1 };
    if (sousCategorie) query.sousCategorie = sousCategorie;
    disptach(fetchOptionsBySousCategorieID(query));
  };

  const getOptionsHandler = (event) => {
    if (sousCategorie) getOptionsFilterHandler();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getOptionsFilterHandler(newPage);
  };

  const renderPageLinks = () => {
    const links = [];

    if (totalPages > 1) {
      const range = 20;
      const start = Math.max(1, currentPage - Math.floor(range / 2));
      const end = Math.min(totalPages, start + range);

      links.push(
        <button
          key="first"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;&laquo;
        </button>,
        <button
          key="previous"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
      );

      for (let i = start; i <= end; i++) {
        links.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${
              i === currentPage ? "active" : ""
            } btn btn-sm btn-light`}
          >
            {i}
          </button>
        );
      }

      links.push(
        <button
          key="next"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>,
        <button
          key="last"
          className="btn btn-sm btn-light"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;&raquo;
        </button>
      );

      return links;
    } else {
      links.push(
        <button className={`btn btn-sm btn-light active ml-1`}>1</button>
      );
      return links;
    }
  };

  useEffect(() => {
    if (!callOnce) {
      disptach(fetchCategories());
      getOptionsFilterHandler();
      setCallOnce(true);
    }
    if (successOptionListBySousCategorieID) setTotalPages(data.totalPages);
  }, [callOnce, disptach, successOptionListBySousCategorieID]);

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

      <Card>
        <Card.Body>
          <div className="d-flex align-items-center">
            <div className="w-100 m-1">
              <label>categorie</label>
              <Form.Select
                disabled={loadingCategorieList}
                value={categorie}
                onChange={getSousCategoriesChangeHandler}
              >
                <option value={""}>
                  ----- veuillez selectionne une categorie -----
                </option>
                {categories.length > 0 &&
                  categories.map((categorie) => (
                    <option value={categorie._id} key={categorie._id}>
                      {String(categorie.libelle).toLowerCase()}
                    </option>
                  ))}
              </Form.Select>
            </div>

            <div className="w-100 m-1">
              <label>sous-categorie</label>
              <Form.Select
                value={sousCategorie}
                onChange={getSousCategorieHandler}
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
                      {String(sousCategorie.libelle).toLowerCase()}
                    </option>
                  ))}
              </Form.Select>
            </div>

            <Button onClick={getOptionsHandler} variant="dark" className="mt-4">
              <i className="fas fa-search"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="mt-5">
        {loadingOptionListBySousCategorieID && (
          <>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <DamiLoading mini />
            </Col>
          </>
        )}
        {data &&
          data.options.length > 0 &&
          data.options.map((option) => (
            <Col xl={4} lg={6} md={6} sm={12} className="mb-3">
              <Option option={option} key={option._id} />
            </Col>
          ))}
        <hr />

        <div className="d-flex justify-content-center">{renderPageLinks()}</div>
      </Row>
    </>
  );
};

export default FaireUneDemande;
