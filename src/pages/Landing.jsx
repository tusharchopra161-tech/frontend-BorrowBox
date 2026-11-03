import { Link } from 'react-router-dom'

export default function Landing() {
    return (
        <main>
            <header>
                <Link to="/" aria-label="BorrowBox">BorrowBox</Link>
                <nav aria-label="Main navigation">
                    <Link to="/login">Log in</Link>
                    {' '}
                    <Link to="/signup">Create account</Link>
                </nav>
            </header>

        </main>
    )
}
