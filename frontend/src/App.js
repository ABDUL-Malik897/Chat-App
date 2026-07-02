import { BrowserRouter ,Route , Routes} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './component/Navbar';
import ProtectedRoute from './component/ProtectedRoute';
import PublicRoute from './component/PublicRoute';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>}/>
        <Route path='/signup' element={<PublicRoute><Signup /></PublicRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
