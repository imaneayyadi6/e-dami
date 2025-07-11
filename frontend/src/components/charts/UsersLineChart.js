import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartUsers } from "../../redux/chart/chartActions";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";

const UsersLineChart = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const chartRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const chartGetUsers = useSelector(state => state.chartGetUsers);
  const {
    loading: loadingChartGetUsers,
    error: errorChartGetUsers,
    success: successChartGetUsers,
    data,
  } = chartGetUsers;

  const filterHandler = () => {
    dispatch(fetchChartUsers(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartUsers());
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
    dispatch(fetchChartUsers(startDateStr, endDateStr));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartUsers());
      setCallOnce(true);
    }

    if (successChartGetUsers && data) {
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

          // Sort data chronologically considering year if present
          const sortedData = [...data].sort((a, b) => {
            // Extract month name and year from strings like "Janvier 2024" or just "Janvier"
            const parseMonth = (monthStr) => {
              const parts = monthStr.split(' ');
              const monthName = parts[0];
              const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
              const monthIndex = monthOrder.indexOf(monthName);
              return { year, monthIndex, monthName };
            };
            
            const monthA = parseMonth(a.month);
            const monthB = parseMonth(b.month);
            
            // First compare by year, then by month
            if (monthA.year !== monthB.year) {
              return monthA.year - monthB.year;
            }
            return monthA.monthIndex - monthB.monthIndex;
          });

          let labels = [];
          let counts = [];

          for (let item of sortedData) {
            labels.push(item.month);
            counts.push(Number(item.count));
          }

          const ctx = chartRef.current.getContext("2d");
          // Sample data (you can replace this with your own data)
          const objData = {
            labels: labels,
            datasets: [
              {
                label: "Users",
                data: counts,
                borderColor: "rgba(0, 128, 0, 0.2)",
                backgroundColor: "rgba(0, 128, 0, 0.2)",
                borderWidth: 2,
                fill: false,
              },
            ],
          };

          // Create a new Chart instance
          chartRef.current.chart = new Chart(ctx, {
            type: "line",
            data: objData,
          });
          setChartOnce(true);
        }
      }
    }
    return () => {
      setChartOnce(false);
    };
  }, [callOnce, successChartGetUsers, data]);

  return (
    <>
      {errorChartGetUsers && (
        <Message itWillBeHidden type='danger'>
          {errorChartGetUsers}
        </Message>
      )}
      {loadingChartGetUsers && <Loader />}
      {data && (
        <Card style={{ width: "100%" }} className='mb-2'>
          <div className='d-flex justify-content-center mt-2'>
            <h6>les utilisateurs qui existe</h6>
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
                variant='light'
                size='sm'
                className='mt-2 w-100'
                onClick={resetFiltreHandler}>
                <i className='fa-solid fa-filter-circle-xmark'></i>{" "}
                Vue par défaut (5 derniers mois)
              </Button>
            </div>
            <hr />
            {chartRef && <canvas ref={chartRef} id={uuidv4()}></canvas>}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default UsersLineChart;
