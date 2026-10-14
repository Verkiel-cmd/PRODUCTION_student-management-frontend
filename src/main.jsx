import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import config from './Auth_section/config';
import Frontlog from './Auth_section/Frontlog';
import ListStud from './Student_lists/ListStud';
import CreateStudent from './Student_lists/CreateStudent';
import UpdateStudent from './Student_lists/UpdateStudent';
import Dashboard from './Dashboard_section/Dashboard';
import Classes from './Class_lists/Classes';
import Settings from './Settings_section/Settings';
import Forgotpassword from './Auth_section/Forgotpassword';
import ProtectedRoute from './Auth_section/ProtectedRoute'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import InviteAdmin from './Admin_section/InviteAdmin';
import AdminOnlyRoute from './Auth_section/AdminOnlyRoute';
import SuperAdminPanel from './Admin_section/SuperAdminPanel';





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/Auth_section/Frontlog" element={<Frontlog />} />
          <Route path="/Auth_section/Forgotpassword" element={<Forgotpassword />} />
          <Route path="/" element={<Frontlog />} />
          {/* Protected Routes */}
          <Route
            path="/Student_lists/ListStud"
            element={
              <ProtectedRoute>
                <ListStud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Student_lists/CreateStudent"
            element={
              <ProtectedRoute>
                <CreateStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Student_lists/UpdateStudent/:id"
            element={
              <ProtectedRoute>
                <UpdateStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard_section/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Class_lists/Classes"
            element={
              <ProtectedRoute>
                <Classes />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/Settings_section/Settings"
            element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

          <Route
          path="/Auth_section/ProtectedRoute"
          element={
            <ProtectedRoute>
              <ProtectedRoute/>
            </ProtectedRoute>
          }
          />

          <Route
          path="/Admin_section/SuperAdminPanel"
          element={
            <ProtectedRoute>
              <AdminOnlyRoute>
                <SuperAdminPanel />
              </AdminOnlyRoute>
            </ProtectedRoute>
          }
        />

          <Route
          path="/Admin_section/InviteAdmin"
          element={
            <ProtectedRoute>
              <AdminOnlyRoute>
                <InviteAdmin />
            </AdminOnlyRoute>
          </ProtectedRoute>
        }
      />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
