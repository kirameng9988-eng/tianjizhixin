import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Config from './pages/Config';
import Login from './pages/Login';
import ServiceConsole from './pages/ServiceConsole';
import AppMarketplace from './pages/AppMarketplace';
import TechServiceList from './pages/tech/TechServiceList';
import ResourceManagementList from './pages/tech/ResourceManagementList';
import ProductSwitcher from './components/ProductSwitcher';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProductSwitcher>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/config"
              element={
                <ProtectedRoute>
                  <Config />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-console"
              element={
                <ProtectedRoute>
                  <ServiceConsole />
                </ProtectedRoute>
              }
            >
              <Route index element={<TechServiceList />} />
              <Route path="tech-service" element={<TechServiceList />} />
              <Route path="resource-management" element={<ResourceManagementList />} />
            </Route>
            <Route
              path="/app-marketplace"
              element={
                <ProtectedRoute>
                  <AppMarketplace />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ProductSwitcher>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;