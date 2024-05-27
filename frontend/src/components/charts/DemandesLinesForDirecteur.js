import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Card, Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchDirectionsSignataires } from "../../redux/direction/directionActions";
import Message from "../Message";
import { fetchChartLineDemandeSignataire } from "../../redux/chart/chartActions";
import Loader from "../Loader";

const DemandesLinesForDirecteur = () => {
  const chartRef = useRef();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);
  const dispatch = useDispatch();

  const directionSignatairesList = useSelector(
    (state) => state.directionSignatairesList
  );

  // const {
  //   loading: loadingDirectionSignatairesList,
  //   error: errorDirectionSignatairesList,
  //   //success: successDirectionSignatairesList,
  //   directions,
  // } = directionSignatairesList;

  const chartGetLineDemandesSignataire = useSelector(
    (state) => state.chartGetLineDemandesSignataire
  );
  const {
    loading: loadingchartGetLineDemandesSignataire,
    error: errorchartGetLineDemandesSignataire,
    success: successchartGetLineDemandesSignataire,
    data,
  } = chartGetLineDemandesSignataire;

  const filterHandler = () => {
    dispatch(fetchChartLineDemandeSignataire(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate(null);
    setEndDate(null);
    dispatch(fetchChartLineDemandeSignataire());
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartLineDemandeSignataire());
      //  dispatch(fetchDirectionsSignataires());
      setCallOnce(true);
    }

    if (successchartGetLineDemandesSignataire && data) {
      if (!chartOnce) {
        if (chartRef.current) {
          // Destroy the existing chart if it exists
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }

          let months = Object.keys(data);
          const resultObject = {};
          // Iterate through the keys of the outer object
          for (const outerKey in data) {
            // Iterate through the keys of the inner objects
            for (const innerKey in data[outerKey]) {
              // Check if the key exists in the result object
              if (resultObject.hasOwnProperty(innerKey)) {
                // If it exists, push the value to the array
                resultObject[innerKey].push(data[outerKey][innerKey]);
              } else {
                // If it doesn't exist, create a new array with the value
                resultObject[innerKey] = [data[outerKey][innerKey]];
              }
            }
          }
          const chartData = {
            labels: months,
            datasets: [
              {
                label: "en cours",
                data: resultObject["en cours"],
                fill: false,

                backgroundColor: "rgba(255, 165, 0, 0.2)",
                borderColor: "rgba(255, 165, 0, 0.2)",
                tension: 0.1,
              },
              {
                label: "refuse",
                data: resultObject["refuse"],
                fill: false,
                backgroundColor: "rgba(255, 0, 0, 0.2)", // Red
                borderColor: "rgba(255, 0, 0, 0.2)",
                tension: 0.1,
              },
              {
                label: "approuve",
                data: resultObject["approuve"],
                fill: false,
                backgroundColor: "rgba(0, 128, 0, 0.2)", // Green
                borderColor: "rgba(0, 128, 0, 0.2)",
                tension: 0.1,
              },
            ],
          };

          const options = {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          };

          const ctx = chartRef.current.getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: chartData,
            options: options,
          });
          setChartOnce(true);
        }
      }
    }
    return () => {
      setChartOnce(false);
    };
  }, [callOnce, successchartGetLineDemandesSignataire, data]);

  return (
    <>
      {/* {errorDirectionSignatairesList && (
        <Message itWillBeHidden type="danger">
          {errorDirectionSignatairesList}
        </Message>
      )} */}
      {errorchartGetLineDemandesSignataire && (
        <Message itWillBeHidden type="danger">
          {errorchartGetLineDemandesSignataire}
        </Message>
      )}
      {loadingchartGetLineDemandesSignataire && <Loader />}
      {data && (
        <Card>
          <div className="d-flex justify-content-center mt-2">
            <h6>demandes par direction et dates </h6>
          </div>
          <Card.Body>
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mx-1"
                />
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mx-1"
                />
              </div>
              {/* <div className="my-2">
                <Form.Select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  disabled={loadingDirectionSignatairesList}
                >
                  <option value="">
                    ---- veuillez choisire une direction ----
                  </option>
                  {directions.length > 0 &&
                    directions.map((direction) => (
                      <option key={direction._id} value={direction._id}>
                        {direction.libelle}
                      </option>
                    ))}
                </Form.Select>
              </div> */}
              <Button
                variant="dark"
                size="sm"
                className="mt-1 w-100"
                onClick={filterHandler}
              >
                <i className="fa-solid fa-filter"></i> filtrer
              </Button>
              <Button
                variant="light"
                size="sm"
                className="mt-1 w-100"
                onClick={resetFiltreHandler}
              >
                <i className="fa-solid fa-filter-circle-xmark"></i>{" "}
                réinitialiser le filtre
              </Button>
            </div>
            <hr />
            <canvas ref={chartRef} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DemandesLinesForDirecteur;
