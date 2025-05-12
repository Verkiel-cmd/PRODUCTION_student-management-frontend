import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Webstyles/tailwind.css';
import Frontlog from './Frontlog';
import ListStud from './ListStud';
import CreateStudent from './CreateStudent';
import UpdateStudent from './UpdateStudent';
import Dashboard from './Dashboard';
import Classes from './Classes';
import Forgotpassword from './Forgotpassword';
import ProtectedRoute from './ProtectedRoute'; 






const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="824956744352-a4sj5egukjh1csk8galsalp6v4i73gbq.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/Frontlog" element={<Frontlog />} />
          <Route path="/Forgotpassword" element={<Forgotpassword />} />
          <Route path="/" element={<Frontlog />} />
          {/* Protected Routes */}
          <Route
            path="/ListStud"
            element={
              <ProtectedRoute>
                <ListStud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CreateStudent"
            element={
              <ProtectedRoute>
                <CreateStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UpdateStudent/:id"
            element={
              <ProtectedRoute>
                <UpdateStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Classes"
            element={
              <ProtectedRoute>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
          path="/ProtectedRoute"
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
