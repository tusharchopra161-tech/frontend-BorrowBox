import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api.js'

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
    const navigate = useNavigate()

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
        setError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setError('')
        try {
            const user = await register(form)
            navigate(user.role === 'owner' ? '/owner' : '/home')
        } catch (signupError) {
            setError(signupError.message)
        }
    }

    return (
        <section>
            <Link to="/">BorrowBox</Link>
            <h1>Create your account</h1>
            <p>Share more, own less.</p>
            <form onSubmit={handleSubmit}>
                <label>
                    Full name
                    <input name="name" type="text" autoComplete="name" value={form.name}
                        onChange={handleChange} required maxLength={100} />
                </label>
                <label>
                    Email address
                    <input name="email" type="email" autoComplete="email" value={form.email}
                        onChange={handleChange} required maxLength={254} />
                </label>
                <label>
                    Contact method
                    <input name="contact" type="text" autoComplete="tel"
                        placeholder="Phone number or preferred contact" value={form.contact} onChange={handleChange} required maxLength={100} />
                </label>
                <label>
                    General location
                    <input name="location" type="text" autoComplete="address-level2"
                        placeholder="City or neighborhood" value={form.location} onChange={handleChange} required maxLength={100} />
                </label>
                <label>
                    I want to
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="browser">Browse and borrow</option>
                        <option value="owner">Share items as an owner</option>
                    </select>
                </label>
                <label>
                    Password
                    <input name="password" type="password" autoComplete="new-password"
                        value={form.password} onChange={handleChange} required minLength={8} />
                </label>
                <label>
                    Confirm password
                    <input name="confirmPassword" type="password" autoComplete="new-password"
                        value={form.confirmPassword} onChange={handleChange} required minLength={8} />
                </label>
                {error && <p role="alert">{error}</p>}
                <button type="submit">Create account</button>
            </form>
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
    )
}
