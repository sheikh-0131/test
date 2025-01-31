import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
// import { toast } from "react-toastify";
import { Alert } from "../Toast/Toast";
import "./Transfer.css";
import Spinner from 'react-bootstrap/Spinner';
// import axios from "axios";
// import { API_URL } from "../config";

const Transfer = ({ quantity, setQuantity, totalQuantity, balanceAmount, loading }) => {
  return (
    <div className="eth_transfer">
      <div className="_ethamount">
        <InputGroup size="lg" className="eth_amount">
          <InputGroup.Text id="inputGroup-sizing-lg">
            Quantity per wallet
          </InputGroup.Text>
          <Form.Control
            aria-label="Large"
            aria-describedby="inputGroup-sizing-sm"
            type="number"
            placeholder="input per quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
          />
        </InputGroup>
      </div>
      <div className="totalToken">
        <h4
          style={
            balanceAmount <= totalQuantity
              ? { color: "red" }
              : { color: "green" }
          }
        >
          {loading ? (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Processing Transfers...
            </div>
          ) : (
            <>
              Total: {" "}
              {balanceAmount <= totalQuantity
                ? `${totalQuantity} - insufficient!`
                : totalQuantity}
            </>
          )}
        </h4>
      </div>
      <Alert />
    </div>
  );
};

export default Transfer;
