import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/RouteGuards';
import { PageLoader } from '../components/common/PageLoader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const LoginPage = lazy(() => import('../pages/LoginPage/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../pages/SignupPage/SignupPage').then(m => ({ default: m.SignupPage })));
const ItemList = lazy(() => import('../pages/ItemList/ItemList').then(m => ({ default: m.ItemList })));
const InvoiceList = lazy(() => import('../pages/InvoiceList/InvoiceList').then(m => ({ default: m.InvoiceList })));
const InvoiceEditor = lazy(() => import('../pages/InvoiceEditor/InvoiceEditor').then(m => ({ default: m.InvoiceEditor })));
const InvoicePrint = lazy(() => import('../pages/InvoicePrint/InvoicePrint').then(m => ({ default: m.InvoicePrint })));
const PageNotFound = lazy(() => import('../pages/PageNotFound/PageNotFound').then(m => ({ default: m.PageNotFound })));

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />

          <Route 
            path="/items" 
            element={
              <ProtectedRoute>
                <ItemList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/editor" 
            element={
              <ProtectedRoute>
                <InvoiceEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/print/:id" 
            element={
              <ProtectedRoute>
                <InvoicePrint />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/invoices" replace />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
export default AppRoutes;
