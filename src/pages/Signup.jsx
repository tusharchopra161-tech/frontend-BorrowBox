import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import { api } from '../services/api.js'

const backendAPI = "https://backend-borrowbox.onrender.com"
export default function Signup() {
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
        if (error) setError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (isSubmitting) return

        const name = form.name.trim()
        const email = form.email.trim().toLowerCase()

        if (!name || !email) {
            setError('Please complete all fields.')
            return
        }

        if (form.password.length < 8) {
            setError('Choose a password with at least 8 characters.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            console.log(form)
            const response = await fetch(`${backendAPI}/api/createuser`, {
                method: "POST", headers: { "Content-Type": "application/json", },
                body: JSON.stringify(form),
            }
            );
            console.log(response)
            navigate('/dashboard', { replace: true })
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Unable to create your account. Please try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main>
            <header>
                <Link to="/" aria-label="AttenTrack home">AttenTrack</Link>
            </header>

            <section aria-labelledby="signup-title">
                <h1 >Create your account</h1>
                <p>Get started with BorrowBox.</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="signup-name">Full name</label>
                    <input
                        id="signup-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        disabled={isSubmitting}
                    />

                    <label >Email address</label>
                    <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        disabled={isSubmitting}
                    />

                    <label >Password</label>
                    <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        disabled={isSubmitting}
                    />


                    <label >Confirm password</label>
                    <input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                        disabled={isSubmitting}
                    />
                    <select
                        className="signup-input signup-select"
                        id="signup-role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="user">User Borrower</option>
                        <option value="owner">Owner</option>
                    </select>



                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
                <p><Link to="/">Back to home</Link></p>
            </section>
        </main>
    )
}
