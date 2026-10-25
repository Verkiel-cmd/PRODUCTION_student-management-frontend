import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import '../Webstyles/main_side.css';
import DeleteModal from './DeleteModel';
import config from '../Auth_section/config';
import axios from 'axios';
import usePullToRefresh from '../Hooks/Refreshpull';
import useAuth from '../Hooks/UseAuth';
import { useCallback } from 'react';


function ListStud() {

  console.log('BUILD CHECK v3');

  const { isAdmin } = useAuth();

  const [notifs, setnotifs] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem('notifLastSeen')) || 0);
  const unreadCount = notifs.filter(n => new Date(n.createdAt).getTime() > lastSeen).length;

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
  /* darkmode state - UNUSED/USED-VARIABLE RECYCLED */
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkModeState") === "enabled");

  /*darkmode*/
  //const [showSettings, setShowSettings] = useState(false);
  //const toggleSettings = () => setShowSettings(!showSettings);
  /*UNUSED/USED-VARIABLE_ RECYCLE——————————————————————————————————*/ 
  // eslint-disable-next-line no-unused-vars
  const toggleDark = () => {
  setDarkMode((prev) => {
    const next = !prev;
    localStorage.setItem("darkModeState", next ? "enabled" : "disabled");
    document.documentElement.classList.toggle("dark-mode-body", darkMode);
    document.documentElement.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("dark-mode-body", next);
    document.body.classList.toggle("dark-mode", next);
    return next;
  });
};

