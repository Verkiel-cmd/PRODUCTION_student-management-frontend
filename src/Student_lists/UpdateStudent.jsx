import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Webstyles/bootstrapError_style.css';
import  config from'../auth_section/config';

function UpdateStudent() {

  

  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    nameError: '',
    emailError: '',
    phoneError: '',
    addressError: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isError, setIsError] = useState(false);
  const [touched, setTouched] = useState(false);



  const handleCloseError = (errorType) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`${errorType}Error`]: '',
    }));

    setIsError(false);
    if (value.trim()) {
      setTouched(false);
    }

  };


  const handleOperationError = (message) => {
    setErrorMessage(message);

    setTimeout(() => setErrorMessage(''), 1000);
  };


  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/students/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      nameError: '',
      emailError: '',
      phoneError: '',
      addressError: '',
    };


    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;



    const phoneRegex = /^\d{10}$/;

    if (!student.name) {
      newErrors.nameError = 'Name is required';
      isValid = false;
    }

    if (!student.email) {
      newErrors.emailError = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(student.email)) {
      newErrors.emailError = 'Invalid email format';
      isValid = false;
    }

    if (!student.phone) {
      newErrors.phoneError = 'Phone is required';
      isValid = false;
    } else if (!phoneRegex.test(student.phone)) {
      newErrors.phoneError = 'Phone number must be 10 digits';
      isValid = false;
    }

    if (!student.address) {
      newErrors.addressError = 'Address is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validate()) {
      return;
    }



    try {
      const response = await fetch(`${config.API_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        if (response.status === 409) {
          handleOperationError('The data already exists');
        } else if (response.status === 404) {
          setErrorMessage('Student not found');
        } else {
          setErrorMessage(errorData.error || 'Failed to update the student');
        }
        return;
      }
      setSuccessMessage('Student updated successfully');

      setTimeout(() => {
        setSuccessMessage('');
      }, 1000);

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container_listud my-5">
      {successMessage && (
        <div className="row mb-3">
          <div className="offset-sm-0 col-sm-6">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <strong>{successMessage}</strong>
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" role="alert" >
          {errorMessage}
        </div>
      )}





      <h2 className='fw-bold'>Update Student</h2>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={student.id} />

        <div className="row mb-3 fw-medium">
          <label className="col-sm-0 col-form-label">Name</label>
          <div className="col-sm-6">
            <input
              type="text"
              className={`form-control ${isError ? 'is-invalid' : ''}`} // Dynamically add 'is-invalid'
              name="name"
              value={student.name}
              onChange={(e) => {
                handleChange(e);
                setIsError(false);
                if (e.target.value.trim()) {
                  setTouched(false);
                }
              }}
              onBlur={() => {
                if (!student.name.trim()) {
                  setTouched(true);
                  setIsError(true);
                }
              }}
            />
            {/* Display error message*/}
            {touched && !student.name.trim() && (
              <div className="invalid-feedback">Name cannot be empty</div>
            )}
          </div>
        </div>





        {errors.nameError && (
          <div className="alert alert-danger alert-dismissible fade show  p-1 small" role="alert">
            <strong>{errors.nameError}</strong>
            <button type="button" className="btn-close p-2 small" data-bs-dismiss="alert" aria-label="Close" onClick={() => handleCloseError('name')}></button>
          </div>
        )}





        <div className="row mb-3 fw-medium ">
          <label className="col-sm-0 col-form-label">Email</label>
          <div className="col-sm-6">
            <input
              type="email"
              className={`form-control ${isError ? 'is-invalid' : ''}`} // Dynamically add 'is-invalid'
              name="email"
              value={student.email}
              onChange={(e) => {
                handleChange(e);
                setIsError(false);
                if (e.target.value.trim()) {
                  setTouched(false);
                }
              }}
              onBlur={() => {
                if (!student.email.trim()) {
                  setTouched(true);
                  setIsError(true);
                }
              }}
            />
            {/* Display error message*/}
            {touched && !student.email.trim() && (
              <div className="invalid-feedback">Email cannot be empty</div>
            )}
          </div>
        </div>





        {errors.emailError && (
          <div className="alert alert-danger alert-dismissible fade show  p-1 small" role="alert">
            <strong>{errors.emailError}</strong>
            <button type="button" className="btn-close p-2 small" data-bs-dismiss="alert" aria-label="Close" onClick={() => handleCloseError('email')}></button>
          </div>
        )}





        <div className="row mb-3 fw-medium">
          <label className="col-sm-0 col-form-label">Phone</label>
          <div className="col-sm-6">
            <input
              type="text"
              className={`form-control ${isError ? 'is-invalid' : ''}`} // Dynamically add 'is-invalid'
              name="phone"
              value={student.phone}
              onChange={(e) => {
                handleChange(e);
                setIsError(false);
                if (e.target.value.trim()) {
                  setTouched(false);
                }
              }}
              onBlur={() => {
                if (!student.phone.trim()) {
                  setTouched(true);
                  setIsError(true);
                }
              }}
            />
            {/* Display error message*/}
            {touched && !student.phone.trim() && (
              <div className="invalid-feedback">Phone cannot be empty</div>
            )}
          </div>
        </div>





        {errors.phoneError && (
          <div className="alert alert-danger alert-dismissible fade show  p-1 small" role="alert">
            <strong>{errors.phoneError}</strong>
            <button type="button" className="btn-close p-2 small" data-bs-dismiss="alert" aria-label="Close" onClick={() => handleCloseError('phone')}></button>
          </div>
        )}





        <div className="row mb-3 fw-medium">
          <label className="col-sm-0 col-form-label">Address</label>
          <div className="col-sm-6">
            <input
              type="text"
              className={`form-control ${isError ? 'is-invalid' : ''}`} // Dynamically add 'is-invalid'
              name="address"
              value={student.address}
              onChange={(e) => {
                handleChange(e);
                setIsError(false);

                if (e.target.value.trim()) {
                  setTouched(false);
                }
              }}
              onBlur={() => {
                if (!student.address.trim()) {
                  setTouched(true);
                  setIsError(true);
                }
              }}
            />
            {/* Display error message  */}
            {touched && !student.address.trim() && (
              <div className="invalid-feedback">Address cannot be empty</div>
            )}
          </div>
        </div>





        {errors.addressError && (
          <div className="alert alert-danger alert-dismissible fade show  p-1 small" role="alert">
            <strong>{errors.addressError}</strong>
            <button type="button" className="btn-close p-2 small" data-bs-dismiss="alert" aria-label="Close" onClick={() => handleCloseError('address')}></button>
          </div>
        )}





        <div className="col-auto">
          <button type="submit" className="btn btn-primary mb-3">
            Submit
          </button>
        </div>

        <div className="col-auto">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/Student_lists/ListStud')}
          >
            Back
          </button>
        </div>


      </form>
    </div>
  );
}

export default UpdateStudent;
