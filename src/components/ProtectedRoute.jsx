import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredPermission = null, requiredFeature = null }) => {
  const { currentUser, canAccess, hasPermission, PERMISSIONS } = useAuth()

  // Nếu chưa đăng nhập, chuyển đến trang login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Nếu yêu cầu quyền truy cập feature
  if (requiredFeature && !canAccess(requiredFeature)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    )
  }

  // Nếu yêu cầu permission cụ thể
  if (requiredPermission && requiredFeature && !hasPermission(requiredFeature, requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền</h1>
          <p className="text-gray-600">Bạn không có quyền thực hiện hành động này.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute





