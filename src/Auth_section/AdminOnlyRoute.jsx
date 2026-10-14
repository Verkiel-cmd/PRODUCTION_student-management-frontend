import { Navigate } from 'react-router-dom';
import useAuth from '../Hooks/UseAuth';

const AdminOnlyRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <Navigate to="/Student_lists/ListStud" replace />;
  }
  
  return children;
};

export default AdminOnlyRoute;