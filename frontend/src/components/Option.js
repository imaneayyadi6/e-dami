import React from "react";
import { Card } from "react-bootstrap";
import { capitalizeFirstLetter } from "../services";
import { Link } from "react-router-dom";
import Dami from "./Dami";

const Option = ({ option }) => {
    return (
        <Card className="option-container">
            <Link to={`/demandeur/faire-une-demande/option/${option._id}`} className="option-link">
                <div className="option-container-overlay"></div>
                <Dami mini option={option} />
                <div className="option-dami-info">
                    <h6>{capitalizeFirstLetter(option.libelle)}</h6>
                </div>
            </Link>
        </Card>
    )
}

export default Option;
