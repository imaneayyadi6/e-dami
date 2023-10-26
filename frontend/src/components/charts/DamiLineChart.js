import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";
import { fetchChartOptions } from "../../redux/chart/chartActions";
import { useDispatch, useSelector } from "react-redux";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";

const DamiLineChart = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const chartRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const chartGetOptions = useSelector(state => state.chartGetOptions);
  const {
    loading: loadingChartGetOptions,
    error: errorChartGetOptions,
    success: successChartGetOptions,
    data,
  } = chartGetOptions;

  const filterHandler = () => {
    dispatch(fetchChartOptions(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate(null);
    setEndDate(null);
    dispatch(fetchChartOptions());
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartOptions());
      setCallOnce(true);
    }

    if (successChartGetOptions && data) {
      if (!chartOnce) {
        if (chartRef.current) {
          // Destroy the existing chart if it exists
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }
          let labels = [];
          let counts = [];

          for (let item of data) {
            labels.push(item.month);
            counts.push(Number(item.count));
          }

          const ctx = chartRef.current.getContext("2d");
          // Sample data (you can replace this with your own data)
          const objData = {
            labels: labels,
            datasets: [
              {
                label: "options",
                data: counts,
                backgroundColor: "rgba(255, 165, 0, 0.2)",
                borderColor: "rgba(255, 165, 0, 1)",
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
  }, [callOnce, successChartGetOptions, data]);

  return (
    <>
      {errorChartGetOptions && (
        <Message itWillBeHidden type='danger'>
          {errorChartGetOptions}
        </Message>
      )}
      {loadingChartGetOptions && <Loader />}
      {data && (
        <Card style={{ width: "100%" }} className='mb-2'>
          <div className='d-flex justify-content-center mt-2'>
            <h6>les dami qui existe </h6>
          </div>
          <Card.Body>
            <div>
              <div className='d-flex justify-content-between align-items-center'>
                <Form.Control
                  type='date'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className='mx-1'
                />
                <Form.Control
                  type='date'
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className='mx-1'
                />
              </div>
              <Button
                variant='dark'
                size='sm'
                className='mt-1 w-100'
                onClick={filterHandler}>
                <i className='fa-solid fa-filter'></i> filtrer
              </Button>
              <Button
                variant='light'
                size='sm'
                className='mt-1 w-100'
                onClick={resetFiltreHandler}>
                <i className='fa-solid fa-filter-circle-xmark'></i>{" "}
                réinitialiser le filtre
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

export default DamiLineChart;
