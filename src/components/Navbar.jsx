import { Link, useNavigate } from 'react-router-dom'
export default function Navbar() {
    return (
        <nav>
            <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                </>
        </nav>
    )
}