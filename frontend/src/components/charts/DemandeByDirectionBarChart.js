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
  const chartGetBarDemande = useSelector(state => state.chartGetBarDemande);
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
    setStartDate(null);
    setEndDate(null);
    dispatch(fetchChartBarDemande());
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

          console.log(data);
          const directionData = {
            labels: data.labels,
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
                data: data.demandeApprouver

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
          })
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
        <Message itWillBeHidden type='danger'>
          {errorchartGetBarDemande}
        </Message>
      )}
      {loadingchartGetBarDemande && <Loader />}
      {data && (
        <Card style={{ width: "100%" }} className='mb-2'>
          <div className='d-flex justify-content-center mt-2'>
            <h6>demandes par direction</h6>
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
            {directionChartRef && <canvas ref={directionChartRef} id={uuidv4()}></canvas>}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DemandeByDirectionBarChart;
