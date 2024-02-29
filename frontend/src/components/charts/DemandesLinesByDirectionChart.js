import React, { useEffect, useRef } from 'react'
import Chart from "chart.js/auto";
import { Card, Form, Button } from 'react-bootstrap';
const DemandesLinesByDirectionChart = () => {
    const chartRef = useRef();

    useEffect(() => {
        const data = {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [
                {
                    label: 'en cours',
                    data: [65, 10, 80, 55, 76],
                    fill: false,
                    backgroundColor: "rgba(255, 165, 0, 0.2)",
                    borderColor: "rgba(255, 165, 0, 0.5)",
                    tension: 0.1,
                },
                {
                    label: 'refusee',
                    data: [100, 30, 88, 14, 18],
                    fill: false,
                    backgroundColor: "rgba(255, 0, 0, 0.2)", // Red
                    borderColor: "rgba(255, 0, 0, 0.5)",
                    tension: 0.1,
                },
                {
                    label: 'approuvee',
                    data: [40, 59, 23, 81, 10],
                    fill: false,
                    backgroundColor: "rgba(0, 128, 0, 0.2)", // Green
                    borderColor: "rgba(0, 128, 0, 0.5)",
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

        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: options,
        });

    }, []);

    return (
        <Card>
            <div className='d-flex justify-content-center mt-2'>
                <h6>demandes par direction et dates </h6>
            </div>
            <Card.Body>
                <div>
                    <div className='d-flex justify-content-between align-items-center'>
                        <Form.Control
                            type='date'
                            className='mx-1'
                        />
                        <Form.Control
                            type='date'
                            className='mx-1'
                        />
                    </div>
                    <Button
                        variant='dark'
                        size='sm'
                        className='mt-1 w-100'
                    >
                        <i className='fa-solid fa-filter'></i> filtrer
                    </Button>
                    <Button
                        variant='light'
                        size='sm'
                        className='mt-1 w-100'
                    >
                        <i className='fa-solid fa-filter-circle-xmark'></i>{" "}
                        réinitialiser le filtre
                    </Button>
                </div>
                <hr />
                <canvas ref={chartRef} />
            </Card.Body>
        </Card>);
};



export default DemandesLinesByDirectionChart
