import { useState } from 'react'
import { Search, Plus, Eye, FileText, Truck, ShoppingBag, CheckCircle, X, AlertCircle, Upload, File, Trash2 } from 'lucide-react'

const Reconciliation = () => {
  const [activeTab, setActiveTab] = useState('shipping') // 'shipping' or 'marketplace'
  
  const [shippingReconciliations, setShippingReconciliations] = useState([
    {
      id: 1,
      maDoiSoat: 'DSGH001',
      doiTacGiaoHang: 'GHN',
      ngayDoiSoat: '2024-01-20',
      thoiGianTao: '2024-01-20 09:00:00',
      nguoiTao: 'Admin',
      trangThai: 'Đã đối soát',
      soLuongDon: 150,
      tongTienGiaoHang: 15000000,
      tienThucNhan: 14800000,
      chenhLech: -200000,
      lyDoChenhLech: 'Phí phát sinh do đổi địa chỉ',
      ghiChu: 'Đối soát tháng 1/2024',
      chiTiet: [
        { maDon: 'DH001', tienGiaoHang: 50000, tienThucNhan: 50000, chenhLech: 0 },
        { maDon: 'DH002', tienGiaoHang: 30000, tienThucNhan: 25000, chenhLech: -5000 },
      ]
    },
    {
      id: 2,
      maDoiSoat: 'DSGH002',
      doiTacGiaoHang: 'Viettel Post',
      ngayDoiSoat: '2024-01-21',
      thoiGianTao: '2024-01-21 10:00:00',
      nguoiTao: 'Staff01',
      trangThai: 'Chờ đối soát',
      soLuongDon: 200,
      tongTienGiaoHang: 18000000,
      tienThucNhan: 0,
      chenhLech: 0,
      lyDoChenhLech: '',
      ghiChu: '',
      chiTiet: []
    },
  ])

  const [marketplaceReconciliations, setMarketplaceReconciliations] = useState([
    {
      id: 1,
      maDoiSoat: 'DSMT001',
      sanThuongMaiDienTu: 'Shopee',
      ngayDoiSoat: '2024-01-20',
      thoiGianTao: '2024-01-20 14:00:00',
      nguoiTao: 'Admin',
      trangThai: 'Đã đối soát',
      soLuongDon: 300,
      tongTienDonHang: 50000000,
      tongTienThucNhan: 48500000,
      tongPhiSan: 1000000,
      tongPhiGiaoHang: 500000,
      chenhLech: -1000000,
      lyDoChenhLech: 'Phí hoàn trả và phí dịch vụ',
      ghiChu: 'Đối soát Shopee tháng 1/2024',
      chiTiet: [
        { maDon: 'DH101', tienDonHang: 500000, tienThucNhan: 490000, phiSan: 10000, phiGiaoHang: 0, chenhLech: -10000 },
        { maDon: 'DH102', tienDonHang: 300000, tienThucNhan: 295000, phiSan: 5000, phiGiaoHang: 0, chenhLech: -5000 },
      ]
    },
    {
      id: 2,
      maDoiSoat: 'DSMT002',
      sanThuongMaiDienTu: 'TikTok Shop',
      ngayDoiSoat: '2024-01-21',
      thoiGianTao: '2024-01-21 15:00:00',
      nguoiTao: 'Staff01',
      trangThai: 'Chờ đối soát',
      soLuongDon: 250,
      tongTienDonHang: 45000000,
      tongTienThucNhan: 0,
      tongPhiSan: 0,
      tongPhiGiaoHang: 0,
      chenhLech: 0,
      lyDoChenhLech: '',
      ghiChu: '',
      chiTiet: []
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedReconciliation, setSelectedReconciliation] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState('shipping') // 'shipping' or 'marketplace'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadFormData, setUploadFormData] = useState({
    doiTacGiaoHang: '',
    sanThuongMaiDienTu: '',
    ngayDoiSoat: new Date().toISOString().split('T')[0],
    ghiChu: ''
  })

  const filteredShipping = shippingReconciliations.filter(item => {
    const matchesSearch = item.maDoiSoat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.doiTacGiaoHang.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.trangThai === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredMarketplace = marketplaceReconciliations.filter(item => {
    const matchesSearch = item.maDoiSoat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sanThuongMaiDienTu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.trangThai === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã đối soát':
        return 'bg-green-100 text-green-800'
      case 'Chờ đối soát':
        return 'bg-yellow-100 text-yellow-800'
      case 'Đang đối soát':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã đối soát':
        return <CheckCircle size={16} />
      case 'Chờ đối soát':
        return <AlertCircle size={16} />
      case 'Đang đối soát':
        return <FileText size={16} />
      default:
        return null
    }
  }

  const handleCreateReconciliation = () => {
    if (!uploadedFile) {
      alert('Vui lòng chọn file để upload!')
      return
    }

    // Simulate file processing
    const reader = new FileReader()
    reader.onload = (e) => {
      // In real application, you would parse the file here
      // For now, we'll create a mock reconciliation entry
      const newId = uploadType === 'shipping' 
        ? shippingReconciliations.length + 1
        : marketplaceReconciliations.length + 1

      const maDoiSoat = uploadType === 'shipping'
        ? `DSGH${String(newId).padStart(3, '0')}`
        : `DSMT${String(newId).padStart(3, '0')}`

      if (uploadType === 'shipping') {
        const newReconciliation = {
          id: newId,
          maDoiSoat,
          doiTacGiaoHang: uploadFormData.doiTacGiaoHang,
          ngayDoiSoat: uploadFormData.ngayDoiSoat,
          thoiGianTao: new Date().toLocaleString('vi-VN'),
          nguoiTao: 'Admin',
          trangThai: 'Chờ đối soát',
          soLuongDon: 0, // Will be calculated from file
          tongTienGiaoHang: 0,
          tienThucNhan: 0,
          chenhLech: 0,
          lyDoChenhLech: '',
          ghiChu: uploadFormData.ghiChu,
          chiTiet: []
        }
        setShippingReconciliations([...shippingReconciliations, newReconciliation])
      } else {
        const newReconciliation = {
          id: newId,
          maDoiSoat,
          sanThuongMaiDienTu: uploadFormData.sanThuongMaiDienTu,
          ngayDoiSoat: uploadFormData.ngayDoiSoat,
          thoiGianTao: new Date().toLocaleString('vi-VN'),
          nguoiTao: 'Admin',
          trangThai: 'Chờ đối soát',
          soLuongDon: 0,
          tongTienDonHang: 0,
          tongTienThucNhan: 0,
          tongPhiSan: 0,
          tongPhiGiaoHang: 0,
          chenhLech: 0,
          lyDoChenhLech: '',
          ghiChu: uploadFormData.ghiChu,
          chiTiet: []
        }
        setMarketplaceReconciliations([...marketplaceReconciliations, newReconciliation])
      }

      alert(`Đã tạo phiếu đối soát ${maDoiSoat} thành công!\n\nFile đã được upload và đang được xử lý.`)
      
      setShowUploadModal(false)
      setUploadedFile(null)
      setUploadFormData({
        doiTacGiaoHang: '',
        sanThuongMaiDienTu: '',
        ngayDoiSoat: new Date().toISOString().split('T')[0],
        ghiChu: ''
      })
    }

    // Read file as text (for CSV) or use a library for Excel
    if (uploadedFile.name.endsWith('.csv')) {
      reader.readAsText(uploadedFile)
    } else {
      reader.readAsArrayBuffer(uploadedFile)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đối soát Tiền thực nhận</h1>
          <p className="text-gray-600">Quản lý đối soát tiền với đơn vị giao hàng và các sàn thương mại điện tử</p>
        </div>
        <button 
          onClick={() => {
            setShowUploadModal(true)
            setUploadType(activeTab)
            setUploadedFile(null)
            setUploadFormData({
              doiTacGiaoHang: '',
              sanThuongMaiDienTu: '',
              ngayDoiSoat: new Date().toISOString().split('T')[0],
              ghiChu: ''
            })
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo phiếu đối soát
        </button>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'shipping'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Truck size={20} />
              <span>Đối soát Giao hàng</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'marketplace'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              <span>Đối soát Sàn TMĐT</span>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu đối soát..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ đối soát">Chờ đối soát</option>
            <option value="Đang đối soát">Đang đối soát</option>
            <option value="Đã đối soát">Đã đối soát</option>
          </select>
        </div>
      </div>

      {/* Shipping Reconciliation Table */}
      {activeTab === 'shipping' && (
        <>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đối soát</th>
                    <th>Đối tác giao hàng</th>
                    <th>Ngày đối soát</th>
                    <th>Số lượng đơn</th>
                    <th>Tổng tiền giao hàng</th>
                    <th>Tiền thực nhận</th>
                    <th>Chênh lệch</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipping.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono font-medium">{item.maDoiSoat}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-primary-600" />
                          {item.doiTacGiaoHang}
                        </div>
                      </td>
                      <td>{item.ngayDoiSoat}</td>
                      <td>{item.soLuongDon}</td>
                      <td className="font-semibold">
                        {item.tongTienGiaoHang.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="font-semibold text-blue-600">
                        {item.tienThucNhan.toLocaleString('vi-VN')} đ
                      </td>
                      <td className={`font-semibold ${
                        item.chenhLech < 0 ? 'text-red-600' : item.chenhLech > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.chenhLech !== 0 ? (item.chenhLech > 0 ? '+' : '') : ''}
                        {item.chenhLech.toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          getStatusColor(item.trangThai)
                        }`}>
                          {getStatusIcon(item.trangThai)}
                          {item.trangThai}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedReconciliation(item)
                            setShowDetail(true)
                          }}
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng phiếu đối soát</p>
              <p className="text-2xl font-bold mt-1">{shippingReconciliations.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Đã đối soát</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {shippingReconciliations.filter(r => r.trangThai === 'Đã đối soát').length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng tiền giao hàng</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {shippingReconciliations.reduce((sum, r) => sum + r.tongTienGiaoHang, 0).toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng chênh lệch</p>
              <p className={`text-2xl font-bold mt-1 ${
                shippingReconciliations.reduce((sum, r) => sum + r.chenhLech, 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {shippingReconciliations.reduce((sum, r) => sum + r.chenhLech, 0).toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </>
      )}

      {/* Marketplace Reconciliation Table */}
      {activeTab === 'marketplace' && (
        <>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đối soát</th>
                    <th>Sàn TMĐT</th>
                    <th>Ngày đối soát</th>
                    <th>Số lượng đơn</th>
                    <th>Tổng tiền đơn hàng</th>
                    <th>Tiền thực nhận</th>
                    <th>Phí sàn</th>
                    <th>Phí giao hàng</th>
                    <th>Chênh lệch</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarketplace.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono font-medium">{item.maDoiSoat}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={16} className="text-primary-600" />
                          {item.sanThuongMaiDienTu}
                        </div>
                      </td>
                      <td>{item.ngayDoiSoat}</td>
                      <td>{item.soLuongDon}</td>
                      <td className="font-semibold">
                        {item.tongTienDonHang.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="font-semibold text-blue-600">
                        {item.tongTienThucNhan.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="text-orange-600">
                        {item.tongPhiSan.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="text-purple-600">
                        {item.tongPhiGiaoHang.toLocaleString('vi-VN')} đ
                      </td>
                      <td className={`font-semibold ${
                        item.chenhLech < 0 ? 'text-red-600' : item.chenhLech > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.chenhLech !== 0 ? (item.chenhLech > 0 ? '+' : '') : ''}
                        {item.chenhLech.toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          getStatusColor(item.trangThai)
                        }`}>
                          {getStatusIcon(item.trangThai)}
                          {item.trangThai}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedReconciliation(item)
                            setShowDetail(true)
                          }}
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng phiếu đối soát</p>
              <p className="text-2xl font-bold mt-1">{marketplaceReconciliations.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Đã đối soát</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {marketplaceReconciliations.filter(r => r.trangThai === 'Đã đối soát').length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng tiền đơn hàng</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {marketplaceReconciliations.reduce((sum, r) => sum + r.tongTienDonHang, 0).toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng chênh lệch</p>
              <p className={`text-2xl font-bold mt-1 ${
                marketplaceReconciliations.reduce((sum, r) => sum + r.chenhLech, 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {marketplaceReconciliations.reduce((sum, r) => sum + r.chenhLech, 0).toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selectedReconciliation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText size={24} />
                Chi tiết đối soát: {selectedReconciliation.maDoiSoat}
              </h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedReconciliation(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {activeTab === 'shipping' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-600">Đối tác giao hàng:</span>
                    <div className="font-medium flex items-center gap-2 mt-1">
                      <Truck size={20} className="text-primary-600" />
                      {selectedReconciliation.doiTacGiaoHang}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày đối soát:</span>
                    <div className="font-medium mt-1">{selectedReconciliation.ngayDoiSoat}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Số lượng đơn:</span>
                    <div className="font-medium mt-1">{selectedReconciliation.soLuongDon}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        getStatusColor(selectedReconciliation.trangThai)
                      }`}>
                        {getStatusIcon(selectedReconciliation.trangThai)}
                        {selectedReconciliation.trangThai}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng tiền giao hàng:</span>
                    <div className="font-semibold text-lg mt-1">
                      {selectedReconciliation.tongTienGiaoHang.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền thực nhận:</span>
                    <div className="font-semibold text-lg text-blue-600 mt-1">
                      {selectedReconciliation.tienThucNhan.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Chênh lệch:</span>
                    <div className={`font-semibold text-lg mt-1 ${
                      selectedReconciliation.chenhLech < 0 ? 'text-red-600' : 
                      selectedReconciliation.chenhLech > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {selectedReconciliation.chenhLech !== 0 ? (selectedReconciliation.chenhLech > 0 ? '+' : '') : ''}
                      {selectedReconciliation.chenhLech.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  {selectedReconciliation.lyDoChenhLech && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Lý do chênh lệch:</span>
                      <div className="font-medium mt-1">{selectedReconciliation.lyDoChenhLech}</div>
                    </div>
                  )}
                  {selectedReconciliation.ghiChu && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Ghi chú:</span>
                      <div className="font-medium mt-1">{selectedReconciliation.ghiChu}</div>
                    </div>
                  )}
                </div>

                {selectedReconciliation.chiTiet && selectedReconciliation.chiTiet.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Tiền giao hàng</th>
                          <th>Tiền thực nhận</th>
                          <th>Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReconciliation.chiTiet.map((ct, index) => (
                          <tr key={index}>
                            <td className="font-mono">{ct.maDon}</td>
                            <td>{ct.tienGiaoHang.toLocaleString('vi-VN')} đ</td>
                            <td>{ct.tienThucNhan.toLocaleString('vi-VN')} đ</td>
                            <td className={ct.chenhLech < 0 ? 'text-red-600' : ct.chenhLech > 0 ? 'text-green-600' : ''}>
                              {ct.chenhLech !== 0 ? (ct.chenhLech > 0 ? '+' : '') : ''}
                              {ct.chenhLech.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-600">Sàn TMĐT:</span>
                    <div className="font-medium flex items-center gap-2 mt-1">
                      <ShoppingBag size={20} className="text-primary-600" />
                      {selectedReconciliation.sanThuongMaiDienTu}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày đối soát:</span>
                    <div className="font-medium mt-1">{selectedReconciliation.ngayDoiSoat}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Số lượng đơn:</span>
                    <div className="font-medium mt-1">{selectedReconciliation.soLuongDon}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        getStatusColor(selectedReconciliation.trangThai)
                      }`}>
                        {getStatusIcon(selectedReconciliation.trangThai)}
                        {selectedReconciliation.trangThai}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng tiền đơn hàng:</span>
                    <div className="font-semibold text-lg mt-1">
                      {selectedReconciliation.tongTienDonHang.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền thực nhận:</span>
                    <div className="font-semibold text-lg text-blue-600 mt-1">
                      {selectedReconciliation.tongTienThucNhan.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng phí sàn:</span>
                    <div className="font-semibold text-lg text-orange-600 mt-1">
                      {selectedReconciliation.tongPhiSan.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng phí giao hàng:</span>
                    <div className="font-semibold text-lg text-purple-600 mt-1">
                      {selectedReconciliation.tongPhiGiaoHang.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Chênh lệch:</span>
                    <div className={`font-semibold text-lg mt-1 ${
                      selectedReconciliation.chenhLech < 0 ? 'text-red-600' : 
                      selectedReconciliation.chenhLech > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {selectedReconciliation.chenhLech !== 0 ? (selectedReconciliation.chenhLech > 0 ? '+' : '') : ''}
                      {selectedReconciliation.chenhLech.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  {selectedReconciliation.lyDoChenhLech && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Lý do chênh lệch:</span>
                      <div className="font-medium mt-1">{selectedReconciliation.lyDoChenhLech}</div>
                    </div>
                  )}
                  {selectedReconciliation.ghiChu && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Ghi chú:</span>
                      <div className="font-medium mt-1">{selectedReconciliation.ghiChu}</div>
                    </div>
                  )}
                </div>

                {selectedReconciliation.chiTiet && selectedReconciliation.chiTiet.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Tiền đơn hàng</th>
                          <th>Tiền thực nhận</th>
                          <th>Phí sàn</th>
                          <th>Phí giao hàng</th>
                          <th>Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReconciliation.chiTiet.map((ct, index) => (
                          <tr key={index}>
                            <td className="font-mono">{ct.maDon}</td>
                            <td>{ct.tienDonHang.toLocaleString('vi-VN')} đ</td>
                            <td>{ct.tienThucNhan.toLocaleString('vi-VN')} đ</td>
                            <td className="text-orange-600">{ct.phiSan.toLocaleString('vi-VN')} đ</td>
                            <td className="text-purple-600">{ct.phiGiaoHang.toLocaleString('vi-VN')} đ</td>
                            <td className={ct.chenhLech < 0 ? 'text-red-600' : ct.chenhLech > 0 ? 'text-green-600' : ''}>
                              {ct.chenhLech !== 0 ? (ct.chenhLech > 0 ? '+' : '') : ''}
                              {ct.chenhLech.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Upload size={24} />
                Tạo phiếu đối soát từ file
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadedFile(null)
                  setUploadFormData({
                    doiTacGiaoHang: '',
                    sanThuongMaiDienTu: '',
                    ngayDoiSoat: new Date().toISOString().split('T')[0],
                    ghiChu: ''
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              handleCreateReconciliation()
            }} className="space-y-6">
              {/* Upload Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại đối soát</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadType('shipping')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      uploadType === 'shipping'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck size={24} className={uploadType === 'shipping' ? 'text-primary-600' : 'text-gray-400'} />
                      <div className="text-left">
                        <div className={`font-medium ${uploadType === 'shipping' ? 'text-primary-600' : 'text-gray-700'}`}>
                          Đối soát Giao hàng
                        </div>
                        <div className="text-xs text-gray-500">Upload file từ đơn vị giao hàng</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('marketplace')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      uploadType === 'marketplace'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={24} className={uploadType === 'marketplace' ? 'text-primary-600' : 'text-gray-400'} />
                      <div className="text-left">
                        <div className={`font-medium ${uploadType === 'marketplace' ? 'text-primary-600' : 'text-gray-700'}`}>
                          Đối soát Sàn TMĐT
                        </div>
                        <div className="text-xs text-gray-500">Upload file từ sàn thương mại điện tử</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {uploadType === 'shipping' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đối tác giao hàng *</label>
                    <select
                      required
                      value={uploadFormData.doiTacGiaoHang}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, doiTacGiaoHang: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Chọn đối tác</option>
                      <option value="GHN">GHN</option>
                      <option value="Viettel Post">Viettel Post</option>
                      <option value="GHTK">GHTK</option>
                      <option value="J&T Express">J&T Express</option>
                      <option value="Ninja Van">Ninja Van</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sàn TMĐT *</label>
                    <select
                      required
                      value={uploadFormData.sanThuongMaiDienTu}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, sanThuongMaiDienTu: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Chọn sàn</option>
                      <option value="Shopee">Shopee</option>
                      <option value="Lazada">Lazada</option>
                      <option value="TikTok Shop">TikTok Shop</option>
                      <option value="Facebook Shop">Facebook Shop</option>
                      <option value="Tiki">Tiki</option>
                      <option value="Sendo">Sendo</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đối soát *</label>
                  <input
                    type="date"
                    required
                    value={uploadFormData.ngayDoiSoat}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, ngayDoiSoat: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload file đối soát *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
                  {!uploadedFile ? (
                    <div className="text-center">
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              setUploadedFile(file)
                            }
                          }}
                          className="hidden"
                        />
                        <div className="btn-primary inline-flex items-center gap-2">
                          <Upload size={20} />
                          Chọn file
                        </div>
                      </label>
                      <p className="text-sm text-gray-500 mt-3">
                        Chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Kích thước tối đa: 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <File size={24} className="text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                          <div className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Format Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Định dạng file yêu cầu:</h3>
                {uploadType === 'shipping' ? (
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Cột 1: Mã đơn hàng</p>
                    <p>• Cột 2: Tiền giao hàng (VND)</p>
                    <p>• Cột 3: Tiền thực nhận (VND) - Tùy chọn</p>
                    <p>• Cột 4: Lý do chênh lệch - Tùy chọn</p>
                  </div>
                ) : (
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Cột 1: Mã đơn hàng</p>
                    <p>• Cột 2: Tiền đơn hàng (VND)</p>
                    <p>• Cột 3: Tiền thực nhận (VND) - Tùy chọn</p>
                    <p>• Cột 4: Phí sàn (VND) - Tùy chọn</p>
                    <p>• Cột 5: Phí giao hàng (VND) - Tùy chọn</p>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={uploadFormData.ghiChu}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, ghiChu: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Nhập ghi chú (tùy chọn)..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1" disabled={!uploadedFile}>
                  <Upload size={20} className="inline mr-2" />
                  Tạo phiếu đối soát
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                    setUploadFormData({
                      doiTacGiaoHang: '',
                      sanThuongMaiDienTu: '',
                      ngayDoiSoat: new Date().toISOString().split('T')[0],
                      ghiChu: ''
                    })
                  }}
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

export default Reconciliation

