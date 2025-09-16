// @ts-nocheck
import './App.css'
import { useEffect } from 'react';
import { Route, Routes, Router } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';

function App()   {
    return(
      <div>
        <Routes>
        <Route path='/' element={<Signup/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/home' element={<Home/>}/>
        </Routes>
      </div>
    )
}

export default App;
