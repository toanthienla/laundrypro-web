import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '~/pages/Public/Home';
import Login from '~/pages/Auth/Login';
import Services from '~/pages/Public/Services';
import Contact from '~/pages/Public/Contact';
import ProtectedRoute from '~/components/ProtectedRoute';
import DashboardLayout from '~/components/DashboardLayout';
import Overview from '~/pages/Dashboard/Overview';
import OrderList from '~/pages/Dashboard/Orders/OrderList';
import PaymentList from '~/pages/Dashboard/Payments/PaymentList';
import CustomerList from '~/pages/Dashboard/Customers/CustomerList';
import ContactList from '~/pages/Dashboard/Contacts/ContactList';
import ServiceList from '~/pages/Dashboard/Services/ServiceList';
import UserList from '~/pages/Dashboard/Users/UserList';

// Customer Portal Imports
import CustomerLayout from '~/components/CustomerLayout';
import MyOrders from '~/pages/Customer/Orders/MyOrders';
import MyOrderDetails from '~/pages/Customer/Orders/MyOrderDetails';
import MyPayments from '~/pages/Customer/Payments/MyPayments';
import MyProfile from '~/pages/Customer/Profile/MyProfile';
import MySecurity from '~/pages/Customer/Security/MySecurity';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="services" element={<ServiceList />} />
            <Route path="users" element={<UserList />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Customer Portal Routes */}
        <Route path="/my" element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route index element={<Navigate to="/my/orders" replace />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:orderId" element={<MyOrderDetails />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="security" element={<MySecurity />} />
            <Route path="*" element={<Navigate to="/my/orders" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;