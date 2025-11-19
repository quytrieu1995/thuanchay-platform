import { useState } from 'react'
import { Plus, Search, Edit, Trash2, UserPlus, Shield, User as UserIcon, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Users = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, hasPermission, PERMISSIONS, FEATURES } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'staff',
    isActive: true,
    permissions: {}
  })

  // Kiểm tra quyền
  const canCreate = hasPermission(FEATURES.users, PERMISSIONS.CREATE)
  const canUpdate = hasPermission(FEATURES.users, PERMISSIONS.UPDATE)
  const canDelete = hasPermission(FEATURES.users, PERMISSIONS.DELETE)

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Khởi tạo permissions mặc định cho staff
  const getDefaultPermissions = () => {
    return {
      dashboard: { read: true },
      products: { read: true },
      orders: { read: true },
      returns: { read: true },
      shipping: { read: true },
      customers: { read: true },
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
      pricing: { read: true },
      inventoryCheck: { read: true },
    }
  }

  // Template permissions
  const permissionTemplates = {
    viewOnly: {
      dashboard: { read: true },
      products: { read: true },
      orders: { read: true },
      returns: { read: true },
      shipping: { read: true },
      customers: { read: true },
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
      pricing: { read: true },
      inventoryCheck: { read: true },
    },
    salesStaff: {
      dashboard: { read: true },
      products: { read: true },
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
    warehouseStaff: {
      dashboard: { read: true },
      products: { read: true, update: true },
      orders: { read: true },
      returns: { read: true },
      shipping: { read: true, update: true },
      customers: { read: true },
      inventory: { read: true, update: true },
      suppliers: { read: true },
      purchaseOrders: { read: true },
      supplierReturns: { read: true },
      destroyOrders: { read: true },
      reconciliation: { read: true },
      reports: { read: true },
      analytics: { read: true },
      settings: { read: true },
      users: { read: true },
      pricing: { read: true },
      inventoryCheck: { create: true, read: true, update: true },
    },
  }

  const applyTemplate = (templateName) => {
    if (permissionTemplates[templateName]) {
      setFormData({
        ...formData,
        permissions: { ...permissionTemplates[templateName] }
      })
    }
  }

  const handleAdd = () => {
    if (!canCreate) {
      alert('Bạn không có quyền tạo người dùng mới')
      return
    }
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'staff',
      isActive: true,
      permissions: getDefaultPermissions()
    })
    setShowModal(true)
  }

  const handleEdit = (user) => {
    if (!canUpdate) {
      alert('Bạn không có quyền chỉnh sửa người dùng')
      return
    }
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // Không hiển thị password
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions || getDefaultPermissions()
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa người dùng')
      return
    }
    const result = deleteUser(id)
    if (!result.success) {
      alert(result.message)
    } else {
      alert('Đã xóa người dùng thành công')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        permissions: formData.permissions
      }
      // Chỉ cập nhật password nếu có nhập
      if (formData.password) {
        updateData.password = formData.password
      }
      updateUser(editingUser.id, updateData)
    } else {
      if (!formData.password) {
        alert('Vui lòng nhập mật khẩu')
        return
      }
      addUser(formData)
    }
    setShowModal(false)
  }

  const togglePermission = (feature, permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [feature]: {
          ...formData.permissions[feature],
          [permission]: !formData.permissions[feature]?.[permission]
        }
      }
    })
  }

  // Helper để lấy danh sách permissions có sẵn cho một feature
  const getAvailablePermissions = (feature) => {
    return Object.values(PERMISSIONS).filter(perm => {
      if ((feature === 'dashboard' || feature === 'reports' || feature === 'analytics') && perm !== PERMISSIONS.READ) {
        return false
      }
      if (feature === 'settings' && (perm === PERMISSIONS.CREATE || perm === PERMISSIONS.DELETE)) {
        return false
      }
      return true
    })
  }

  // Kiểm tra xem tất cả permissions của feature đã được chọn chưa
  const hasAllPermissions = (feature, featurePerms) => {
    const availablePerms = getAvailablePermissions(feature)
    return availablePerms.every(perm => featurePerms[perm] === true)
  }

  // Toggle tất cả permissions của một feature
  const toggleAllPermissions = (feature) => {
    const availablePerms = getAvailablePermissions(feature)
    const featurePerms = formData.permissions[feature] || {}
    const allChecked = hasAllPermissions(feature, featurePerms)
    
    const newPerms = {}
    availablePerms.forEach(perm => {
      newPerms[perm] = !allChecked
    })
    
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [feature]: newPerms
      }
    })
  }

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Quản trị viên</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Nhân viên</span>
  }

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Hoạt động</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Vô hiệu hóa</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        {canCreate && (
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Thêm người dùng
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên, email hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-mono text-sm">{user.username}</td>
                  <td className="font-medium">{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.isActive)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDelete && user.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
                              handleDelete(user.id)
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value
                      setFormData({
                        ...formData,
                        role: newRole,
                        permissions: newRole === 'admin' ? {} : getDefaultPermissions()
                      })
                    }}
                    className="input-field"
                  >
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Kích hoạt tài khoản</span>
                </label>
              </div>

              {formData.role === 'staff' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield size={20} />
                      Phân quyền
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Template:</span>
                      <button
                        type="button"
                        onClick={() => applyTemplate('viewOnly')}
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Chỉ xem
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('salesStaff')}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        Nhân viên bán hàng
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('warehouseStaff')}
                        className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      >
                        Nhân viên kho
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(FEATURES).map(([key, feature]) => {
                      const featureLabels = {
                        dashboard: 'Dashboard',
                        products: 'Sản phẩm',
                        orders: 'Đơn hàng',
                        returns: 'Đơn hàng trả',
                        shipping: 'Vận đơn & Giao hàng',
                        customers: 'Khách hàng',
                        inventory: 'Tồn kho',
                        suppliers: 'Nhà cung cấp',
                        purchaseOrders: 'Nhập hàng',
                        supplierReturns: 'Trả hàng NCC',
                        destroyOrders: 'Xuất hủy',
                        reconciliation: 'Đối soát',
                        reports: 'Báo cáo',
                        analytics: 'Phân tích',
                        settings: 'Cài đặt',
                        users: 'Người dùng',
                        pricing: 'Thiết lập giá',
                        inventoryCheck: 'Kiểm kho & Cân kho',
                      }
                      
                      const featurePerms = formData.permissions[feature] || {}
                      
                      return (
                        <div key={feature} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">{featureLabels[feature] || feature}</div>
                            <button
                              type="button"
                              onClick={() => toggleAllPermissions(feature)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {hasAllPermissions(feature, featurePerms) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            {Object.entries(PERMISSIONS).map(([key, perm]) => {
                              const permLabels = {
                                create: 'Tạo',
                                read: 'Xem',
                                update: 'Sửa',
                                delete: 'Xóa',
                              }
                              
                              // Một số feature chỉ có read
                              if ((feature === 'dashboard' || feature === 'reports' || feature === 'analytics') && perm !== PERMISSIONS.READ) {
                                return null
                              }
                              
                              // Settings chỉ có read và update
                              if (feature === 'settings' && (perm === PERMISSIONS.CREATE || perm === PERMISSIONS.DELETE)) {
                                return null
                              }
                              
                              return (
                                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={featurePerms[perm] || false}
                                    onChange={() => togglePermission(feature, perm)}
                                    className="w-4 h-4 text-primary-600 rounded"
                                  />
                                  <span className="text-sm text-gray-700">{permLabels[perm]}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users





