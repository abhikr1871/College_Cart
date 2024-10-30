import React from 'react'
import  './Login.css'
import Header from '../header';

const SignUp=()=>{

    return(
        <div>
            
        <Header/>
       <div className='inputbox'>
       <h2 id='info'>Name</h2>
       <input className='boxes'
        type="text"
        placeholder="Name"
       />
       
       <h2 id='info'>College Name</h2>
       <input className='boxes'
        type="text"
        placeholder="College Name"
       />
        <h2 id='info'>Registeration Number</h2>
       <input className='boxes'
        type="number"
        placeholder="Registeration_Number"
       />
          <h2 id='info'>College Email</h2>
       <input className='boxes'
        type="text"
        placeholder="College Email"
       />
        
        <button type='button' className='infobutton'>
          <h2>SignUp</h2>
        </button>


      </div>

        </div>
    )
}
export default SignUp;