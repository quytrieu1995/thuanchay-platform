import { useState, useMemo, useEffect } from 'react'
import { Search, Mail, Phone, MapPin, Eye, X, User, Building, Calendar, CreditCard, MapPin as MapPinIcon, Users, FileText, Star, DollarSign, Edit, ShoppingCart, Receipt, ExternalLink, Loader2, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import { fastSearch } from '../utils/filterUtils'
import Pagination from '../components/Pagination'
import { customersApi } from '../services/customersApi'

const Customers = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      loaiKhach: 'Khách lẻ',
      chiNhanhTao: 'CN01 - Hà Nội',
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      dienThoai: '0901234567',
      diaChi: '123 Đường ABC, Quận 1, TP.HCM',
      khuVucGiaoHang: 'Quận 1',
      phuongXa: 'Phường Bến Nghé',
      congTy: '',
      maSoThue: '',
      soCMND: '001234567890',
      ngaySinh: '1990-05-15',
      gioiTinh: 'Nam',
      email: 'nguyenvana@email.com',
      facebook: 'nguyenvana.fb',
      nhomKhachHang: 'VIP',
      ghiChu: 'Khách hàng thân thiết',
      diemHienTai: 1250,
      tongDiem: 2500,
      nguoiTao: 'Admin',
      ngayTao: '2023-01-15',
      ngayGiaoDichCuoi: '2024-01-20',
      noCanThuHienTai: 0,
      tongBan: 12500000,
      tongBanTruTraHang: 12000000,
      status: 'Hoạt động',
      orders: 12,
      totalSpent: 12500000
    },
    {
      id: 2,
      loaiKhach: 'Khách lẻ',
      chiNhanhTao: 'CN02 - TP.HCM',
      maKhachHang: 'KH002',
      tenKhachHang: 'Trần Thị B',
      dienThoai: '0912345678',
      diaChi: '456 Đường XYZ, Quận 2, TP.HCM',
      khuVucGiaoHang: 'Quận 2',
      phuongXa: 'Phường An Phú',
      congTy: '',
      maSoThue: '',
      soCMND: '001234567891',
      ngaySinh: '1992-08-20',
      gioiTinh: 'Nữ',
      email: 'tranthib@email.com',
      facebook: 'tranthib.fb',
      nhomKhachHang: 'Thường',
      ghiChu: '',
      diemHienTai: 890,
      tongDiem: 1780,
      nguoiTao: 'Staff01',
      ngayTao: '2023-03-10',
      ngayGiaoDichCuoi: '2024-01-18',
      noCanThuHienTai: 0,
      tongBan: 8900000,
      tongBanTruTraHang: 8500000,
      status: 'Hoạt động',
      orders: 8,
      totalSpent: 8900000
    },
    {
      id: 3,
      loaiKhach: 'Khách doanh nghiệp',
      chiNhanhTao: 'CN01 - Hà Nội',
      maKhachHang: 'KH003',
      tenKhachHang: 'Lê Văn C',
      dienThoai: '0923456789',
      diaChi: '789 Đường DEF, Quận 3, TP.HCM',
      khuVucGiaoHang: 'Quận 3',
      phuongXa: 'Phường Võ Thị Sáu',
      congTy: 'Công ty TNHH ABC',
      maSoThue: '0123456789',
      soCMND: '001234567892',
      ngaySinh: '1985-12-10',
      gioiTinh: 'Nam',
      email: 'levanc@email.com',
      facebook: 'levanc.fb',
      nhomKhachHang: 'VIP',
      ghiChu: 'Khách hàng doanh nghiệp, ưu tiên giao hàng nhanh',
      diemHienTai: 2100,
      tongDiem: 4200,
      nguoiTao: 'Admin',
      ngayTao: '2022-11-05',
      ngayGiaoDichCuoi: '2024-01-19',
      noCanThuHienTai: 500000,
      tongBan: 21000000,
      tongBanTruTraHang: 20500000,
      status: 'Hoạt động',
      orders: 15,
      totalSpent: 21000000
    },
    {
      id: 4,
      loaiKhach: 'Khách lẻ',
      chiNhanhTao: 'CN02 - TP.HCM',
      maKhachHang: 'KH004',
      tenKhachHang: 'Phạm Thị D',
      dienThoai: '0934567890',
      diaChi: '321 Đường GHI, Quận 4, TP.HCM',
      khuVucGiaoHang: 'Quận 4',
      phuongXa: 'Phường 14',
      congTy: '',
      maSoThue: '',
      soCMND: '001234567893',
      ngaySinh: '1995-03-25',
      gioiTinh: 'Nữ',
      email: 'phamthid@email.com',
      facebook: '',
      nhomKhachHang: 'Thường',
      ghiChu: '',
      diemHienTai: 45,
      tongDiem: 90,
      nguoiTao: 'Staff02',
      ngayTao: '2024-01-01',
      ngayGiaoDichCuoi: '2024-01-05',
      noCanThuHienTai: 0,
      tongBan: 450000,
      tongBanTruTraHang: 450000,
      status: 'Không hoạt động',
      orders: 3,
      totalSpent: 450000
    },
    {
      id: 5,
      loaiKhach: 'Khách lẻ',
      chiNhanhTao: 'CN01 - Hà Nội',
      maKhachHang: 'KH005',
      tenKhachHang: 'Hoàng Văn E',
      dienThoai: '0945678901',
      diaChi: '654 Đường JKL, Quận 5, TP.HCM',
      khuVucGiaoHang: 'Quận 5',
      phuongXa: 'Phường 5',
      congTy: '',
      maSoThue: '',
      soCMND: '001234567894',
      ngaySinh: '1988-07-30',
      gioiTinh: 'Nam',
      email: 'hoangvane@email.com',
      facebook: 'hoangvane.fb',
      nhomKhachHang: 'VIP',
      ghiChu: 'Khách hàng VIP, mua hàng thường xuyên',
      diemHienTai: 1750,
      tongDiem: 3500,
      nguoiTao: 'Admin',
      ngayTao: '2022-08-20',
      ngayGiaoDichCuoi: '2024-01-21',
      noCanThuHienTai: 0,
      tongBan: 17500000,
      tongBanTruTraHang: 17000000,
      status: 'Hoạt động',
      orders: 20,
      totalSpent: 17500000
    },
  ])

  useEffect(() => {
    let savedCustomers = null
    try {
      const raw = localStorage.getItem('customers')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          savedCustomers = parsed
        }
      }
    } catch (error) {
      console.warn('customers: unable to parse localStorage data', error)
    }

    if (savedCustomers && savedCustomers.length >= 0) {
      setCustomers(savedCustomers)
      return
    }

    if (localStorage.getItem('disableFallbackData') === 'true') {
      setCustomers([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info', 'orders', 'debt'
  const [customerOrders, setCustomerOrders] = useState([])
  const [customerDebt, setCustomerDebt] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const generateCustomerCode = () => {
    const timestamp = Date.now().toString()
    return `KH${timestamp.slice(-6)}`
  }
  const getDefaultCreateForm = () => ({
    loaiKhach: 'Khách lẻ',
    chiNhanhTao: '',
    maKhachHang: generateCustomerCode(),
    tenKhachHang: '',
    dienThoai: '',
    email: '',
    diaChi: '',
    khuVucGiaoHang: '',
    phuongXa: '',
    congTy: '',
    maSoThue: '',
    soCMND: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    facebook: '',
    nhomKhachHang: 'Thường',
    ghiChu: '',
    status: 'Hoạt động',
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState(getDefaultCreateForm)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const navigate = useNavigate()

  const handleGenerateCreateCode = () => {
    setCreateFormData(prev => ({
      ...prev,
      maKhachHang: generateCustomerCode(),
    }))
  }

  // Mock orders data cho tất cả khách hàng
  const allCustomerOrders = useMemo(() => [
    // Orders cho KH001
    {
      id: 'HD001',
      maHoaDon: 'HD001',
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      thoiGianTao: '2024-01-15 09:00:00',
      trangThai: 'Đã giao',
      khachCanTra: 1250000,
      khachDaTra: 1250000,
      conCanThuCOD: 0,
      tongTienHang: 1200000,
      giamGiaHoaDon: 50000,
    },
    {
      id: 'HD005',
      maHoaDon: 'HD005',
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      thoiGianTao: '2024-01-10 14:30:00',
      trangThai: 'Đã giao',
      khachCanTra: 850000,
      khachDaTra: 850000,
      conCanThuCOD: 0,
      tongTienHang: 800000,
      giamGiaHoaDon: 50000,
    },
    {
      id: 'HD010',
      maHoaDon: 'HD010',
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      thoiGianTao: '2024-01-20 10:15:00',
      trangThai: 'Đang giao',
      khachCanTra: 1500000,
      khachDaTra: 1000000,
      conCanThuCOD: 500000,
      tongTienHang: 1450000,
      giamGiaHoaDon: 50000,
    },
    // Orders cho KH002
    {
      id: 'HD002',
      maHoaDon: 'HD002',
      maKhachHang: 'KH002',
      tenKhachHang: 'Trần Thị B',
      thoiGianTao: '2024-01-16 11:00:00',
      trangThai: 'Đã giao',
      khachCanTra: 890000,
      khachDaTra: 890000,
      conCanThuCOD: 0,
      tongTienHang: 850000,
      giamGiaHoaDon: 40000,
    },
    // Orders cho KH003
    {
      id: 'HD003',
      maHoaDon: 'HD003',
      maKhachHang: 'KH003',
      tenKhachHang: 'Lê Văn C',
      thoiGianTao: '2024-01-18 15:20:00',
      trangThai: 'Đã giao',
      khachCanTra: 2100000,
      khachDaTra: 1600000,
      conCanThuCOD: 500000,
      tongTienHang: 2000000,
      giamGiaHoaDon: 100000,
    },
    {
      id: 'HD007',
      maHoaDon: 'HD007',
      maKhachHang: 'KH003',
      tenKhachHang: 'Lê Văn C',
      thoiGianTao: '2024-01-19 09:30:00',
      trangThai: 'Đang xử lý',
      khachCanTra: 1800000,
      khachDaTra: 0,
      conCanThuCOD: 1800000,
      tongTienHang: 1750000,
      giamGiaHoaDon: 50000,
    },
    // Orders cho KH005
    {
      id: 'HD008',
      maHoaDon: 'HD008',
      maKhachHang: 'KH005',
      tenKhachHang: 'Hoàng Văn E',
      thoiGianTao: '2024-01-21 14:00:00',
      trangThai: 'Đã giao',
      khachCanTra: 1750000,
      khachDaTra: 1750000,
      conCanThuCOD: 0,
      tongTienHang: 1700000,
      giamGiaHoaDon: 50000,
    },
  ], [])

  // Load orders data khi mở modal
  useEffect(() => {
    if (showDetailModal && selectedCustomer) {
      // Filter orders theo mã khách hàng
      const filtered = allCustomerOrders.filter(
        order => order.maKhachHang === selectedCustomer.maKhachHang
      )
      setCustomerOrders(filtered)

      // Tính toán công nợ
      const debtRecords = filtered
        .filter(order => order.conCanThuCOD > 0)
        .map(order => ({
          maHoaDon: order.maHoaDon,
          ngayTao: order.thoiGianTao.split(' ')[0],
          tongTien: order.khachCanTra,
          daTra: order.khachDaTra,
          conNo: order.conCanThuCOD,
          trangThai: order.trangThai,
        }))
      setCustomerDebt(debtRecords)
    }
  }, [showDetailModal, selectedCustomer, allCustomerOrders])

  // Debounce search
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoize filtered customers
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm) {
      return customers
    }
    return fastSearch(customers, debouncedSearchTerm, [
      'tenKhachHang', 'maKhachHang', 'dienThoai', 'email', 'congTy'
    ])
  }, [customers, debouncedSearchTerm])

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(filteredCustomers, 50)

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
    setIsEditing(false)
    setEditFormData(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditFormData({
      loaiKhach: selectedCustomer.loaiKhach || '',
      chiNhanhTao: selectedCustomer.chiNhanhTao || '',
      maKhachHang: selectedCustomer.maKhachHang || '',
      tenKhachHang: selectedCustomer.tenKhachHang || '',
      dienThoai: selectedCustomer.dienThoai || '',
      diaChi: selectedCustomer.diaChi || '',
      khuVucGiaoHang: selectedCustomer.khuVucGiaoHang || '',
      phuongXa: selectedCustomer.phuongXa || '',
      congTy: selectedCustomer.congTy || '',
      maSoThue: selectedCustomer.maSoThue || '',
      soCMND: selectedCustomer.soCMND || '',
      ngaySinh: selectedCustomer.ngaySinh || '',
      gioiTinh: selectedCustomer.gioiTinh || 'Nam',
      email: selectedCustomer.email || '',
      facebook: selectedCustomer.facebook || '',
      nhomKhachHang: selectedCustomer.nhomKhachHang || 'Thường',
      ghiChu: selectedCustomer.ghiChu || '',
      status: selectedCustomer.status || 'Hoạt động',
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(null)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // Gọi API để cập nhật
      const updatedCustomer = await customersApi.update(selectedCustomer.id, editFormData)
      
      // Cập nhật local state với dữ liệu từ API
      setCustomers(prev => prev.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, ...updatedCustomer }
          : customer
      ))

      // Cập nhật selectedCustomer để hiển thị ngay
      setSelectedCustomer(prev => ({ ...prev, ...updatedCustomer }))
      
      setIsEditing(false)
      setEditFormData(null)
      alert('Cập nhật thông tin khách hàng thành công!')
    } catch (error) {
      // Nếu API lỗi, vẫn cập nhật local state để không mất dữ liệu
      if (error.code === 'API_UNAVAILABLE' || error.code === 'API_DISABLED') {
        setCustomers(prev => prev.map(customer => 
          customer.id === selectedCustomer.id 
            ? { ...customer, ...editFormData }
            : customer
        ))
        setSelectedCustomer(prev => ({ ...prev, ...editFormData }))
        setIsEditing(false)
        setEditFormData(null)
        alert('Cập nhật thông tin khách hàng thành công! (Lưu cục bộ)')
      } else {
        alert('Không thể cập nhật: ' + (error.message || 'Có lỗi xảy ra'))
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setCreateError('')
    setCreateFormData(getDefaultCreateForm())
    setShowCreateModal(true)
  }

  const buildCustomerRecord = (form, overrides = {}) => {
    const now = new Date()
    return {
      id: overrides.id ?? Date.now(),
      loaiKhach: form.loaiKhach,
      chiNhanhTao: form.chiNhanhTao || '',
      maKhachHang: form.maKhachHang || generateCustomerCode(),
      tenKhachHang: form.tenKhachHang,
      dienThoai: form.dienThoai || '',
      diaChi: form.diaChi || '',
      khuVucGiaoHang: form.khuVucGiaoHang || '',
      phuongXa: form.phuongXa || '',
      congTy: form.congTy || '',
      maSoThue: form.maSoThue || '',
      soCMND: form.soCMND || '',
      ngaySinh: form.ngaySinh || '',
      gioiTinh: form.gioiTinh || 'Nam',
      email: form.email || '',
      facebook: form.facebook || '',
      nhomKhachHang: form.nhomKhachHang || 'Thường',
      ghiChu: form.ghiChu || '',
      diemHienTai: overrides.diemHienTai ?? 0,
      tongDiem: overrides.tongDiem ?? 0,
      nguoiTao: overrides.nguoiTao || 'Hệ thống',
      ngayTao: overrides.ngayTao || now.toISOString().split('T')[0],
      ngayGiaoDichCuoi: overrides.ngayGiaoDichCuoi || '',
      noCanThuHienTai: overrides.noCanThuHienTai ?? 0,
      tongBan: overrides.tongBan ?? 0,
      tongBanTruTraHang: overrides.tongBanTruTraHang ?? 0,
      status: form.status || 'Hoạt động',
      orders: overrides.orders ?? 0,
      totalSpent: overrides.totalSpent ?? 0,
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')

    const preparePayload = {
      ...createFormData,
    }

    try {
      const created = await customersApi.create(preparePayload)
      const newRecord = buildCustomerRecord(createFormData, created || {})
      setCustomers(prev => {
        const updated = [newRecord, ...prev]
        localStorage.setItem('customers', JSON.stringify(updated))
        return updated
      })
      window.dispatchEvent(new Event('Thuần Chay VN-data-updated'))
      setShowCreateModal(false)
      setCreateFormData(getDefaultCreateForm())
      alert('Đã thêm khách hàng mới thành công!')
    } catch (error) {
      if (error?.message === 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.' || error?.message === 'API_UNAVAILABLE' || error?.message === 'API_DISABLED' || error?.message === 'Failed to fetch') {
        const fallbackRecord = buildCustomerRecord(createFormData)
        setCustomers(prev => {
          const updated = [fallbackRecord, ...prev]
          localStorage.setItem('customers', JSON.stringify(updated))
          return updated
        })
        window.dispatchEvent(new Event('Thuần Chay VN-data-updated'))
        setShowCreateModal(false)
        setCreateFormData(getDefaultCreateForm())
        alert('API không khả dụng, đã lưu khách hàng mới cục bộ.')
      } else {
        console.error('create customer error', error)
        setCreateError(error?.message || 'Không thể tạo khách hàng. Vui lòng thử lại.')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Khách hàng</h1>
        <p className="text-gray-600">Danh sách khách hàng và thông tin chi tiết</p>
      </div>

      {/* Search + Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Thêm khách hàng
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Tên khách hàng</th>
                <th>Loại khách</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Nhóm KH</th>
                <th>Điểm</th>
                <th>Tổng bán</th>
                <th>Nợ cần thu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((customer) => (
                <tr key={customer.id}>
                  <td className="font-mono text-sm">{customer.maKhachHang}</td>
                  <td className="font-medium">{customer.tenKhachHang}</td>
                  <td>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                      {customer.loaiKhach}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {customer.dienThoai}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      customer.nhomKhachHang === 'VIP' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.nhomKhachHang}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{customer.diemHienTai}</span>
                    </div>
                  </td>
                  <td className="font-semibold text-primary-600">
                    {customer.tongBan.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    {customer.noCanThuHienTai > 0 ? (
                      <span className="font-semibold text-red-600">
                        {customer.noCanThuHienTai.toLocaleString('vi-VN')} đ
                      </span>
                    ) : (
                      <span className="text-gray-400">0 đ</span>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Hoạt động' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleViewDetail(customer)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng khách hàng</p>
          <p className="text-2xl font-bold mt-1">{customers.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {customers.filter(c => c.status === 'Hoạt động').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng đơn hàng</p>
          <p className="text-2xl font-bold mt-1">
            {customers.reduce((sum, c) => sum + c.orders, 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold mt-1 text-primary-600">
            {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <UserPlus size={24} />
                  Thêm khách hàng mới
                </h2>
                <p className="text-gray-600">Nhập thông tin khách hàng và lưu lại để đồng bộ.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} />
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại khách *</label>
                    <select
                      value={createFormData.loaiKhach}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, loaiKhach: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="Khách lẻ">Khách lẻ</option>
                      <option value="Khách doanh nghiệp">Khách doanh nghiệp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh tạo</label>
                    <input
                      type="text"
                      value={createFormData.chiNhanhTao}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, chiNhanhTao: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã khách hàng *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createFormData.maKhachHang}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, maKhachHang: e.target.value }))}
                        className="input-field font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateCreateCode}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Sinh mã
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                    <input
                      type="text"
                      value={createFormData.tenKhachHang}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, tenKhachHang: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại *</label>
                    <input
                      type="tel"
                      value={createFormData.dienThoai}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, dienThoai: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={createFormData.ngaySinh}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, ngaySinh: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select
                      value={createFormData.gioiTinh}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, gioiTinh: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD</label>
                    <input
                      type="text"
                      value={createFormData.soCMND}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, soCMND: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="text"
                      value={createFormData.facebook}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, facebook: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm khách hàng</label>
                    <input
                      type="text"
                      value={createFormData.nhomKhachHang}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, nhomKhachHang: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      value={createFormData.status}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPinIcon size={20} />
                  Địa chỉ & ghi chú
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      value={createFormData.diaChi}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, diaChi: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực giao hàng</label>
                    <input
                      type="text"
                      value={createFormData.khuVucGiaoHang}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, khuVucGiaoHang: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                    <input
                      type="text"
                      value={createFormData.phuongXa}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, phuongXa: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={createFormData.ghiChu}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
                      className="input-field"
                      rows={3}
                      placeholder="Ghi chú đặc biệt (nếu có)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  disabled={createLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {createLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  {createLoading ? 'Đang lưu...' : 'Lưu khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <User size={24} />
                  {isEditing ? 'Chỉnh sửa khách hàng' : `Chi tiết khách hàng: ${selectedCustomer.tenKhachHang}`}
                </h2>
                <p className="text-gray-600">Mã khách hàng: <span className="font-mono">{selectedCustomer.maKhachHang}</span></p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && activeTab === 'info' && (
                  <button
                    onClick={handleEdit}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Chỉnh sửa
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedCustomer(null)
                    setActiveTab('info')
                    setIsEditing(false)
                    setEditFormData(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'info'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    <span>Thông tin</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'orders'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} />
                    <span>Lịch sử đơn hàng</span>
                    {customerOrders.length > 0 && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {customerOrders.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('debt')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'debt'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Receipt size={18} />
                    <span>Công nợ</span>
                    {customerDebt.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                        {customerDebt.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <>
              {isEditing && editFormData ? (
                <form onSubmit={handleSaveEdit} className="space-y-6">
                  {/* Thông tin cơ bản */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User size={20} />
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại khách *</label>
                        <select
                          value={editFormData.loaiKhach}
                          onChange={(e) => setEditFormData({ ...editFormData, loaiKhach: e.target.value })}
                          className="input-field"
                          required
                        >
                          <option value="Khách lẻ">Khách lẻ</option>
                          <option value="Khách doanh nghiệp">Khách doanh nghiệp</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh tạo</label>
                        <input
                          type="text"
                          value={editFormData.chiNhanhTao}
                          onChange={(e) => setEditFormData({ ...editFormData, chiNhanhTao: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã khách hàng *</label>
                        <input
                          type="text"
                          value={editFormData.maKhachHang}
                          onChange={(e) => setEditFormData({ ...editFormData, maKhachHang: e.target.value })}
                          className="input-field font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                        <input
                          type="text"
                          value={editFormData.tenKhachHang}
                          onChange={(e) => setEditFormData({ ...editFormData, tenKhachHang: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại *</label>
                        <input
                          type="tel"
                          value={editFormData.dienThoai}
                          onChange={(e) => setEditFormData({ ...editFormData, dienThoai: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={editFormData.ngaySinh}
                          onChange={(e) => setEditFormData({ ...editFormData, ngaySinh: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                          value={editFormData.gioiTinh}
                          onChange={(e) => setEditFormData({ ...editFormData, gioiTinh: e.target.value })}
                          className="input-field"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD</label>
                        <input
                          type="text"
                          value={editFormData.soCMND}
                          onChange={(e) => setEditFormData({ ...editFormData, soCMND: e.target.value })}
                          className="input-field font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                        <input
                          type="text"
                          value={editFormData.facebook}
                          onChange={(e) => setEditFormData({ ...editFormData, facebook: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPinIcon size={20} />
                      Địa chỉ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                          type="text"
                          value={editFormData.diaChi}
                          onChange={(e) => setEditFormData({ ...editFormData, diaChi: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực giao hàng</label>
                        <input
                          type="text"
                          value={editFormData.khuVucGiaoHang}
                          onChange={(e) => setEditFormData({ ...editFormData, khuVucGiaoHang: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                        <input
                          type="text"
                          value={editFormData.phuongXa}
                          onChange={(e) => setEditFormData({ ...editFormData, phuongXa: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin doanh nghiệp */}
                  {editFormData.loaiKhach === 'Khách doanh nghiệp' && (
                    <div className="card">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Thông tin doanh nghiệp
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                          <input
                            type="text"
                            value={editFormData.congTy}
                            onChange={(e) => setEditFormData({ ...editFormData, congTy: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                          <input
                            type="text"
                            value={editFormData.maSoThue}
                            onChange={(e) => setEditFormData({ ...editFormData, maSoThue: e.target.value })}
                            className="input-field font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phân loại */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users size={20} />
                      Phân loại
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm khách hàng</label>
                        <select
                          value={editFormData.nhomKhachHang}
                          onChange={(e) => setEditFormData({ ...editFormData, nhomKhachHang: e.target.value })}
                          className="input-field"
                        >
                          <option value="Thường">Thường</option>
                          <option value="VIP">VIP</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className="input-field"
                        >
                          <option value="Hoạt động">Hoạt động</option>
                          <option value="Không hoạt động">Không hoạt động</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          value={editFormData.ghiChu}
                          onChange={(e) => setEditFormData({ ...editFormData, ghiChu: e.target.value })}
                          className="input-field"
                          rows="3"
                          placeholder="Nhập ghi chú về khách hàng..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      disabled={submitLoading}
                    >
                      {submitLoading && <Loader2 className="animate-spin" size={18} />}
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary flex-1"
                      disabled={submitLoading}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} />
                  Thông tin cơ bản
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Loại khách:</span>
                      <div className="font-medium">{selectedCustomer.loaiKhach}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Chi nhánh tạo:</span>
                      <div className="font-medium">{selectedCustomer.chiNhanhTao}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mã khách hàng:</span>
                      <div className="font-mono font-medium">{selectedCustomer.maKhachHang}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tên khách hàng:</span>
                      <div className="font-medium">{selectedCustomer.tenKhachHang}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Điện thoại:</span>
                      <div className="font-medium flex items-center gap-2">
                        <Phone size={14} />
                        {selectedCustomer.dienThoai}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-medium flex items-center gap-2">
                        <Mail size={14} />
                        {selectedCustomer.email}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày sinh:</span>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar size={14} />
                        {selectedCustomer.ngaySinh}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Giới tính:</span>
                      <div className="font-medium">{selectedCustomer.gioiTinh}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Số CMND/CCCD:</span>
                      <div className="font-mono font-medium">{selectedCustomer.soCMND || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Facebook:</span>
                      <div className="font-medium">{selectedCustomer.facebook || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPinIcon size={20} />
                  Địa chỉ
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Địa chỉ:</span>
                    <div className="font-medium">{selectedCustomer.diaChi}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Khu vực giao hàng:</span>
                      <div className="font-medium">{selectedCustomer.khuVucGiaoHang}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Phường/Xã:</span>
                      <div className="font-medium">{selectedCustomer.phuongXa}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin doanh nghiệp */}
              {selectedCustomer.loaiKhach === 'Khách doanh nghiệp' && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building size={20} />
                    Thông tin doanh nghiệp
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Công ty:</span>
                      <div className="font-medium">{selectedCustomer.congTy}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mã số thuế:</span>
                      <div className="font-mono font-medium">{selectedCustomer.maSoThue}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nhóm khách hàng & Ghi chú */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Phân loại
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Nhóm khách hàng:</span>
                    <div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedCustomer.nhomKhachHang === 'VIP' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedCustomer.nhomKhachHang}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ghi chú:</span>
                    <div className="font-medium mt-1">{selectedCustomer.ghiChu || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Điểm tích lũy */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  Điểm tích lũy
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Điểm hiện tại:</span>
                      <div className="font-bold text-lg text-yellow-600 flex items-center gap-1">
                        <Star size={16} className="fill-yellow-500" />
                        {selectedCustomer.diemHienTai}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng điểm:</span>
                      <div className="font-bold text-lg text-yellow-600 flex items-center gap-1">
                        <Star size={16} className="fill-yellow-500" />
                        {selectedCustomer.tongDiem}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin tài chính */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Thông tin tài chính
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Tổng bán:</span>
                      <div className="font-semibold text-primary-600 text-lg">
                        {selectedCustomer.tongBan.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng bán trừ trả hàng:</span>
                      <div className="font-semibold text-green-600 text-lg">
                        {selectedCustomer.tongBanTruTraHang.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nợ cần thu hiện tại:</span>
                      <div className={`font-semibold text-lg ${
                        selectedCustomer.noCanThuHienTai > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {selectedCustomer.noCanThuHienTai.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Số đơn hàng:</span>
                      <div className="font-semibold text-lg">
                        {selectedCustomer.orders} đơn
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin hệ thống */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Thông tin hệ thống
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Người tạo:</span>
                      <div className="font-medium">{selectedCustomer.nguoiTao}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày tạo:</span>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar size={14} />
                        {selectedCustomer.ngayTao}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày giao dịch cuối:</span>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar size={14} />
                        {selectedCustomer.ngayGiaoDichCuoi}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedCustomer.status === 'Hoạt động' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              )}
              </>
            )}

            {/* Tab Lịch sử đơn hàng */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Lịch sử đơn hàng</h3>
                  <button
                    onClick={() => {
                      navigate('/orders', { state: { customerFilter: selectedCustomer.maKhachHang } })
                      setShowDetailModal(false)
                    }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={16} />
                    Xem tất cả đơn hàng
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="card text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Khách hàng chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="card">
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th>Đã trả</th>
                            <th>Còn nợ</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="font-mono font-medium">{order.maHoaDon}</td>
                              <td>{order.thoiGianTao.split(' ')[0]}</td>
                              <td>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.trangThai === 'Đã giao' 
                                    ? 'bg-green-100 text-green-800' 
                                    : order.trangThai === 'Đang giao'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.trangThai}
                                </span>
                              </td>
                              <td className="font-semibold">{order.khachCanTra.toLocaleString('vi-VN')} đ</td>
                              <td className="text-green-600">{order.khachDaTra.toLocaleString('vi-VN')} đ</td>
                              <td>
                                {order.conCanThuCOD > 0 ? (
                                  <span className="font-semibold text-red-600">
                                    {order.conCanThuCOD.toLocaleString('vi-VN')} đ
                                  </span>
                                ) : (
                                  <span className="text-gray-400">0 đ</span>
                                )}
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    navigate('/orders', { state: { orderId: order.maHoaDon } })
                                    setShowDetailModal(false)
                                  }}
                                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1"
                                  title="Xem chi tiết đơn hàng"
                                >
                                  <Eye size={16} />
                                  <ExternalLink size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold">
                            <td colSpan="3">Tổng cộng</td>
                            <td className="text-primary-600">
                              {customerOrders.reduce((sum, o) => sum + o.khachCanTra, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="text-green-600">
                              {customerOrders.reduce((sum, o) => sum + o.khachDaTra, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="text-red-600">
                              {customerOrders.reduce((sum, o) => sum + o.conCanThuCOD, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Công nợ */}
            {activeTab === 'debt' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="card">
                    <p className="text-sm text-gray-600">Tổng công nợ</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">
                      {selectedCustomer.noCanThuHienTai.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-600">Số đơn còn nợ</p>
                    <p className="text-2xl font-bold mt-1">
                      {customerDebt.length} đơn
                    </p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-600">Tổng đã trả</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                      {customerOrders.reduce((sum, o) => sum + o.khachDaTra, 0).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>

                {customerDebt.length === 0 ? (
                  <div className="card text-center py-12">
                    <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Khách hàng không có công nợ</p>
                  </div>
                ) : (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Chi tiết công nợ</h3>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th>Đã trả</th>
                            <th>Còn nợ</th>
                            <th>Tỷ lệ thanh toán</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerDebt.map((debt, index) => {
                            const paymentRate = ((debt.daTra / debt.tongTien) * 100).toFixed(1)
                            return (
                              <tr key={index}>
                                <td className="font-mono font-medium">{debt.maHoaDon}</td>
                                <td>{debt.ngayTao}</td>
                                <td>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    debt.trangThai === 'Đã giao' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {debt.trangThai}
                                  </span>
                                </td>
                                <td className="font-semibold">{debt.tongTien.toLocaleString('vi-VN')} đ</td>
                                <td className="text-green-600">{debt.daTra.toLocaleString('vi-VN')} đ</td>
                                <td>
                                  <span className="font-semibold text-red-600">
                                    {debt.conNo.toLocaleString('vi-VN')} đ
                                  </span>
                                </td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${paymentRate}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-12">{paymentRate}%</span>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => {
                                      navigate('/orders', { state: { orderId: debt.maHoaDon } })
                                      setShowDetailModal(false)
                                    }}
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1"
                                    title="Xem chi tiết đơn hàng"
                                  >
                                    <Eye size={16} />
                                    <ExternalLink size={14} />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold">
                            <td colSpan="3">Tổng cộng</td>
                            <td className="text-primary-600">
                              {customerDebt.reduce((sum, d) => sum + d.tongTien, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="text-green-600">
                              {customerDebt.reduce((sum, d) => sum + d.daTra, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="text-red-600">
                              {customerDebt.reduce((sum, d) => sum + d.conNo, 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers


