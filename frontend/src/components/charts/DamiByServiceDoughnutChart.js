import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartOptionsCountOfServices } from "../../redux/chart/chartActions";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";

const DamiByServiceDoughnutChart = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const chartRef = useRef(null);
  const dispatch = useDispatch();
  const chartGetOptionsCountOfServices = useSelector(
    state => state.chartGetOptionsCountOfServices
  );
  const {
    loading: loadingChartGetOptionsCountOfService,
    error: errorChartGetOptionsCountOfService,
    success: successChartGetOptionsCountOfService,
    data,
  } = chartGetOptionsCountOfServices;

  const generateColors = number => {
    const colors = [];

    for (let i = 0; i < number; i++) {
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256);
      const alpha = 0.2;

      const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      colors.push(color);
    }

    return colors;
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartOptionsCountOfServices());
      setCallOnce(true);
    }

    if (successChartGetOptionsCountOfService && data) {
      if (!chartOnce) {
        if (chartRef.current) {
          // Destroy the existing chart if it exists
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }
          let labels = [];
          let counts = [];

          for (let item of data) {
            labels.push(item.service);
            counts.push(Number(item.count));
          }

          const ctx = chartRef.current.getContext("2d");
          const chartdata = {
            labels: labels,
            datasets: [
              {
                data: counts,
                backgroundColor: generateColors(data.length),
              },
            ],
          };
          // Create a new Chart instance
          chartRef.current.chart = new Chart(ctx, {
            type: "doughnut",
            data: chartdata,
          });
          setChartOnce(true);
        }
      }
    }
    return () => {
      setChartOnce(false);
    };
  }, [successChartGetOptionsCountOfService, data, callOnce, chartRef]);

  return (
    <>
      {errorChartGetOptionsCountOfService && (
        <Message itWillBeHidden type='danger'>
          {errorChartGetOptionsCountOfService}
        </Message>
      )}
      {loadingChartGetOptionsCountOfService && <Loader />}
      {data && (
        <Card className='mb-2 '>
          <div className='d-flex justify-content-center mt-2'>
            <h6>Options par service</h6>
          </div>
          <Card.Body className='w-50' style={{ marginLeft: "25%" }}>
            {chartRef && <canvas ref={chartRef} id={uuidv4()}></canvas>}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DamiByServiceDoughnutChart;
