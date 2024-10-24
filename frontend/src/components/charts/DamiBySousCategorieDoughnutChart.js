import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartOptionsCountOfSousCategorie } from "../../redux/chart/chartActions";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";

const DamiBySousCategorieDoughnutChart = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [chartOnce, setChartOnce] = useState(false);

  const chartRef = useRef(null);
  const dispatch = useDispatch();
  const chartGetOptionsCountOfSousCategorie = useSelector(
    (state) => state.chartGetOptionsCountOfSousCategorie
  );
  const {
    loading: loadingChartGetOptionsCountOfSousCategorie,
    error: errorChartGetOptionsCountOfSousCategorie,
    success: successChartGetOptionsCountOfSousCategorie,
    data,
  } = chartGetOptionsCountOfSousCategorie;

  const generateColors = (number) => {
    const colors = [];
    const crypto = window.crypto || window.msCrypto;
    for (let i = 0; i < number; i++) {
      const redArray = new Uint8Array(1);
      const greenArray = new Uint8Array(1);
      const blueArray = new Uint8Array(1);

      // Generate secure random values for red, green, and blue
      crypto.getRandomValues(redArray);
      crypto.getRandomValues(greenArray);
      crypto.getRandomValues(blueArray);

      // The random value is between 0 and 255
      const red = redArray[0]; // 0-255
      const green = greenArray[0]; // 0-255
      const blue = blueArray[0]; // 0-255
      const alpha = 0.2;

      const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      colors.push(color);
    }

    return colors;
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartOptionsCountOfSousCategorie());
      setCallOnce(true);
    }

    if (successChartGetOptionsCountOfSousCategorie && data) {
      if (!chartOnce) {
        if (chartRef.current) {
          // Destroy the existing chart if it exists
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }
          let labels = [];
          let counts = [];

          for (let item of data) {
            labels.push(item.sousCategorie);
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
  }, [successChartGetOptionsCountOfSousCategorie, data, callOnce, chartRef]);

  return (
    <>
      {errorChartGetOptionsCountOfSousCategorie && (
        <Message itWillBeHidden type="danger">
          {errorChartGetOptionsCountOfSousCategorie}
        </Message>
      )}
      {loadingChartGetOptionsCountOfSousCategorie && <Loader />}
      {data && (
        <Card className="mb-2 ">
          <div className="d-flex justify-content-center mt-2">
            <h6>Options par sous-categorie</h6>
          </div>
          <Card.Body className="w-50" style={{ marginLeft: "25%" }}>
            {chartRef && <canvas ref={chartRef} id={uuidv4()}></canvas>}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DamiBySousCategorieDoughnutChart;
