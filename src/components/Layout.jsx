import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getCurrentVersion } from '../services/versionService'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RotateCcw,
  Truck,
  Building2,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  FileCheck,
  Users,
  Warehouse,
  BarChart3,
  TrendingUp,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  UserCog,
  SunMedium,
  MoonStar,
  Sparkles,
  Plus,
  ChevronDown,
  Store,
  Tag,
  Scale,
} from 'lucide-react'
import {
  getInAppNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  subscribeNotificationUpdates,
} from '../services/notificationService'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(() => getInAppNotifications())
  const notificationPanelRef = useRef(null)
  const quickActionsRef = useRef(null)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, canAccess, FEATURES } = useAuth()
  const { theme, toggleMode } = useTheme()
  const isDark = theme.mode === 'dark'
  const isClient = typeof window !== 'undefined'
  const isExpanded = !sidebarCollapsed || mobileNavOpen

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const update = () => setNotifications(getInAppNotifications())
    update()
    const unsubscribe = subscribeNotificationUpdates(update)
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (!showNotifications) return
    const handleClickOutside = (event) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  useEffect(() => {
    if (!showQuickActions) return
    const handleClickOutside = (event) => {
      if (
        quickActionsRef.current &&
        !quickActionsRef.current.contains(event.target)
      ) {
        setShowQuickActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showQuickActions])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read),
    [notifications]
  )
  const unreadCount = unreadNotifications.length

  const formatNotificationTime = (value) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    } catch {
      return value
    }
  }

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id)
    setNotifications(getInAppNotifications())
    setShowNotifications(false)
    if (notification.meta?.orderId) {
      navigate('/orders', { state: { orderId: notification.meta.orderId } })
    } else if (notification.meta?.shipmentId || notification.meta?.carrierId) {
      navigate('/shipping')
    }
  }

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    setNotifications(getInAppNotifications())
  }

  const handleClearNotifications = () => {
    clearNotifications()
    setNotifications([])
  }

  const quickActions = useMemo(() => [
    {
      id: 'create-order',
      label: 'Tạo đơn + vận đơn',
      description: 'Lập đơn hàng mới và sinh vận đơn tức thì',
      path: '/orders/create',
      icon: Package,
    },
    {
      id: 'create-customer',
      label: 'Thêm khách hàng',
      description: 'Tạo hồ sơ khách hàng mới',
      path: '/customers',
      icon: Users,
    },
    {
      id: 'create-product',
      label: 'Thêm sản phẩm',
      description: 'Cập nhật danh mục hàng hóa',
      path: '/products',
      icon: LayoutDashboard,
    },
  ], [])

  const handleQuickAction = (action) => {
    setShowQuickActions(false)
    if (action.path === '/customers') {
      navigate('/customers', { state: { openCreate: true } })
    } else if (action.path === '/products') {
      navigate('/products', { state: { openCreate: true } })
    } else {
      navigate(action.path)
    }
  }

  // Menu được sắp xếp theo nhóm logic
  const allMenuGroups = [
    {
      title: 'Tổng quan',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', feature: FEATURES.dashboard },
      ],
    },
    {
      title: 'Bán hàng',
      items: [
        { path: '/pos', icon: Store, label: 'Bán tại quầy', feature: FEATURES.orders },
        { path: '/orders', icon: ShoppingCart, label: 'Đơn hàng', feature: FEATURES.orders },
        { path: '/returns', icon: RotateCcw, label: 'Đơn hàng trả', feature: FEATURES.returns },
        { path: '/shipping', icon: Truck, label: 'Vận đơn & Giao hàng', feature: FEATURES.shipping },
        { path: '/customers', icon: Users, label: 'Khách hàng', feature: FEATURES.customers },
      ],
    },
    {
      title: 'Sản phẩm & Kho',
      items: [
        { path: '/products', icon: Package, label: 'Sản phẩm', feature: FEATURES.products },
        { path: '/inventory', icon: Warehouse, label: 'Tồn kho', feature: FEATURES.inventory },
        { path: '/pricing', icon: Tag, label: 'Thiết lập giá', feature: FEATURES.pricing },
        { path: '/inventory-check', icon: Scale, label: 'Kiểm kho & Cân kho', feature: FEATURES.inventoryCheck },
      ],
    },
    {
      title: 'Nhà cung cấp',
      items: [
        { path: '/suppliers', icon: Building2, label: 'Nhà cung cấp', feature: FEATURES.suppliers },
        { path: '/purchase-orders', icon: ArrowDownCircle, label: 'Nhập hàng', feature: FEATURES.purchaseOrders },
        { path: '/supplier-returns', icon: ArrowUpCircle, label: 'Trả hàng NCC', feature: FEATURES.supplierReturns },
        { path: '/destroy-orders', icon: Trash2, label: 'Xuất hủy', feature: FEATURES.destroyOrders },
      ],
    },
    {
      title: 'Báo cáo & Cài đặt',
      items: [
        { path: '/reconciliation', icon: FileCheck, label: 'Đối soát', feature: FEATURES.reconciliation },
        { path: '/reports', icon: BarChart3, label: 'Báo cáo', feature: FEATURES.reports },
        { path: '/analytics', icon: TrendingUp, label: 'Phân tích và dự đoán', feature: FEATURES.analytics },
        { path: '/settings', icon: Settings, label: 'Cài đặt', feature: FEATURES.settings },
        { path: '/users', icon: UserCog, label: 'Người dùng', feature: FEATURES.users },
      ],
    },
  ]

  // Lọc menu theo quyền
  const menuGroups = allMenuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => canAccess(item.feature)),
    }))
    .filter(group => group.items.length > 0)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout()
      navigate('/login')
    }
  }

  const handleSidebarToggle = () => {
    if (isClient && window.innerWidth < 1024) {
      setMobileNavOpen(prev => !prev)
    } else {
      setSidebarCollapsed(prev => !prev)
    }
  }

  const openMobileNav = () => {
    if (isClient && window.innerWidth < 1024) {
      setMobileNavOpen(true)
    } else {
      setSidebarCollapsed(false)
    }
  }

  const closeMobileNav = () => setMobileNavOpen(false)

  const getUserInitials = () => {
    if (currentUser?.fullName) {
      return currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return currentUser?.username?.substring(0, 2).toUpperCase() || 'U'
  }

  // Component hiển thị version
  const VersionFooter = () => {
    const currentVersion = getCurrentVersion()
    return (
      <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-100 to-blue-100 p-4 transition-colors duration-300 dark:border-primary-500 dark:from-sky-600 dark:to-sky-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-200">
          Release
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Phiên bản {currentVersion}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">© 2024 Thuần Chay VN</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-400/30 via-sky-300/20 to-transparent blur-3xl dark:from-sky-600/30 dark:via-sky-500/20" />

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closeMobileNav}
      />

      {/* Sidebar */}
      <aside
        className={`glass-panel fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r border-slate-200/60 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:h-auto lg:translate-x-0 lg:rounded-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'} dark:border-slate-800/60`}
      >
        {/* Logo */}
        <div className="relative flex h-20 items-center justify-between gap-3 border-b border-white/40 px-5 dark:border-slate-800/60">
          {isExpanded && (
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-soft-glow">
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Package className="text-white" size={26} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-200">
                  <Sparkles size={14} />
                  Platform
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">Thuần Chay VN</h1>
              </div>
            </div>
          )}
          <button
            onClick={handleSidebarToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-700/80"
          >
            {mobileNavOpen ? <X size={20} /> : sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="menu-group">
              {isExpanded && <div className="menu-group-title">{group.title}</div>}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
                        title={!isExpanded ? item.label : ''}
                      >
                        <Icon
                          size={20}
                          className={active ? 'text-white' : 'text-slate-500 dark:text-slate-300'}
                        />
                        {isExpanded && (
                          <span className={active ? 'font-semibold' : 'font-medium'}>
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {isExpanded && (
          <div className="px-5 pb-6 pt-4">
            <VersionFooter />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/40 bg-white/70 px-4 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-900/50 lg:px-8">
          <div className="flex flex-1 items-center gap-4 lg:gap-6">
            <button
              onClick={openMobileNav}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 ring-opacity-20 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:text-primary-200 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden flex-1 md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="input-field pl-12 pr-24"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-soft-glow hover:bg-primary-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-primary-200">
                Ctrl K
              </button>
            </div>
            <div className="md:hidden">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Bảng điều khiển</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-300 lg:flex">
              <Sparkles size={14} />
              Đang hoạt động
            </div>
            <button
              onClick={toggleMode}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 ring-opacity-20 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:text-primary-200"
              aria-label="Chuyển chế độ sáng/tối"
            >
              {isDark ? <SunMedium size={20} /> : <MoonStar size={20} />}
            </button>
            <div className="relative" ref={notificationPanelRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:border-primary-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 ring-opacity-20 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-primary-500"
                aria-label="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-3 w-96 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/95">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Thông báo
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Đã đọc tất cả'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-500"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearNotifications}
                          className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left rounded-xl border p-3 transition ${
                            notification.read
                              ? 'border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60'
                              : 'border-primary-200 bg-primary-50/60 dark:border-primary-500/40 dark:bg-primary-500/10'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative hidden md:block" ref={quickActionsRef}>
              <button
                onClick={() => setShowQuickActions((prev) => !prev)}
                className="items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 ring-opacity-30 md:inline-flex"
              >
                <Plus size={18} />
                Tạo nhanh
              </button>
              {showQuickActions && (
                <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/95">
                  <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Chọn thao tác
                  </p>
                  <div className="space-y-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          className="w-full text-left rounded-xl border border-slate-200 px-3 py-2 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 dark:border-slate-800 dark:hover:border-primary-400/50 dark:hover:bg-primary-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary-100 p-2 text-primary-600 dark:bg-primary-500/20 dark:text-primary-100">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {action.label}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-2 py-1.5 shadow-sm transition dark:border-slate-700/70 dark:bg-slate-900/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white font-semibold shadow-soft-glow">
                {getUserInitials()}
              </div>
              <div className="hidden min-w-[120px] text-left lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {currentUser?.fullName || currentUser?.username}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                  <ChevronDown size={14} />
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:-translate-y-0.5 hover:border-rose-100 hover:text-rose-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 dark:text-slate-400 dark:hover:border-rose-500/20 dark:hover:text-rose-300"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout


