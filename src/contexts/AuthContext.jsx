import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Các chức năng trong hệ thống
export const FEATURES = {
  dashboard: 'dashboard',
  products: 'products',
  orders: 'orders',
  returns: 'returns',
  shipping: 'shipping',
  customers: 'customers',
  inventory: 'inventory',
  suppliers: 'suppliers',
  purchaseOrders: 'purchaseOrders',
  supplierReturns: 'supplierReturns',
  destroyOrders: 'destroyOrders',
  reconciliation: 'reconciliation',
  reports: 'reports',
  analytics: 'analytics',
  settings: 'settings',
  users: 'users',
  pricing: 'pricing',
  inventoryCheck: 'inventoryCheck',
}

// Các quyền CRUD
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
}

// Khởi tạo user mặc định (admin)
const getDefaultUsers = () => {
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123', // Trong thực tế nên hash password
      fullName: 'Quản trị viên',
      email: 'admin@example.com',
      phone: '0901234567',
      role: 'admin',
      permissions: {
        // Admin có tất cả quyền
        dashboard: { read: true },
        products: { create: true, read: true, update: true, delete: true },
        orders: { create: true, read: true, update: true, delete: true },
        returns: { create: true, read: true, update: true, delete: true },
        shipping: { create: true, read: true, update: true, delete: true },
        customers: { create: true, read: true, update: true, delete: true },
        inventory: { create: true, read: true, update: true, delete: true },
        suppliers: { create: true, read: true, update: true, delete: true },
        purchaseOrders: { create: true, read: true, update: true, delete: true },
        supplierReturns: { create: true, read: true, update: true, delete: true },
        destroyOrders: { create: true, read: true, update: true, delete: true },
        reconciliation: { create: true, read: true, update: true, delete: true },
        reports: { read: true },
        analytics: { read: true },
        settings: { read: true, update: true },
        users: { create: true, read: true, update: true, delete: true },
        pricing: { create: true, read: true, update: true, delete: true },
        inventoryCheck: { create: true, read: true, update: true, delete: true },
      },
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'staff',
      password: 'staff123',
      fullName: 'Nhân viên',
      email: 'staff@example.com',
      phone: '0901234568',
      role: 'staff',
      permissions: {
        dashboard: { read: true },
        products: { read: true, update: true },
        orders: { create: true, read: true, update: true },
        returns: { create: true, read: true, update: true },
        shipping: { read: true, update: true },
        customers: { create: true, read: true, update: true },
        inventory: { read: true },
        suppliers: { read: true },
        purchaseOrders: { read: true },
        supplierReturns: { read: true },
        destroyOrders: { read: true },
        reconciliation: { read: true },
        reports: { read: true },
        analytics: { read: true },
        settings: { read: true },
        users: { read: true },
        pricing: { read: true, update: true },
        inventoryCheck: { create: true, read: true, update: true },
      },
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]
  
  // Lưu vào localStorage nếu chưa có
  const savedUsers = localStorage.getItem('users')
  if (!savedUsers) {
    localStorage.setItem('users', JSON.stringify(defaultUsers))
    return defaultUsers
  }
  
  return JSON.parse(savedUsers)
}

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => getDefaultUsers())
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  // Lưu users vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  // Lưu currentUser vào localStorage khi thay đổi
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  // Đăng nhập
  const login = (username, password) => {
    const user = users.find(
      u => u.username === username && u.password === password && u.isActive
    )
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      setCurrentUser(userWithoutPassword)
      return { success: true, user: userWithoutPassword }
    }
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' }
  }

  // Đăng xuất
  const logout = () => {
    setCurrentUser(null)
  }

  // Kiểm tra quyền
  const hasPermission = (feature, permission) => {
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true // Admin có tất cả quyền
    return currentUser.permissions[feature]?.[permission] === true
  }

  // Kiểm tra có quyền truy cập feature không
  const canAccess = (feature) => {
    return hasPermission(feature, PERMISSIONS.READ)
  }

  // Thêm user mới
  const addUser = (userData) => {
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    return newUser
  }

  // Cập nhật user
  const updateUser = (id, userData) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u))
    // Nếu đang cập nhật user hiện tại, cập nhật currentUser
    if (currentUser && currentUser.id === id) {
      const updatedUser = users.find(u => u.id === id)
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = { ...updatedUser, ...userData }
        setCurrentUser(userWithoutPassword)
      }
    }
  }

  // Xóa user
  const deleteUser = (id) => {
    if (id === currentUser?.id) {
      return { success: false, message: 'Không thể xóa tài khoản đang đăng nhập' }
    }
    setUsers(users.filter(u => u.id !== id))
    return { success: true }
  }

  const value = {
    currentUser,
    users,
    login,
    logout,
    hasPermission,
    canAccess,
    addUser,
    updateUser,
    deleteUser,
    FEATURES,
    PERMISSIONS,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

