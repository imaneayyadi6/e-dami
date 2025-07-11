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
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartLineDemandeSignataire());
  };

  const quickFilterHandler = (period) => {
    const today = new Date();
    let startDate, endDate;
    
    console.log("🔍 DemandesLinesForDirecteur - Filter period:", period);
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
    dispatch(fetchChartLineDemandeSignataire(startDateStr, endDateStr));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartLineDemandeSignataire());
      //  dispatch(fetchDirectionsSignataires());
      setCallOnce(true);
    }

    if (successchartGetLineDemandesSignataire && data) {
      console.log("🔍 DemandesLinesForDirecteur - Data received:", data);
      console.log("🔍 DemandesLinesForDirecteur - Data type:", typeof data);
      console.log("🔍 DemandesLinesForDirecteur - Data keys:", Object.keys(data));
      console.log("🔍 DemandesLinesForDirecteur - Data structure:", data);
      
      if (!chartOnce) {
        if (chartRef.current) {
          // Destroy the existing chart if it exists
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }

          // Define the correct order of months in French
          const monthOrder = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
          ];
          
          // Get months from data and sort them chronologically
          let months = Object.keys(data);
          
          console.log("🔍 Raw months from data:", months);
          
          // Sort months considering year if present
          months.sort((a, b) => {
            // Extract month name and year from strings like "Janvier 2024" or just "Janvier"
            const parseMonth = (monthStr) => {
              const parts = monthStr.split(' ');
              const monthName = parts[0];
              const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
              const monthIndex = monthOrder.indexOf(monthName);
              return { year, monthIndex, monthName };
            };
            
            const monthA = parseMonth(a);
            const monthB = parseMonth(b);
            
            console.log("🔍 Parsing months:", { a, monthA, b, monthB });
            
            // First compare by year, then by month
            if (monthA.year !== monthB.year) {
              return monthA.year - monthB.year;
            }
            return monthA.monthIndex - monthB.monthIndex;
          });
          
          console.log("🔍 Sorted months:", months);
          
          const resultObject = {};
          
          // Initialize arrays for each status
          const allStatuses = ["en cours", "refuse", "approuve"];
          allStatuses.forEach(status => {
            resultObject[status] = [];
          });
          
          console.log("🔍 Initialized resultObject:", resultObject);
          
          // Iterate through the months in correct chronological order
          for (const month of months) {
            console.log(`🔍 Processing month: ${month}`, data[month]);
            allStatuses.forEach(status => {
              const value = data[month][status] || 0;
              resultObject[status].push(value);
              console.log(`🔍   ${status}: ${value}`);
            });
          }
          
          console.log("🔍 Final resultObject:", resultObject);
          
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
                Vue par défaut (4 derniers mois)
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
