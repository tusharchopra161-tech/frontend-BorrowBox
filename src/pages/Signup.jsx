import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api.js'
import './signup.css'

const initialForm = {
    name: '',
    email: '',
    contact: '',
    location: '',
    role: 'browser',
    password: '',
    confirmPassword: '',
}

export default function Signup() {
    const [form, setForm] = useState(initialForm)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
        setError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (isSubmitting) return
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setError('')
        setIsSubmitting(true)
        try {
            const user = await register(form)
            navigate(user.role === 'owner' ? '/owner' : '/home')
        } catch (signupError) {
            setError(signupError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main>
            <section>
                <Link to="/">BorrowBox</Link>
                <h1>Create your account</h1>
                <p>Share more, own less.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="signup-name">Full name</label>
                    <input id="signup-name" name="name" type="text" autoComplete="name"
                        value={form.name} onChange={handleChange} required maxLength={100}
                        disabled={isSubmitting} />
                    <label htmlFor="signup-email">Email address</label>
                    <input id="signup-email" name="email" type="email" autoComplete="email"
                        value={form.email} onChange={handleChange} required maxLength={254}
                        disabled={isSubmitting} />
                    <label htmlFor="signup-contact">Contact method</label>
                    <input id="signup-contact" name="contact" type="text" autoComplete="tel"
                        placeholder="Phone number or preferred contact" value={form.contact}
                        onChange={handleChange} required maxLength={100} disabled={isSubmitting} />
                    <label htmlFor="signup-location">General location</label>
                    <input id="signup-location" name="location" type="text" autoComplete="address-level2"
                        placeholder="City or neighborhood" value={form.location}
                        onChange={handleChange} required maxLength={100} disabled={isSubmitting} />
                    <label htmlFor="signup-role">I want to</label>
                    <select id="signup-role" name="role" value={form.role} onChange={handleChange}
                        disabled={isSubmitting}>
                        <option value="browser">Browse and borrow</option>
                        <option value="owner">Share items as an owner</option>
                    </select>
                    <label htmlFor="signup-password">Password</label>
                    <input id="signup-password" name="password" type="password"
                        autoComplete="new-password" value={form.password} onChange={handleChange}
                        required minLength={8} disabled={isSubmitting} />
                    <label htmlFor="signup-confirm-password">Confirm password</label>
                    <input id="signup-confirm-password" name="confirmPassword" type="password"
                        autoComplete="new-password" value={form.confirmPassword}
                        onChange={handleChange} required minLength={8} disabled={isSubmitting} />
                    {error && <p role="alert">{error}</p>}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
                <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </section>
        </main>
    )
}
