import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteClassModel({ show, handleClose, handleDelete, classId, darkMode }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        borderColor: darkMode ? '#333' : '#dee2e6'
      }}>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this class?</Modal.Body>
      <Modal.Footer className="d-flex flex-row flex-nowrap justify-content-end gap-2">
        <Button variant="danger" onClick={() => handleDelete(classId)}>Delete</Button>
        <Button className="btn btn-primary" onClick={handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteClassModel;