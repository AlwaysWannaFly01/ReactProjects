import React from "react";
import {
    BrowserRouter,
    Route,
    Routes
} from "react-router-dom";
import Home from './components/home';
import Page1 from './components/Page1';
import F2Demo from './components/F2Demo';
import F2Demo2 from './components/F2Demo2';

export default function App() {
    return (
        // 当前最新的react-router-dom版本 v6
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/page1/:name" element={<Page1/>}/>
                <Route path="/f2demo" element={<F2Demo/>}/>
                <Route path="/f2demo2" element={<F2Demo2/>}/>
                <Route path="about/*" element={<About/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Routes>
        </BrowserRouter>
    );
}

function About() {
    return (
        <div>
            <h2>About</h2>
        </div>
    );
}

function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
        </div>
    );
}
