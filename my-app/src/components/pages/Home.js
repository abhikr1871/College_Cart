import Header from '../header';
import './Home.css';
import React from "react";
import Searchbar from '../Searchbar.js';
import Carousel from '../Carousel.js';

function Home() {
    

    return (
        <div>
            <div ></div> {/* Background Image */}
            <Header />
            <Searchbar />
            <div className="content"> {/* Wrap content to keep it above the background */}
                {/* <Carousel /> */}
            </div>


            <div className='content'>
            <h1>Welcome to College Cart</h1>
            <p>
                <b>Buy and sell second-hand items within your college community with ease.</b>
                <b>  Join us in promoting sustainability and affordability on campus.</b>
            </p>
             </div>   

        </div>
    );
}

export default Home;
