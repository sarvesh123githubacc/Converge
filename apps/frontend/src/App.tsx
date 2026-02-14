import './App.css'
import { Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import SpacePage from './pages/Space';
import Landing from './pages/Landing';
import CreateSpace from './pages/CreateSpace';
import AddElements from './pages/AddElements';
import { ToastContainer, Zoom } from 'react-toastify';
import AddPrivateAreas from './pages/AddPrivateAreas';
import CheckHairScreen from './pages/CheckHairScreen';
import JoinSpace from './pages/JoinSpace';
import AboutUs from './pages/AboutUs';

function App()   {
    return(
      <div>
        <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/createspace' element={<CreateSpace/>}/>
        <Route path='/aboutus' element={<AboutUs/>}/>
        <Route path='/addelements/:spaceId' element={<AddElements/>}/>
        <Route path='/privateareas/:spaceId' element={<AddPrivateAreas/>}/>
        <Route path='/home/username/:username' element={<Home/>}/>
        <Route path='/space/:spaceId' element={<SpacePage/>}/>
        <Route path='/join/:spaceId' element={<CheckHairScreen/>}/>
        <Route path='/join-space' element={<JoinSpace/>}/>
        </Routes>
        <ToastContainer transition={Zoom} position="top-center" autoClose={3000} pauseOnHover limit={2}  hideProgressBar={false}/>
      </div>
    )
}

export default App;
