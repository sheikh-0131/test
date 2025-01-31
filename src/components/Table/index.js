/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import "./style.css";
import { validateAndProcessAddresses } from '../../utils/validation';
import { toast } from 'react-toastify';

const SenderTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { wallets, setWallets, isConnected } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = wallets && wallets.slice(indexOfFirstItem, indexOfLastItem);
  }, [wallets, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const uploadWallet = async (e) => {
    if (!e.target.files || !e.target.files[0]) {
      toast.error('Please select a CSV file');
      return;
    }

    const file = e.target.files[0];
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvText = event.target.result;
        const addresses = csvText
          .split(/[\r\n,]+/) // Split by newline or comma
          .map(addr => addr.trim())
          .filter(addr => addr); // Remove empty strings

        const validation = validateAndProcessAddresses(addresses);

        if (validation.errors.length > 0) {
          // Show validation errors
          toast.error(
            <div>
              <p>Validation Errors:</p>
              <ul>
                {validation.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (validation.validAddresses.length === 0) {
          toast.error('No valid addresses found in the CSV file');
          return;
        }

        // Update the wallets state with valid addresses
        setWallets(validation.validAddresses);
        toast.success(
          `Successfully loaded ${validation.validAddresses.length} valid addresses`
        );
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Error processing CSV file');
    }
  };

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Wallet Address</th>
          </tr>
        </thead>
        <tbody>
          {wallets && wallets.length > 0
            ? wallets.map((e, idx) => {
                return (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{e}</td>
                  </tr>
                );
              })
            : "No data"}
        </tbody>
      </Table>

      {/* <Pagination>
        {[
          ...Array(Math.ceil(wallets && wallets.length / itemPerPage)).key(),
        ].map(
          // eslint-disable-next-line array-callback-return
          (number) => {
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>;
          }
        )}
      </Pagination> */}

      <div className="tableButton">
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          onChange={uploadWallet}
          disabled={!isConnected}
        />
        <Button
          className="uploadButton"
          disabled={!isConnected}
          onClick={() => document.getElementById('csv-upload').click()}
        >
          Upload CSV
        </Button>
        {/* <InputGroup className="addButton">
          <Form.Control
            placeholder="New Wallet Address"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            aria-disabled={!isConnected}
          />
          <Button variant="primary" id="button-addon2" disabled={!isConnected}>
            Add
          </Button>
        </InputGroup> */}
      </div>
    </div>
  );
};

export default SenderTable;
