import { Navigate } from 'react-router-dom';
import { isAdmin } from '../lib/auth';

export default function AdminRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/" replace />;
}