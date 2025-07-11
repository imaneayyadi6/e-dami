import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartBarDemandeSignataire } from "../../redux/chart/chartActions";
import { v4 as uuidv4 } from "uuid";
import Message from "../Message";
import Loader from "../Loader";

const DemandeByDirectionBarChartForDirecteur = () => {
  const directionChartRef = useRef(null);

  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const chartGetBarDemandesSignataire = useSelector(
    (state) => state.chartGetBarDemandesSignataire
  );
  const {
    loading: loadingchartGetBarDemandesSignataire,
    error: errorchartGetBarDemandesSignataire,
    success: successchartGetBarDemandesSignataire,
    data,
  } = chartGetBarDemandesSignataire;

  const filterHandler = () => {
    dispatch(fetchChartBarDemandeSignataire(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartBarDemandeSignataire());
  };

  const quickFilterHandler = (period) => {
    const today = new Date();
    let startDate, endDate;
    
    console.log("🔍 DemandeByDirectionBarChart - Filter period:", period);
    console.log("🔍 Today:", today);
    
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
        endDate = new Date();
        startDate = new Date(endDate.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days in milliseconds
        break;
    }
    
    console.log("🔍 Calculated dates:", { startDate, endDate });
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    console.log("🔍 Formatted dates:", { startDateStr, endDateStr });
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    dispatch(fetchChartBarDemandeSignataire(startDateStr, endDateStr));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartBarDemandeSignataire());
      setCallOnce(true);
    }
    if (successchartGetBarDemandesSignataire && data) {
      console.log("🔍 Debug - Data received:", data);
      console.log("🔍 Debug - Labels:", data.labels);
      console.log("🔍 Debug - Data counts:", {
        enCours: data.demandeEnCours,
        refuse: data.demandeRefuse,
        approuve: data.demandeApprouver
      });
      console.log("🔍 Debug - Labels type:", typeof data.labels, Array.isArray(data.labels));
      console.log("🔍 Debug - EnCours type:", typeof data.demandeEnCours, Array.isArray(data.demandeEnCours));
      console.log("🔍 Debug - Data validity checks:");
      console.log("  - Labels exist:", !!data.labels);
      console.log("  - Labels length:", data.labels ? data.labels.length : 'undefined');
      console.log("  - EnCours exists:", !!data.demandeEnCours);
      console.log("  - EnCours length:", data.demandeEnCours ? data.demandeEnCours.length : 'undefined');
      console.log("  - Refuse exists:", !!data.demandeRefuse);
      console.log("  - Refuse length:", data.demandeRefuse ? data.demandeRefuse.length : 'undefined');
      console.log("  - Approuve exists:", !!data.demandeApprouver);
      console.log("  - Approuve length:", data.demandeApprouver ? data.demandeApprouver.length : 'undefined');
      
      if (directionChartRef.current) {
        // Always destroy existing chart before creating new one
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
        setChartOnce(true);
      }
    }
    return () => {
      setChartOnce(false);
    };
  }, [successchartGetBarDemandesSignataire, callOnce, data]);

  return (
    <>
      {errorchartGetBarDemandesSignataire && (
        <Message itWillBeHidden type="danger">
          {errorchartGetBarDemandesSignataire}
        </Message>
      )}
      {loadingchartGetBarDemandesSignataire && <Loader />}
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

export default DemandeByDirectionBarChartForDirecteur;
