import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from "./components/pages/Home.js"
import Login from "./components/pages/Login.js"
import Signup from './components/pages/Signup.js'
import Buy from './components/pages/Buy.js'

    function App() {
      return (
        <div>
          <BrowserRouter>
          <Routes>
            <Route index element={<Home/>}/>
            <Route path="/Home" element={<Home/>}/>
            <Route path="/Login" element={<Login/>}/>
            <Route path="/Signup" element={<Signup/>}/>
            <Route path="/Buy" element={<Buy/>}/>

            
          </Routes>
          </BrowserRouter>
        </div>
      );
    }
 
export default App;
