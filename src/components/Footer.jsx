import { Link } from 'react-router-dom'
import './Footer.css'

const currentYear = new Date().getFullYear()

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <section className="footer-about" aria-labelledby="footer-brand">
                    <Link className="footer-brand" id="footer-brand" to="/">BorrowBox</Link>
                    <p>Borrow what you need. Share what you have. Build a more connected community.</p>
                </section>

                <nav className="footer-links" aria-label="Footer navigation">
                    <div className="footer-column">
                        <h2>Explore</h2>
                        <Link to="/">Home</Link>
                        <Link to="/home">Browse items</Link>
                    </div>
                    <div className="footer-column">
                        <h2>Your account</h2>
                        <Link to="/login">Log in</Link>
                        <Link to="/signup">Create an account</Link>
                    </div>
                </nav>
            </div>
            <div className="footer-bottom">
                <p>&copy; {currentYear} BorrowBox</p>
                <p>Made for sharing in your community.</p>
            </div>
        </footer>
    )
}
