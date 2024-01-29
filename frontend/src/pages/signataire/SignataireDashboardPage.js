import React from 'react'
import { DemandesLinesByDirectionChart } from '../../components/charts'
import { Col, Row } from 'react-bootstrap'

const SignataireDashboardPage = () => {
    return (
        <Row>
            <Col xl={6} lg={6} md={6} sm={12}>
                <DemandesLinesByDirectionChart />
            </Col>
        </Row>
    )
}

export default SignataireDashboardPage
