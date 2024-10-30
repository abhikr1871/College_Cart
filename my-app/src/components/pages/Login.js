import React, { useState } from "react";
import Header from '../header';
import './Login.css';

function Login() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 

  const collectData = () => {
    console.warn(username, password);
  };

  return (
    <div>
      <Header />
      <div className='inputbox'>
        <h2 id='info'>Username/College Email</h2>
        <input
          className='boxes'
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="College Name"
        />
        <h2 id='info'>Password</h2>
        <input
          className='boxes'
          type="password"  // Set this to "password" for security
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type='button' onClick={collectData} className='infobutton'>
          <h2>Login</h2>
        </button>
      </div>
    </div>
  );
}

export default Login;
