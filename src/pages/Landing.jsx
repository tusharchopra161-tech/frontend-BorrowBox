import { Link } from 'react-router-dom'

export default function Landing() {
    return (
        <section>
            <p>A LITTLE MORE SHARING</p>
            <h1>Good things are better when shared.</h1>
            <p>Borrow what you need from your neighbors. Lend what you have. Build a more connected community.</p>
            <div>
                <Link to="/signup">Get started</Link>
                <Link to="/login">Try the demo</Link>
            </div>
        </section>
    )
}
