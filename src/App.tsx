import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const Invoices = React.lazy(() => import('./components/invoices/Invoices').then(module => ({ default: module.Invoices })));
const InvoiceForm = React.lazy(() => import('./components/invoices/InvoiceForm').then(module => ({ default: module.InvoiceForm })));
const InvoicePreview = React.lazy(() => import('./components/invoices/InvoicePreview').then(module => ({ default: module.InvoicePreview })));
const Quotations = React.lazy(() => import('./components/quotations/Quotations').then(module => ({ default: module.Quotations })));
const QuotationForm = React.lazy(() => import('./components/quotations/QuotationForm').then(module => ({ default: module.QuotationForm })));
const QuotationPreview = React.lazy(() => import('./components/quotations/QuotationPreview').then(module => ({ default: module.QuotationPreview })));
const Customers = React.lazy(() => import('./components/customers/Customers').then(module => ({ default: module.Customers })));
const Products = React.lazy(() => import('./components/products/Products').then(module => ({ default: module.Products })));
const Settings = React.lazy(() => import('./components/settings/Settings').then(module => ({ default: module.Settings })));

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoicePreview />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/new" element={<QuotationForm />} />
              <Route path="/quotations/:id/edit" element={<QuotationForm />} />
              <Route path="/quotations/:id" element={<QuotationPreview />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
