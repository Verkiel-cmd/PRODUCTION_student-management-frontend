import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Frontlog from './auth_section/Frontlog';
import ListStud from './Student_lists/ListStud';
import CreateStudent from './Student_lists/CreateStudent';
import UpdateStudent from './Student_lists/UpdateStudent';
import Dashboard from './dashboard_section/Dashboard';
import Classes from './Class_lists/Classes';
import Forgotpassword from './auth_section/Forgotpassword';
import ProtectedRoute from './auth_section/ProtectedRoute'; 





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="824956744352-a4sj5egukjh1csk8galsalp6v4i73gbq.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/auth_section/Frontlog" element={<Frontlog />} />
          <Route path="/auth_section/Forgotpassword" element={<Forgotpassword />} />
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
          path="/auth_section/ProtectedRoute"
          element={
            <ProtectedRoute>
              <ProtectedRoute/>
            </ProtectedRoute>
          }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
