import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';

const App = () => {
  return (
    <Router>
      <main>
        <Routes>
          {/* If the URL is exactly '/', show the Home Screen */}
          <Route path="/" element={<HomeScreen />} />
          
          {/* If the URL has an ID at the end, show the Product Screen */}
          <Route path="/product/:id" element={<ProductScreen />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;