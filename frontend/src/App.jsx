import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallansPage } from './pages/ChallansPage';
import { CreateChallanPage } from './pages/CreateChallanPage';
import { ChallanDetailPage } from './pages/ChallanDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/customers"
              element={
                <MainLayout>
                  <CustomersPage />
                </MainLayout>
              }
            />
            <Route
              path="/customer/:id"
              element={
                <MainLayout>
                  <CustomerDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/products"
              element={
                <MainLayout>
                  <ProductsPage />
                </MainLayout>
              }
            />
            <Route
              path="/inventory"
              element={
                <MainLayout>
                  <InventoryPage />
                </MainLayout>
              }
            />
            <Route
              path="/challans"
              element={
                <MainLayout>
                  <ChallansPage />
                </MainLayout>
              }
            />
            <Route
              path="/challans/new"
              element={
                <MainLayout>
                  <CreateChallanPage />
                </MainLayout>
              }
            />
            <Route
              path="/challan/:id"
              element={
                <MainLayout>
                  <ChallanDetailPage />
                </MainLayout>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
