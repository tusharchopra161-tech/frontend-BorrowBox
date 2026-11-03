import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Layout from './components/Layout.jsx'
// import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Landing from './pages/Landing.jsx'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}