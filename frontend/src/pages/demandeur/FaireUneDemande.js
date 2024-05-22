import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/categorie/categorieActions";
import {
  fetchSousCategoriesByCategorieID,
  resetFetchSousCategoriesByCategorieID,
} from "../../redux/sousCategorie/sousCategorieActions";
import { fetchOptionsBySousCategorieID } from "../../redux/option/optionActions";

import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Placeholder,
  Row,
} from "react-bootstrap";
import { DamiLoading, Message, Option, WarningMessage } from "../../components";

const FaireUneDemande = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sousCategorie, setSousCategorie] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [libelle, setLibelle] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
    if (event.target.dataset.id === "") {
      disptach(resetFetchSousCategoriesByCategorieID());
    } else {
      setCategorie(event.target.dataset.id);
      disptach(fetchSousCategoriesByCategorieID(event.target.dataset.id));
    }
  };

  const getSousCategorieHandler = (event) => {
    setSousCategorie(event.target.dataset.id);
    getOptionsFilterHandler(1, event.target.dataset.id, libelle);
  };

  const getOptionsFilterHandler = (page = 1, sc = null, libelle = null) => {
    let query = { page: page || 1, libelle };
    if (sc) query.sousCategorie = sc;
    disptach(fetchOptionsBySousCategorieID(query));
  };

  // const getOptionsHandler = (event) => {
  //   if (sousCategorie) getOptionsFilterHandler();
  // };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getOptionsFilterHandler(newPage, sousCategorie, libelle);
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
      getOptionsFilterHandler(1, null, "");
      setCallOnce(true);
    }
    if (successOptionListBySousCategorieID) setTotalPages(data.totalPages);
  }, [callOnce, disptach, successOptionListBySousCategorieID]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
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

      <Message type="info">
        cliquer sur une categorie ou une sous-categorie pour filtrer les options
        (dami's)
      </Message>

      <Card>
        {/* <Card.Body>
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
        </Card.Body> */}
        <Card.Body>
          <h6>categories :</h6>
          {loadingCategorieList && (
            <Placeholder animation="glow">
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
              <div className="ml-1 d-inline">
                <Placeholder xs={2}></Placeholder>
              </div>
            </Placeholder>
          )}
          {categories.length > 0 &&
            categories.map((cat) => (
              <Badge
                className={`mr-1  cursor-pointer hovred bg-${
                  cat._id === categorie ? "dark" : "light"
                }`}
                data-id={cat._id}
                key={cat._id}
                onClick={getSousCategoriesChangeHandler}
              >
                {String(cat.libelle).toLowerCase()}
              </Badge>
            ))}
          {(loadingSouscategorieListByCategorieID ||
            souscategories.length > 0) && (
            <div className="d-block mt-1">
              <hr />
              <h6>sous-categories :</h6>
              <div className="d-block">
                <Badge
                  className={`mr-1 bg-light cursor-pointer hovred mb-2`}
                  onClick={() => {
                    getOptionsFilterHandler(1, null, libelle);
                    setSousCategorie(null);
                  }}
                >
                  actualiser
                </Badge>
              </div>

              {loadingSouscategorieListByCategorieID && (
                <Placeholder animation="glow">
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                  <div className="ml-1 d-inline">
                    <Placeholder xs={2}></Placeholder>
                  </div>
                </Placeholder>
              )}

              {souscategories.length > 0 &&
                souscategories.map((souscat) => (
                  <Badge
                    className={`mr-1 bg-${
                      sousCategorie === souscat._id ? "dark" : "light"
                    } cursor-pointer hovred`}
                    data-id={souscat._id}
                    key={souscat._id}
                    onClick={getSousCategorieHandler}
                  >
                    {String(souscat.libelle).toLowerCase()}
                  </Badge>
                ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-2">
        <Card.Body>
          <label>nom option (dami)</label>
          <div className="d-flex align-items-center">
            <Form.Control
              placeholder="veuillez saisire le nom de l'option (dami) ..."
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
            />
            <Button
              onClick={() => {
                getOptionsFilterHandler(1, sousCategorie, libelle);
              }}
              variant="dark"
            >
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
        !loadingOptionListBySousCategorieID ? (
          data.options.map((option) => (
            <Col
              xl={windowSize.width >= 1500 ? 4 : 6}
              lg={6}
              md={6}
              sm={12}
              className="mb-3"
            >
              <Option option={option} key={option._id} />
            </Col>
          ))
        ) : (
          <div className="mb-5">
            <Card>
              <Card.Body className="pt-4">
                <WarningMessage message={"Aucune option n'est trouvée."} />
              </Card.Body>
            </Card>
          </div>
        )}
        <hr />
        <div className="d-flex justify-content-center">{renderPageLinks()}</div>
      </Row>
    </>
  );
};

export default FaireUneDemande;
