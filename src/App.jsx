import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Returns from './pages/Returns'
import Shipping from './pages/Shipping'
import Suppliers from './pages/Suppliers'
import PurchaseOrders from './pages/PurchaseOrders'
import SupplierReturns from './pages/SupplierReturns'
import DestroyOrders from './pages/DestroyOrders'
import Reconciliation from './pages/Reconciliation'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Users from './pages/Users'
import { FEATURES } from './contexts/AuthContext'
import { initializeVersion } from './services/versionService'
import VersionCheckWrapper from './components/VersionCheckWrapper'
import Landing from './pages/Landing'
import CreateOrder from './pages/CreateOrder'
import PointOfSale from './pages/PointOfSale'
import Pricing from './pages/Pricing'
import InventoryCheck from './pages/InventoryCheck'

function App() {
  // Khởi tạo version khi app khởi động
  useEffect(() => {
    initializeVersion()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <VersionCheckWrapper>
          <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.dashboard}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/products"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.products}>
                          <Products />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.orders}>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/create"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.orders}>
                          <CreateOrder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pos"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.orders}>
                          <PointOfSale />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/returns"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.returns}>
                          <Returns />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shipping"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.shipping}>
                          <Shipping />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/suppliers"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.suppliers}>
                          <Suppliers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/purchase-orders"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.purchaseOrders}>
                          <PurchaseOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/supplier-returns"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.supplierReturns}>
                          <SupplierReturns />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/destroy-orders"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.destroyOrders}>
                          <DestroyOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reconciliation"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.reconciliation}>
                          <Reconciliation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customers"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.customers}>
                          <Customers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.inventory}>
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.reports}>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.analytics}>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.settings}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.users}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pricing"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.pricing}>
                          <Pricing />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventory-check"
                      element={
                        <ProtectedRoute requiredFeature={FEATURES.inventoryCheck}>
                          <InventoryCheck />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
        </VersionCheckWrapper>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

