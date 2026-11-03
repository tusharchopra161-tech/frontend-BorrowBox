import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="layout-content"><Outlet /></main>
            <Footer />
        </div>
    )
}