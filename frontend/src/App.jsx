import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AutoLogoutHandler from './components/AutoLogoutHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AgeGateModal from './components/AgeGateModal';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import MerchScreen from './screens/MerchScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import OrderTypeScreen from './screens/OrderTypeScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileDashboardScreen from './screens/ProfileDashboardScreen';
import EditContactScreen from './screens/EditContactScreen';
import EditDeliveryScreen from './screens/EditDeliveryScreen';
import EditBankScreen from './screens/EditBankScreen';
import VerificationScreen from './screens/VerificationScreen';


const App = () => {
  return (
    <Router>
      <AutoLogoutHandler>
      <AgeGateModal />
        <Header />
        <ToastContainer position="top-center" theme="dark" autoClose={3000} />
        <main>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/merch" element={<MerchScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path='/order-type' element={<OrderTypeScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderConfirmationScreen />} />
            <Route path="/profile" element={<ProfileDashboardScreen />} />
            <Route path="/verify" element={<VerificationScreen />} />
            <Route path="/profile/contact" element={<EditContactScreen />} />
            <Route path="/profile/delivery" element={<EditDeliveryScreen />} />
            <Route path="/profile/bank" element={<EditBankScreen />} />
          </Routes>
        </main>
      </AutoLogoutHandler>
    </Router>
  );
};

export default App;