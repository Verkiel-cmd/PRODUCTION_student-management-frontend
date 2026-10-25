import { useEffect, useState } from 'react';
//import config from '../Auth_section/config';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../Hooks/UseAuth'; 
import '../Webstyles/notification.css';
import axios from 'axios';


function Notification() {

const { isAdmin } = useAuth();

const [notifs, setnotifs] = useState([]);
const [isNotifOpen, setIsNotifOpen] = useState(false);

const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem('notifLastSeen')) || 0);
const unreadCount = notifs.filter(n => new Date(n.createdAt).getTime() > lastSeen).length;

const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => localStorage.getItem("sidebarState") === "expanded");
const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(() => localStorage.getItem("authDropdownState") === "expanded");
const [isMultiDropdownOpen, setIsMultiDropdownOpen] = useState(() => localStorage.getItem("multiDropdownState") === "expanded");
const [loggedInUser, setLoggedInUser] = useState([null]); // Store logged-in user details
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
      await axios.post(`/logout`, {}, { 
        withCredentials: true 
      });
      
      localStorage.removeItem('user');
      navigate('/auth_section/Frontlog', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem('user');
      navigate('/auth_section/Frontlog', { replace: true });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarState", newState ? "expanded" : "collapsed");
      return newState;
    });
  };

  // Toggle profile dropdown
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
        const res = await fetch(`/api/user-details`, { 
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
  


useEffect(() => {
// HTML: Fetch and render notifications
async function loadNotifications() {
  try {
    const res = await fetch('/notification', { 
        credentials: 'include' 
    });

    const data = await res.json();
    setnotifs(data.data || []);
  } catch (e) {
    console.error('Failed to load notifications:', e); 
}
}

  loadNotifications();
  }, []);



    return(

        
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

        {/* CHANGED: added "notif-top" at the end. Everything else is the same as ListStud */}
        <div className="position-fixed top-0 end-0 mt-2 me-3 notif-top" style={{ zIndex: 3100 }}></div>


     
        <ul className="notif-list">
        {notifs.length === 0 && <li>No notifications yet.</li>}
        {notifs.map((n, i) => (
            <li key={i}><strong>{n.message}</strong> <small>— {new Date(n.createdAt).toLocaleString()}</small></li>
        ))}

            </ul>
        </div>
    </div>
            
            
                

    );
}

export default Notification;