useEffect(() => {
    document.documentElement.classList.toggle("dark-mode-body", darkMode);
    document.documentElement.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("dark-mode-body", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
}, [darkMode]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${config.API_URL}/logout`, {}, { withCredentials: true });
      localStorage.removeItem('user');
      navigate('/Auth_section/Frontlog', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem('user');
      navigate('/Auth_section/Frontlog', { replace: true });
    }
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
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      const updatedStudents = students.filter((student) => student.id !== id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);

      //Modal transtion off after clicking delete or performed it
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

  const toggleNotifDropdown = () => {
  setIsNotifOpen(prev => !prev);
  setIsProfileDropdownOpen(false);

  // ADD: opening the bell marks everything as seen
  const newest = Math.max(0, ...notifs.map(n => new Date(n.createdAt).getTime()));
  localStorage.setItem('notifLastSeen', String(newest));
  setLastSeen(newest);
};

// ADD: click a notification -> close the menu and go to its page
const handleNotifClick = (n) => {
  setIsNotifOpen(false);
  navigate(n.type === 'class' ? '/Class_lists/Classes' : '/Student_lists/ListStud');
};

  // Fetch students data
    const fetchData = useCallback(async () => {
      try {
        const response = await fetch(`${config.API_URL}/students?search=${searchTerm}`, {
            credentials: 'include',  // ← ADD THIS OPTION
        });
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error(error);
        setError('Error fetching student data.');
      }
    }, [searchTerm]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

const { pulling, refreshing } = usePullToRefresh(fetchData);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // First check localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && typeof userData === 'object') {
              setLoggedInUser(userData);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
          }
        }

        // If no valid user in localStorage, try API
        const res = await fetch(`${config.API_URL}/api/user-details`, { 
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await res.json();
        if (data.user) {
          setLoggedInUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          throw new Error('No user data in response');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoggedInUser(null);
        localStorage.removeItem('user');
        navigate('/auth_section/Frontlog', { replace: true });
      }
    };

    fetchUserDetails();
  }, [navigate]); // Add navigate to dependencies

  return (
    

        <div className={`wrapper ${isSidebarExpanded ? "expanded" : ""} ${darkMode ? "dark-mode" : ""}`}>
          <aside id="sidebar" className={isSidebarExpanded ? "expand" : ""}>
            
          <div className="sidebar-top"> {/* NEW container — non-scrollable */}
          <div className="d-flex">
            <button id="toggle-btn" type="button" onClick={toggleSidebar}>
              <i className="lni lni-grid-alt"></i>
            </button>
            <div className="sidebar-logo">
              <a href="#">Veracity</a>
            </div>
          </div>
        </div>{/* NEW container — non-scrollable */}

          <ul className="sidebar-nav">

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Dashboard" : ""} >
            <Link to="/dashboard_section/Dashboard" className="sidebar-link">
              <i className="lni lni-users"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Classes" : ""}>
            <Link to="/Class_lists/Classes" className="sidebar-link">
              <i className="lni lni-layout"></i>
              <span>Classes</span>
            </Link>
          </li>

          {/* ──────────────── ADMIN HERE ──────────────── */}
            {isAdmin && (
              <>
                <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Invite Admin" : ""}>
                  <Link to="/Admin_section/InviteAdmin" className="sidebar-link">
                    <i className="bx bx-user-plus"></i>
                    <span>Invite Admin</span>
                  </Link>
                </li>
                <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Admin Panel" : ""}>
                  <Link to="/Admin_section/SuperAdminPanel" className="sidebar-link">
                    <i className="lni lni-shield"></i>
                    <span>Admin Panel</span>
                  </Link>
                </li>
              </>
            )}
          {/* ───────────────────────────────────────────── */}


          <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Lists" : ""}>
            <Link to="/Student_lists/ListStud" className="sidebar-link">
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

            {/**<!--————————————————————————————————————————————————————————————————————————————————————————————————————————————
                    ———————————————————————————————————————————————————————————————————————————————————————————————————————————— --> */}
            {/*<!-- Section where you can adjust the padding all sides using the class "sidebar-dropdown" on wrapped "<ul>" does not work
                     if you directly apply on "sidebar-item" cos it was wrappped by parent class named "sidebar-dropdown" so use the selector "sidebar-dropdown .sidebar-item" -->*/}

            <ul className={`sidebar-dropdown list-unstyled ${isAuthDropdownOpen ? 'show' : ''}`}>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Login</a>
              </li>
              <li className="sidebar-item">
                <a href="#" className="sidebar-link">Register</a>
              </li>
            </ul>
          </li>

          {/**  <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————————————
                     ——————————————————————————————————————————————————————————————————————————————————————————————————————————— --> */}

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
            <a href="/Notification/Notification" className="sidebar-link">
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


        <div className="TOP" style={{
              backgroundColor: darkMode ? '#0a0a0a' : 'white'
          }}>
            <div className="text-center">
              <div className="top-bar">
                <h1 className="title"  style={{
                    color: darkMode ? '#ffffff' : 'white'
                  }}>UNIVERSITY VERACITY</h1>
              </div>
            </div>
        

        


        <div className="position-fixed top-0 end-0 mt-2 me-3 d-flex align-items-start gap-2 notif-row" style={{ zIndex: 3100 }}>

    


        {/* SAME AS ListStud: one position-fixed div, no extra row around it */}
        <div className="position-fixed top-0 end-0 mt-2 me-3 notif-top" style={{ zIndex: 3100 }}>

        {/* ADD 1: BELL BUTTON. Goes first, so it sits left of the profile button */}
            {/* BELL: plain CSS classes only */}
            <button type="button" className="notif-bell" onClick={toggleNotifDropdown} aria-label="Notifications">
            <i className="lni lni-popup"></i>
           {/* CHANGED: was notifs.length. Now only unread ones count, and it hides at 0 */}
            {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
            
            </button>
        {/* END ADD 1 */}

          {/* Profile Button */}
          <button
            className="profile-btn d-flex justify-between align-items-center px-3 py-2 rounded shadow-lg bg-white text-dark border border-gray-300"
            onClick={toggleProfileDropdown}
          >
            <span
              className="username-badge fw-semibold text-dark bg-white px-2 py-0.5 rounded-lg"
              style={{
                 marginRight: '8px',
                 maxWidth: '140px',
                 display: 'inline-block',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis',
                 whiteSpace: 'nowrap',
               }}
          >
             {loggedInUser?.username || "Guest"}
          </span>
          <div className= "profile-link">
            <i className={`lni lni-chevron-${isProfileDropdownOpen ? "up" : "down"} fs-5`}></i>
            </div>
          </button>
          

         
          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <ul
              className="profile-dropdown dropdown-menu show position-absolute end-0 mt-2 bg-white shadow-lg rounded border border-gray-300"
              style={{ zIndex: 3100 }}
            >

             <li>
           <button
               //onClick={toggleSettings}
               onClick={() => navigate('/Settings_section/Settings')}
               className="dropdown-item px-3 py-2 text-dark w-100 fs-6 text-start"
            >
                 Settings
             </button>
            </li>

              <li>
                <button
                  href="/"
                  className="dropdown-item px-3 py-2 w-100 fs-6 text-start text-dark"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>


         {/* ADD 2: NOTIFICATION DROPDOWN. It is position: fixed in CSS, so it doesn't affect the layout */}
          {isNotifOpen && (
            <div className="notif-menu">
              <div className="notif-menu-title">Notifications</div>
              {notifs.length === 0 && <div className="notif-menu-item">No notifications yet.</div>}
              {notifs.map((n, i) => (

                // CHANGED: was a plain <div>. Now a <button> so it's clickable and keyboard accessible
                <button
                    key={i}
                    type="button"
                    className="notif-menu-item notif-menu-click"
                    onClick={() => handleNotifClick(n)}
                >
                    <strong>{n.message}</strong>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                </button>
                ))}
                </div>
          )}
          {/* END ADD 2 */}

        </div>
        {/* the profile div closes HERE, before the list */}
        

        
        




        <div className="list_table" 
        style={{ 
          background: darkMode ? '#1a1a1a' : 'white', }}>

          {/*REFRESHER — list_table opens */}
          {(pulling || refreshing) && (
            <div className="pull-refresh">
              <div className="spinner"></div>
              <span className="pull-text">
                {refreshing ? 'Refreshing...' : 'Pull to refresh'}
              </span>
            </div>
          )}

          <h5 className="text-start" 
           style={{ 
           paddingTop: '20px', 
           paddingBottom: '1rem', 
           color: darkMode ? 'white' : 'black'
          }}>
          List of Students
         </h5>

          <div className="gap" 
          style={{ 
            marginBottom: '-15px', }}>
              
              {isAdmin && (
                <Link className="btn btn-primary d-flex justify-content-center align-items-center" to="/Student_lists/CreateStudent" role="button">
                  New Student
                </Link>
              )}
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
                <button className="search-design btn btn-primary " type="submit" id="search-button" onClick={handleSearch}>
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













            {/*TABEL MAIN HEAD ADJUSTMENT INSIDE LISTSTUD*/}
            <table className="table" style={{
             color: darkMode ? 'white' : 'black'
           }}> 
              <thead>
                <tr style={{
                    backgroundColor: darkMode ? '#000000' : '#28282B'
          }}>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Created At</th>
                  {isAdmin && <th>Action</th>}
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


                {/* DISPLAY DATA FROM API AND STYLE ADJUSTMENTS */}
                {/* ===== required fix so rounded corners show ===== 
                .table {
                  border-collapse: separate;
                  border-spacing: 0;
                }

                /* ===== each cell styled individually ===== 

                /* line 1 — the ID cell 
                .table tbody td.cell-id {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }

                /* line 2 — the Name cell 
                .table tbody td.cell-name {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }

                /* line 3 — the Email cell 
                .table tbody td.cell-email {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }

                /* line 4 — the Phone cell 
                .table tbody td.cell-phone {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }

                /* line 5 — the Address cell 
                .table tbody td.cell-address {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }

                /* line 6 — the Created At (date) cell 
                .table tbody td.cell-date {
                  background-color: rgba(0, 128, 0, 0.3);
                  border: 2px solid green;
                  border-radius: 10px;
                  color: #0b5e0b;
                }*/
                }
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="cell-id"     data-label="ID">{student.id}</td>
                      <td className="cell-name"   data-label="Name">{student.name}</td>
                      <td className="cell-email"  data-label="Email">{student.email}</td>
                      <td className="cell-phone"  data-label="Phone">{student.phone}</td>
                      <td className="cell-address" data-label="Address">{student.address}</td>
                      <td className="cell-date"   data-label="Created At">
                         <span className="date-pill">
                        {new Date(student.created_at).toLocaleDateString()}
                        </span>
                        </td>

                        {isAdmin && (
                          <td className="cell-actions" data-label="Actions">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="primary" className="btn btn-primary btn-sm" onClick={() => navigate(`/Student_lists/UpdateStudent/${student.id}`)}>Update</Button>
                             <Button variant="danger" className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(student.id)}>Delete</Button>
                        </div>
                      </td>
                        )}

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
              darkMode={darkMode}
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