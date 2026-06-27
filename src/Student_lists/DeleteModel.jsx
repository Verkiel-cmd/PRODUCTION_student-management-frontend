import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteModal({ show, handleClose, handleDelete, studentId }) {

  console.log(`DeleteModal received studentId: ${studentId}`);

  return (
        <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        borderColor: darkMode ? '#333' : '#dee2e6'
      }}>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => {
            console.log(`Attempting to delete student with ID: ${studentId}`);

            handleDelete(studentId);
          }}>Delete
        </Button>

        <Button className="btn btn-primary" onClick={handleClose}>
          Cancel
        </Button>

      </Modal.Footer>
    </Modal>
  );
}

export default DeleteModal;
