import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  DamiBySousCategorieDoughnutChart,
  DemandeLineChart,
  DemandeByDirectionBarChart,
  UsersLineChart,
  DamiLineChart,
  DamiByServiceDoughnutChart,
} from "../components/charts";

const DashboardPage = () => {
  return (
    <>
      <Row>
        <Col xl={6} lg={6} md={12} sm={12}>
          <UsersLineChart />
        </Col>
        <Col xl={6} lg={6} md={12} sm={12}>
          <DamiLineChart />
        </Col>
      </Row>
      <Row>
        <Col xl={6} lg={6} md={6} sm={12}>
          <DamiBySousCategorieDoughnutChart />
        </Col>
        <Col xl={6} lg={6} md={6} sm={12}>
          <DamiByServiceDoughnutChart />
        </Col>
      </Row>
      <Row>
        <Col xl={6} lg={6} md={12} sm={12}>
          <DemandeByDirectionBarChart />
        </Col>
        <Col xl={6} lg={6} md={12} sm={12}>
          <DemandeLineChart />
        </Col>
      </Row>
    </>
  );
};

export default DashboardPage;
