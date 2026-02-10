import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../auth_section/config';

function DeleteStudent() {

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {

      deleteStudent(id);
    }
  }, [id]);

  const deleteStudent = async () => {
    try {
      const response = await fetch(`${config.API_URL}/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }


      navigate('/Student_lists/ListStud');
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div>
      <h2>Deleting student...</h2>
    </div>
  );
}

export default DeleteStudent;