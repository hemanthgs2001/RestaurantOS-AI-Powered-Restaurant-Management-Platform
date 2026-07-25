// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/common/ProtectedRoute';
// import Layout from './components/common/Layout';
// import Login from './components/auth/Login';
// import Register from './components/auth/Register';
// import Dashboard from './components/dashboard/Dashboard';
// import TableManagement from './components/restaurant/TableManagement';
// import OrderManagement from './components/restaurant/OrderManagement';
// import MenuManagement from './components/restaurant/MenuManagement';
// import RecipeManagement from './components/restaurant/RecipeManagement';
// import IngredientManagement from './components/restaurant/IngredientManagement';
// import SupplierManagement from './components/restaurant/SupplierManagement';
// import StaffManagement from './components/restaurant/StaffManagement';
// import ProductManagement from './components/inventory/ProductManagement';
// import CategoryManagement from './components/inventory/CategoryManagement';
// import WarehouseManagement from './components/inventory/WarehouseManagement';
// import StockInOut from './components/inventory/StockInOut';
// import PurchaseOrders from './components/inventory/PurchaseOrders';
// import ExpenseCategories from './components/expense/ExpenseCategories';
// import ExpenseRecords from './components/expense/ExpenseRecords';
// import SupplierInvoice from './components/expense/SupplierInvoice';
// import MonthlyExpenseTracking from './components/expense/MonthlyExpenseTracking';
// import AIDashboard from './components/ai/AIDashboard';
// import InvoiceProcessing from './components/ai/InvoiceProcessing';
// import StockPredictions from './components/ai/StockPredictions';
// import MenuRecommendations from './components/ai/MenuRecommendations';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="App">
//           <Toaster position="top-right" />
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/" element={<Navigate to="/dashboard" />} />
            
//             <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//               <Route path="/dashboard" element={<Dashboard />} />
              
//               {/* Restaurant Operations */}
//               <Route path="/tables" element={<TableManagement />} />
//               <Route path="/orders" element={<OrderManagement />} />
//               <Route path="/menu" element={<MenuManagement />} />
//               <Route path="/recipes" element={<RecipeManagement />} />
//               <Route path="/ingredients" element={<IngredientManagement />} />
//               <Route path="/suppliers" element={<SupplierManagement />} />
//               <Route path="/staff" element={<StaffManagement />} />
              
//               {/* Inventory Management */}
//               <Route path="/products" element={<ProductManagement />} />
//               <Route path="/categories" element={<CategoryManagement />} />
//               <Route path="/warehouses" element={<WarehouseManagement />} />
//               <Route path="/stock" element={<StockInOut />} />
//               <Route path="/purchase-orders" element={<PurchaseOrders />} />
              
//               {/* Expense Management */}
//               <Route path="/expense-categories" element={<ExpenseCategories />} />
//               <Route path="/expenses" element={<ExpenseRecords />} />
//               <Route path="/supplier-invoices" element={<SupplierInvoice />} />
//               <Route path="/monthly-expenses" element={<MonthlyExpenseTracking />} />
              
//               {/* AI Features */}
//               <Route path="/ai" element={<AIDashboard />} />
//               <Route path="/ai/invoice-processing" element={<InvoiceProcessing />} />
//               <Route path="/ai/stock-predictions" element={<StockPredictions />} />
// <Route path="/ai/menu-recommendations" element={<MenuRecommendations />} />
//             </Route>
//           </Routes>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import TableManagement from './components/restaurant/TableManagement';
import OrderManagement from './components/restaurant/OrderManagement';
import MenuManagement from './components/restaurant/MenuManagement';
import RecipeManagement from './components/restaurant/RecipeManagement';
import IngredientManagement from './components/restaurant/IngredientManagement';
import SupplierManagement from './components/restaurant/SupplierManagement';
import StaffManagement from './components/restaurant/StaffManagement';
import ProductManagement from './components/inventory/ProductManagement';
import CategoryManagement from './components/inventory/CategoryManagement';
import WarehouseManagement from './components/inventory/WarehouseManagement';
import StockInOut from './components/inventory/StockInOut';
import PurchaseOrders from './components/inventory/PurchaseOrders';
import ExpenseCategories from './components/expense/ExpenseCategories';
import ExpenseRecords from './components/expense/ExpenseRecords';
import SupplierInvoice from './components/expense/SupplierInvoice';
import MonthlyExpenseTracking from './components/expense/MonthlyExpenseTracking';
import AIDashboard from './components/ai/AIDashboard';
import InvoiceProcessing from './components/ai/InvoiceProcessing';
import StockPredictions from './components/ai/StockPredictions';
import MenuRecommendations from './components/ai/MenuRecommendations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - wrapped with Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Restaurant Operations */}
                <Route path="/tables" element={<TableManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/menu" element={<MenuManagement />} />
                <Route path="/recipes" element={<RecipeManagement />} />
                <Route path="/ingredients" element={<IngredientManagement />} />
                <Route path="/suppliers" element={<SupplierManagement />} />
                <Route path="/staff" element={<StaffManagement />} />
                
                {/* Inventory Management */}
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/categories" element={<CategoryManagement />} />
                <Route path="/warehouses" element={<WarehouseManagement />} />
                <Route path="/stock" element={<StockInOut />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                
                {/* Expense Management */}
                <Route path="/expense-categories" element={<ExpenseCategories />} />
                <Route path="/expenses" element={<ExpenseRecords />} />
                <Route path="/supplier-invoices" element={<SupplierInvoice />} />
                <Route path="/monthly-expenses" element={<MonthlyExpenseTracking />} />
                
                {/* AI Features */}
                <Route path="/ai" element={<AIDashboard />} />
                <Route path="/ai/invoice-processing" element={<InvoiceProcessing />} />
                <Route path="/ai/stock-predictions" element={<StockPredictions />} />
                <Route path="/ai/menu-recommendations" element={<MenuRecommendations />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;