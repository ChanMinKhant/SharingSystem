import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Register,
  EmailVerification,
  Login,
  Logout,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
} from './pages/auth/index';
import { FileUploadPage } from './pages/file/index';
import { Url, RedirectPage } from './pages/url/index';
import { Host, ViewHost } from './pages/host/index';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-email/:token' element={<EmailVerification />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/logout' element={<Logout />} />
        // forgotPassword route
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        // nested route base url is /files
        <Route path='/files' element={<FileUploadPage />} />
        <Route path='/url' element={<Url />} />
        <Route path='/url/:shortUrl' element={<RedirectPage />} />
        <Route path='/host' element={<Host />} />
        <Route path='/' element={<ViewHost />} />
      </Routes>
    </Router>
  );
}

export default App;
