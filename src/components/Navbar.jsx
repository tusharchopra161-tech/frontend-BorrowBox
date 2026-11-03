import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../services/api.js'

export default function Navbar() {
    const user = getCurrentUser()
    const navigate = useNavigate();
    const handleLogout = () => {
        logout()
        navigate('/login')
    }
    return (
        <nav aria-label="Main navigation">
            <Link to="/home">BorrowBox</Link>
            {user ? (
                <div>
                    <Link to="/home">Explore</Link>
                    {user.role === 'owner' && <Link to="/owner">My listings</Link>}
                    <Link to="/profile">Profile</Link>
                    <button onClick={handleLogout}>Log out</button>
                </div>
            ) : (
                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                </div>
            )}
        </nav>
    )
}