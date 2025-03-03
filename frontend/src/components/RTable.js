import React from "react";
import { Card, Table } from "react-bootstrap";

const RTable = ({
  data,
  displayData = ["option", "demandeur", "status", ""],
}) => {
  const renderItems = (index) => {
    return (
      <tr>
        {displayData.map(
          (item, index) =>
            data[index][item] && (
              <td key={index}>
                <small>{data[index][item]}</small>
              </td>
            )
        )}
      </tr>
    );
  };

  return (
    <Card>
      <Card.Body>
        <Table className="table-sm table-hover">
          <thead>
            <tr>
              {displayData.length > 0 &&
                displayData.map((item) => (
                  <th key={item}>
                    <small>{item}</small>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>{data.map((item, index) => renderItems(index))}</tbody>
        </Table>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card>
  );
};

export default RTable;
