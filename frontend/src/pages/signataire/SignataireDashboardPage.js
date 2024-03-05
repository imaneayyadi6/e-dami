import React from "react";
import {
  DemandesLinesForDirecteur,
  DemandeByDirectionBarChartForDirecteur,
} from "../../components/charts";
import { Col, Row } from "react-bootstrap";

const SignataireDashboardPage = () => {
  return (
    <Row>
      <Col xl={6} lg={6} md={12} sm={12}>
        <DemandesLinesForDirecteur />
      </Col>
      <Col xl={6} lg={6} md={12} sm={12}>
        <DemandeByDirectionBarChartForDirecteur />
      </Col>
    </Row>
  );
};

export default SignataireDashboardPage;
