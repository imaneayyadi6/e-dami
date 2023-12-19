import React, { useEffect, useRef } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Chart from "chart.js/auto";

const DemandeByDirectionBarChart = () => {
  const directionChartRef = useRef(null);

  useEffect(() => {
    const directionData = {
      labels: [
        "Direction 1",
        "Direction 2",
        "Direction 3",
        "Direction 4",
        "Direction 5",
        "Direction 6",
        "Direction 7",
        "Direction 8",
        "Direction 9",
        "Direction 10",
      ],
      datasets: [
        {
          label: "In Progress",
          backgroundColor: "rgba(255, 165, 0, 0.2)", 
          borderColor: "rgba(255, 165, 0, 1)",
          borderWidth: 1,
          data: [100, 40, 30, 40, 50, 60, 70, 80, 90, 34],
        },
        {
          label: "Validate",
          backgroundColor: "rgba(0, 128, 0, 0.2)", // Green
          borderColor: "rgba(0, 128, 0, 1)",
          borderWidth: 1,
          data: [50, 40, 35, 45, 55, 65, 75, 85, 50, 55],
        },
        {
          label: "Refused",
          backgroundColor: "rgba(255, 0, 0, 0.2)", // Red
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 1,
          data: [20, 44, 40, 50, 60, 42, 41, 80, 50, 50, 50],
        },
      ],
    };

    const directionOptions = {
      indexAxis: "x", // Use 'x' as the index axis
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    };

    if (directionChartRef && directionChartRef.current) {
      const ctx = directionChartRef.current.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: directionData,
        options: directionOptions,
      });
      // new Chart(ctx, {
      //   type: "line",
      //   data: usersData,
      //   options: usersOptions,
      // });
    }
  }, []);

  return (
    <Card style={{ width: "100%" }} className='mb-2'>
      <div className='d-flex justify-content-center mt-2'>
        <h6>demandes par direction</h6>
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
        <canvas ref={directionChartRef}></canvas>
      </Card.Body>
    </Card>
  );
};

export default DemandeByDirectionBarChart;
