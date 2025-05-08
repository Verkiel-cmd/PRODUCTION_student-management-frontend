import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Webstyles/DES_side.css';
import DeleteModal from './DeleteModel';
import config from './config';
import axios from 'axios';

function ListStud() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => localStorage.getItem("sidebarState") === "expanded");
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(() => localStorage.getItem("authDropdownState") === "expanded");
  const [isMultiDropdownOpen, setIsMultiDropdownOpen] = useState(() => localStorage.getItem("multiDropdownState") === "expanded");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    axios.post(`${config.API_URL}/logout`, {}, { withCredentials: true })
      .then(() => {
        console.log('User logged out successfully');
        navigate('/Frontlog');
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery) ||
        student.email.toLowerCase().includes(searchQuery)
    );
    setFilteredStudents(filtered);
  };

  const handleDeleteClick = (id) => {
    setStudentToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
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

      const updatedStudents = students.filter((student) => student.id !== id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error deleting student: ' + error.message);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarState", newState ? "expanded" : "collapsed");
      return newState;
    });
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleAuthDropdownClick = () => {
    setIsAuthDropdownOpen(prev => {
      const newState = !prev;
      localStorage.setItem("authDropdownState", newState ? "expanded" : "collapsed");
      if (isMultiDropdownOpen) {
        setIsMultiDropdownOpen(false);
        localStorage.setItem("multiDropdownState", "collapsed");
      }
      return newState;
    });
  };

  const handleMultiDropdownClick = () => {
    setIsMultiDropdownOpen(prev => {
      const newState = !prev;
      localStorage.setItem("multiDropdownState", newState ? "expanded" : "collapsed");
      if (isAuthDropdownOpen) {
        setIsAuthDropdownOpen(false);
        localStorage.setItem("authDropdownState", "collapsed");
      }
      return newState;
    });
  };

  // Fetch students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/students?search=${searchTerm}`);
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        setError('Error fetching student data.');
      }
    };
    fetchData();
  }, [searchTerm]); // Only re-fetch when searchTerm changes

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setLoggedInUser(userData);
        } else {
          const res = await fetch(`${config.API_URL}/api/user-details`, { 
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          if (!res.ok) throw new Error('Failed to fetch user details');
          const data = await res.json();
          if (data.user) {
            setLoggedInUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoggedInUser(null);
        localStorage.removeItem('user');
      }
    };

    fetchUserDetails();
  }, []); // Only run once on mount

  return (
    <div className={`wrapper ${isSidebarExpanded ? "expanded" : ""}`}>
      <aside id="sidebar" className={isSidebarExpanded ? "expand" : ""}>
        <div className="d-flex">
          <button id="toggle-btn" type="button" onClick={toggleSidebar}>
            <i className="lni lni-grid-alt"></i>
          </button>
          <div className="sidebar-logo">
            <a href="#">Veracity</a>
          </div>
        </div>
        <ul className="sidebar-nav">

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Dashboard" : ""} >
            <Link to="/Dashboard" className="sidebar-link">
              <i className="lni lni-users"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Classes" : ""}>
            <Link to="/Classes" className="sidebar-link">
              <i className="lni lni-layout"></i>
              <span>Classes</span>
            </Link>
          </li>


          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Lists" : ""}>
            <Link to="/ListStud" className="sidebar-link">
              <i className="lni lni-agenda"></i>
              <span>Lists</span>
            </Link>
          </li>

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Auth" : ""}>
            <a href="#" className="sidebar-link has-dropdown" onClick={handleAuthDropdownClick}>
              <i className="lni lni-protection"></i>
              <span>Auth</span>
              {isSidebarExpanded && (
                <i className={`lni lni-chevron-${isAuthDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '-3rem' }}></i>
              )}
            </a>
            <ul className={`sidebar-dropdown list-unstyled ${isAuthDropdownOpen ? 'show' : ''}`}>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Login</a>
              </li>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Register</a>
              </li>
            </ul>
          </li>

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Multi" : ""}>
            <a href="#" className="sidebar-link has-dropdown" onClick={handleMultiDropdownClick}>
              <i className="lni lni-layout"></i>
              <span>Multi</span>
              {isSidebarExpanded && (
                <i className={`lni lni-chevron-${isMultiDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '-3rem' }}></i>
              )}
            </a>
            <ul className={`sidebar-dropdown list-unstyled ${isMultiDropdownOpen ? 'show' : ''}`}>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Link 1</a>
              </li>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Link 2</a>
              </li>
            </ul>
          </li>


          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Notification" : ""}>
            <a href="#" className="sidebar-link">
              <i className="lni lni-popup"></i>
              <span>Notification</span>
            </a>
          </li>

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Settings" : ""}>
            <a href="#" className="sidebar-link">
              <i className="lni lni-cog"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>


      </aside>


      <div className="TOP">
        <div className="text-center">
          <div className="top-bar">
            <h1 className="title">UNIVERSITY VERACITY</h1>
          </div>
        </div>

        <div className="position-fixed top-0 end-0 mt-2 me-3" style={{ zIndex: 3100 }}>
          {/* Profile Button */}
          <button
            className="d-flex justify-between align-items-center px-3 py-2 rounded shadow-lg bg-white text-dark border border-gray-300"
            onClick={toggleProfileDropdown}
          >
            <span
              className="fw-semibold text-dark bg-white px-2 py-0.5 rounded-lg"
              style={{ marginRight: '8px' }}
            >
              {loggedInUser?.username || "Guest"}
            </span>
            <i className={`lni lni-chevron-${isProfileDropdownOpen ? "up" : "down"} fs-5`}></i>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <ul
              className="dropdown-menu show position-absolute end-0 mt-2 bg-white shadow-lg rounded border border-gray-300"
              style={{ zIndex: 3100 }}
            >
              <li>
                <a
                  href="#"
                  className="dropdown-item px-3 py-2 text-dark hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="dropdown-item px-3 py-2 text-dark hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={handleLogout}
                >
                  Logout
                </a>
              </li>
            </ul>
          )}
        </div>






        <div className="list_table" 
        style={{ 
          marginTop: '10vh',
          marginInlineStart: '8rem',
          marginInlineEnd: '3rem',
          maxHeight: '700px', 
          overflowY: 'auto',
          background: '#28282B', 
          borderRadius: '10px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '30px'}}>

          <h5 className="text-start " 
          style={{ 
            paddingTop: '20px', 
            paddingBottom: '1rem', 
            color: 'white'
            }}>List of Students</h5>

          <div className="gap" 
          style={{ 
            marginBottom: '-15px', }}>

            <Link className="btn btn-primary d-flex justify-content-center align-items-center" to="/createStudent" role="button">
              New Student
            </Link>
            <br />
          </div>




          <form id="search">
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search keywords..."
                aria-label="Search keywords..."
                aria-describedby="search-button"
              />
              <div className="mb-0">
                <button className="btn btn-primary " type="submit" id="search-button" onClick={handleSearch} style={{ borderRadius: '3px' }}>
                  Search
                </button>
              </div>
            </div>
          </form>

          <div className="table-responsive" 
          style=
          {{ maxHeight: '700px',
            overflowY: 'auto',
            borderRadius: '10px',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            borderTopRightRadius: '10px',   }}>
            <table className="table" >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

                {error && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'red' }}>
                      {error}
                    </td>
                  </tr>
                )}


                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.address}</td>
                      <td>{student.created}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link className="btn btn-primary btn-sm me-2 d-flex justify-content-center align-items-center" to={`/UpdateStudent/${student.id}`}>
                            Update
                          </Link>
                          <button
                            className="btn btn-danger mt-"
                            onClick={() => handleDeleteClick(student.id)}
                          >

                            Delete

                          </button>
                        </div>

                      </td>

                    </tr>
                  ))


                ) : (

                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'red' }}>
                      No matching records found
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

            {/* Delete Confirmation Modal */}
            <DeleteModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              handleDelete={handleDelete}
              studentId={studentToDelete}
            />


          </div>
        </div>
        <div className="doggy">
            <h1>scroll_test</h1>
          </div>
      </div>
    </div>
  );
}

export default ListStud;