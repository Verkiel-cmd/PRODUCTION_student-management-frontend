import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

function DeleteStudent() {

  const apiUrl = process.env.REACT_APP_API_URL; 

  const { id } = useParams();
  const history = useHistory();

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


      history.push('/Student_lists/ListStud');
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