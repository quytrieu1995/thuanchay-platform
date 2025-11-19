import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Save, Store, Bell, CreditCard, Shield, User, UserCog, Palette, Mail, MessageSquare, RefreshCw, Printer } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ColorPicker from '../components/ColorPicker'
import LogoUpload from '../components/LogoUpload'
import DataSync from '../components/DataSync'
import PrintTemplateManager from '../components/PrintTemplateManager'

const Settings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, canAccess, FEATURES } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback to default
      }
    }
    return {
      storeName: 'Cửa hàng của tôi',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      email: 'store@example.com',
      taxCode: '1234567890',
      currency: 'VND',
      language: 'vi',
      notifications: {
        email: true,
        sms: false,
        push: true,
        emailSettings: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: '587',
          smtpUser: '',
          smtpPassword: '',
          fromEmail: '',
          fromName: 'Thuần Chay VN System',
          enableSSL: true,
          notifications: {
            newOrder: true,
            orderStatus: true,
            lowStock: true,
            paymentReceived: true,
            customerRegistration: false,
            dailyReport: false,
          }
        },
        googleChat: {
          enabled: false,
          webhookUrl: '',
          notifications: {
            lowStock: true,
            newOrder: false,
            orderStatus: false,
          }
        }
      },
      paymentMethods: {
        cash: true,
        card: true,
        bankTransfer: true,
        eWallet: false
      }
    }
  })

  // Lưu settings vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Store },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'sync', label: 'Đồng bộ dữ liệu', icon: RefreshCw },
    { id: 'print', label: 'Mẫu in', icon: Printer },
    ...(canAccess(FEATURES.users) ? [{ id: 'users', label: 'Người dùng', icon: UserCog }] : []),
  ]

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    alert('Đã lưu cài đặt thành công!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt</h1>
        <p className="text-gray-600">Quản lý cài đặt hệ thống và tài khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Thông tin cửa hàng</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên cửa hàng
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn vị tiền tệ
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="input-field"
                      >
                        <option value="VND">VND (₫)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngôn ngữ
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        className="input-field"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Giao diện</h2>
                <div className="space-y-8">
                  <ColorPicker />
                  <LogoUpload />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Cài đặt thông báo</h2>
                
                {/* Toggle notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Thông báo qua Email</p>
                      <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { 
                            ...settings.notifications, 
                            email: e.target.checked,
                            emailSettings: settings.notifications.emailSettings || {
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: '587',
                              smtpUser: '',
                              smtpPassword: '',
                              fromEmail: '',
                              fromName: 'Thuần Chay VN System',
                              enableSSL: true,
                              notifications: {
                                newOrder: true,
                                orderStatus: true,
                                lowStock: true,
                                paymentReceived: true,
                                customerRegistration: false,
                                dailyReport: false,
                              }
                            }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Thông báo qua SMS</p>
                      <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sms: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Thông báo đẩy</p>
                      <p className="text-sm text-gray-600">Nhận thông báo đẩy trên trình duyệt</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                {/* Email Settings */}
                {settings.notifications.email && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail size={20} className="text-primary-600" />
                      <h3 className="text-lg font-semibold">Cài đặt Email (SMTP)</h3>
                    </div>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SMTP Host *
                          </label>
                          <input
                            type="text"
                            value={settings.notifications.emailSettings?.smtpHost || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  smtpHost: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SMTP Port *
                          </label>
                          <input
                            type="text"
                            value={settings.notifications.emailSettings?.smtpPort || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  smtpPort: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="587"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SMTP Username *
                          </label>
                          <input
                            type="text"
                            value={settings.notifications.emailSettings?.smtpUser || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  smtpUser: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="your-email@gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SMTP Password *
                          </label>
                          <input
                            type="password"
                            value={settings.notifications.emailSettings?.smtpPassword || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  smtpPassword: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email gửi từ *
                          </label>
                          <input
                            type="email"
                            value={settings.notifications.emailSettings?.fromEmail || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  fromEmail: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="noreply@Thuần Chay VN.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên người gửi
                          </label>
                          <input
                            type="text"
                            value={settings.notifications.emailSettings?.fromName || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  fromName: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="Thuần Chay VN System"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailSettings?.enableSSL !== false}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailSettings: {
                                  ...settings.notifications.emailSettings,
                                  enableSSL: e.target.checked
                                }
                              }
                            })}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Bật SSL/TLS</span>
                        </label>
                      </div>
                    </div>

                    {/* Email Notification Types */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3">Loại thông báo email</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'newOrder', label: 'Đơn hàng mới' },
                          { key: 'orderStatus', label: 'Thay đổi trạng thái đơn hàng' },
                          { key: 'lowStock', label: 'Cảnh báo tồn kho thấp' },
                          { key: 'paymentReceived', label: 'Nhận thanh toán' },
                          { key: 'customerRegistration', label: 'Khách hàng đăng ký mới' },
                          { key: 'dailyReport', label: 'Báo cáo hàng ngày' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications.emailSettings?.notifications?.[key] || false}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  notifications: {
                                    ...settings.notifications,
                                    emailSettings: {
                                      ...settings.notifications.emailSettings,
                                      notifications: {
                                        ...settings.notifications.emailSettings?.notifications,
                                        [key]: e.target.checked
                                      }
                                    }
                                  }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Lưu ý:</strong> Để sử dụng Gmail, bạn cần tạo "App Password" trong cài đặt tài khoản Google của mình.
                      </p>
                    </div>
                  </div>
                )}

                {/* Google Chat Settings */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={20} className="text-primary-600" />
                    <h3 className="text-lg font-semibold">Cài đặt Google Chat</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">Bật thông báo Google Chat</p>
                        <p className="text-sm text-gray-600">Nhận cảnh báo qua Google Chat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.googleChat?.enabled || false}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              googleChat: {
                                ...settings.notifications.googleChat,
                                enabled: e.target.checked,
                                webhookUrl: settings.notifications.googleChat?.webhookUrl || '',
                                notifications: settings.notifications.googleChat?.notifications || {
                                  lowStock: true,
                                  newOrder: false,
                                  orderStatus: false,
                                }
                              }
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {settings.notifications.googleChat?.enabled && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Webhook URL *
                            <span className="text-gray-500 text-xs ml-1">(URL từ Google Chat để nhận thông báo)</span>
                          </label>
                          <input
                            type="url"
                            value={settings.notifications.googleChat?.webhookUrl || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                googleChat: {
                                  ...settings.notifications.googleChat,
                                  webhookUrl: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="https://chat.googleapis.com/v1/spaces/..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Hướng dẫn: Vào Google Chat → Tạo webhook → Copy URL vào đây
                          </p>
                        </div>

                        {/* Google Chat Notification Types */}
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-3">Loại thông báo Google Chat</h4>
                          <div className="space-y-3">
                            {[
                              { key: 'lowStock', label: 'Cảnh báo tồn kho thấp' },
                              { key: 'newOrder', label: 'Đơn hàng mới' },
                              { key: 'orderStatus', label: 'Thay đổi trạng thái đơn hàng' },
                            ].map(({ key, label }) => (
                              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={settings.notifications.googleChat?.notifications?.[key] || false}
                                    onChange={(e) => setSettings({
                                      ...settings,
                                      notifications: {
                                        ...settings.notifications,
                                        googleChat: {
                                          ...settings.notifications.googleChat,
                                          notifications: {
                                            ...settings.notifications.googleChat?.notifications,
                                            [key]: e.target.checked
                                          }
                                        }
                                      }
                                    })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>Lưu ý:</strong> Để tạo webhook Google Chat, vào Google Chat → Chọn room/space → Apps → Incoming Webhook → Tạo webhook và copy URL.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                <div className="space-y-4">
                  {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
                    <div key={method} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">
                          {method === 'cash' ? 'Tiền mặt' :
                           method === 'card' ? 'Thẻ tín dụng/Ghi nợ' :
                           method === 'bankTransfer' ? 'Chuyển khoản ngân hàng' :
                           'Ví điện tử'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentMethods: { ...settings.paymentMethods, [method]: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Bảo mật</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên đăng nhập
                    </label>
                    <input type="text" value={currentUser?.username || ''} disabled className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input type="text" value={currentUser?.fullName || ''} disabled className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input type="email" value={currentUser?.email || ''} disabled className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input type="text" value={currentUser?.phone || ''} disabled className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <input 
                      type="text" 
                      value={currentUser?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'} 
                      disabled 
                      className="input-field bg-gray-50" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <DataSync />
            )}

            {activeTab === 'print' && (
              <PrintTemplateManager />
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Quản lý Người dùng</h2>
                    <p className="text-sm text-gray-600 mt-1">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                  </div>
                  <button
                    onClick={() => navigate('/users')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UserCog size={20} />
                    Mở trang Quản lý Người dùng
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Để quản lý người dùng, tạo mới, chỉnh sửa và phân quyền, vui lòng sử dụng trang Quản lý Người dùng.
                  </p>
                </div>
              </div>
            )}

            {activeTab !== 'sync' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save size={20} />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings


