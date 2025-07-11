import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import BackendDiagnostic from '@/components/admin/BackendDiagnostic';

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only allow specific admin users (you can customize this logic)
  const isAdmin = user?.email === 'ucchishth31@gmail.com';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <BackendDiagnostic />;
};

export default Admin;