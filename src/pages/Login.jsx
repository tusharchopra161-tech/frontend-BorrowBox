import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api.js'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (event, useDemo = false) => {
        event.preventDefault()
        setError('')
        try {
            const user = await login(useDemo ? { email: 'demo@borrowbox.com', password: 'demo1234' } : form)
            navigate(user.role === 'owner' ? '/owner' : '/home')
        } catch (loginError) {
            setError(loginError.message)
        }
    }

    return (
        <section>
            <Link to="/">BorrowBox</Link>
            <h1>Welcome back</h1>
            <p>Sign in to manage your BorrowBox activity.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="login-email">Email address</label>
                <input id="login-email" name="email" type="email" autoComplete="email" required
                    value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <label htmlFor="login-password">Password</label>
                <input id="login-password" name="password" type="password" autoComplete="current-password" required
                    value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                {error && <p role="alert">{error}</p>}
                <button type="submit">Sign in</button>
            </form>
            <button onClick={(event) => handleSubmit(event, true)}>
                Continue with demo account
            </button>
            <p>New to BorrowBox? <Link to="/signup">Create an account</Link></p>
            <p>Demo account: demo@borrowbox.com / demo1234</p>
        </section>
    )
}
