import { Link, useNavigate } from 'react-router-dom'
export default function Navbar() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navigate = useNavigate();
    const logout = () => { localStorage.clear(); navigate('/login'); }
    return (
        <nav>
            <Link to="/home"></Link>
            {user ? (
                <>
                    <Link to="/home">Dashboard</Link>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                </>
            )}
        </nav>
    )
}