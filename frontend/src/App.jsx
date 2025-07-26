import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./Pages/LandingPage";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import NotFoundPage from "./Pages/NotFoundPage";
import Layout from './Pages/Layout';
import Contact from './Pages/Contact';
import About from './Pages/About';
import OAuthSuccess from './Pages/OAuthSuccess';

function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path='/' element={ <Layout/>}>
                <Route index element={<LandingPage/>}/>
                <Route path='/login' element={<LoginPage />}/>
                <Route path='/signup' element={<SignUpPage/>}/>
                <Route path='/dashboard' element={<Dashboard/>}/>
                <Route path='/oauth-success' element={<OAuthSuccess/>}/>
                <Route path='/about' element={<About/>}/>
                <Route path='/contact' element={<Contact/>}/>
                <Route path='*' element={<NotFoundPage/>}/>
            </Route>
        </Routes>
      </BrowserRouter>
  );
}


export default App;