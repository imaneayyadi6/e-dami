import React, { useEffect, useRef } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";

const DemandeLineChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Sample data (you can replace this with your own data)
    const data = {
      labels: ["January", "February", "March", "April", "May"],
      datasets: [
        {
          label: "Demandes",
          data: [150, 255, 70, 90, 75],
          borderColor: "rgba(255, 0, 0, 0.2)",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };

    new Chart(ctx, {
      type: "line",
      data: data,
    });
  }, []);

  return (
    <Card style={{ width: "100%" }} className='mb-2'>
      <div className='d-flex justify-content-center mt-2'>
        <h6>les demandes effectue </h6>
      </div>
      <Card.Body>
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <Form.Control type="date" className="mx-1" />
            <Form.Control type="date" className="mx-1" />
          </div>
          <Button variant="dark" size="sm" className="mt-1 w-100">
            <i className="fa-solid fa-filter"></i>{" "}filtrer
          </Button>
          <Button variant="light" size="sm" className="mt-1 w-100" >
                <i className="fa-solid fa-filter-circle-xmark"></i>{" "}réinitialiser le filtre
              </Button>
        </div>
        <hr />
        <canvas ref={chartRef}></canvas>
      </Card.Body>
    </Card>
  );
};

export default DemandeLineChart;
