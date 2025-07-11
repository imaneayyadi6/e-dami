import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartBarDemande } from "../../redux/chart/chartActions";
import { v4 as uuidv4 } from "uuid";
import Message from "../Message";
import Loader from "../Loader";

const DemandeByDirectionBarChart = () => {
  const directionChartRef = useRef(null);

  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const chartGetBarDemande = useSelector((state) => state.chartGetBarDemande);
  const {
    loading: loadingchartGetBarDemande,
    error: errorchartGetBarDemande,
    success: successchartGetBarDemande,
    data,
  } = chartGetBarDemande;

  const filterHandler = () => {
    dispatch(fetchChartBarDemande(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartBarDemande());
  };

  const quickFilterHandler = (period) => {
    const today = new Date();
    let startDate, endDate;
    
    switch(period) {
      case 'last_year':
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // Same month last year
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month this year
        break;
      case '6_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
        break;
      case '3_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
        break;
      case '90_days':
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        endDate = new Date(); // Today
        break;
    }
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    dispatch(fetchChartBarDemande(startDateStr, endDateStr));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartBarDemande());
      setCallOnce(true);
    }
    if (successchartGetBarDemande && data) {
      if (!chartOnce) {
        if (directionChartRef.current) {
          if (directionChartRef.current.chart) {
            directionChartRef.current.chart.destroy();
          }

          let labels = data.labels.map((label) => {
            if (label.length > 25) {
              return label.substring(0, 25) + "...";
            } else {
              return label;
            }
          });

          const directionData = {
            labels: labels,
            datasets: [
              {
                label: "en cours",
                backgroundColor: "rgba(255, 165, 0, 0.2)",
                borderColor: "rgba(255, 165, 0, 1)",
                borderWidth: 1,
                data: data.demandeEnCours,
              },
              {
                label: "Approuvée",
                backgroundColor: "rgba(0, 128, 0, 0.2)", // Green
                borderColor: "rgba(0, 128, 0, 1)",
                borderWidth: 1,
                data: data.demandeApprouver,
              },
              {
                label: "refusée",
                backgroundColor: "rgba(255, 0, 0, 0.2)", // Red
                borderColor: "rgba(255, 0, 0, 1)",
                borderWidth: 1,
                data: data.demandeRefuse,
              },
            ],
          };

          const directionOptions = {
            indexAxis: "x",
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
          };

          const ctx = directionChartRef.current.getContext("2d");
          directionChartRef.current.chart = new Chart(ctx, {
            type: "bar",
            data: directionData,
            options: directionOptions,
          });
        }
      }
    }
    return () => {
      setChartOnce(false);
    };
  }, [successchartGetBarDemande, callOnce, chartOnce, data]);

  return (
    <>
      {errorchartGetBarDemande && (
        <Message itWillBeHidden type="danger">
          {errorchartGetBarDemande}
        </Message>
      )}
      {loadingchartGetBarDemande && <Loader />}
      {data && (
        <Card style={{ width: "100%" }} className="mb-2">
          <div className="d-flex justify-content-center mt-2">
            <h6>demandes par direction</h6>
          </div>
          <Card.Body>
            <div>
              {/* Quick Filter Buttons */}
              <div className="mt-2">
                <div className="row">
                  <div className="col-6 col-md-3 mb-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                      onClick={() => quickFilterHandler('90_days')}
                    >
                      90 derniers jours
                    </Button>
                  </div>
                  <div className="col-6 col-md-3 mb-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                      onClick={() => quickFilterHandler('3_months')}
                    >
                      3 derniers mois
                    </Button>
                  </div>
                  <div className="col-6 col-md-3 mb-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                      onClick={() => quickFilterHandler('6_months')}
                    >
                      6 derniers mois
                    </Button>
                  </div>
                  <div className="col-6 col-md-3 mb-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                      onClick={() => quickFilterHandler('last_year')}
                    >
                      Dernière année
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                variant="light"
                size="sm"
                className="mt-2 w-100"
                onClick={resetFiltreHandler}
              >
                <i className="fa-solid fa-filter-circle-xmark"></i>{" "}
                Vue par défaut (5 derniers mois)
              </Button>
            </div>
            <hr />
            {directionChartRef && (
              <canvas ref={directionChartRef} id={uuidv4()}></canvas>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DemandeByDirectionBarChart;
