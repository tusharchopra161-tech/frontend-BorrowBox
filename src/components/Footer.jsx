import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export default function Footer() {
    return (
        <footer>
            <div>
                <section aria-labelledby="footer-brand">
                    <Link id="footer-brand" to="/">BorrowBox</Link>
                    <p>Borrow what you need. Share what you have. Build a more connected community.</p>
                </section>

                <nav aria-label="Footer navigation">
                    <div>
                        <h2>Explore</h2>
                        <Link to="/">Home</Link>
                        <Link to="/home">Browse items</Link>
                    </div>
                    <div>
                        <h2>Your account</h2>
                        <Link to="/login">Log in</Link>
                        <Link to="/signup">Create an account</Link>
                    </div>
                </nav>
            </div>
            <div>
                <p>&copy; {currentYear} BorrowBox</p>
                <p>Made for sharing in your community.</p>
            </div>
        </footer>
    )
}
