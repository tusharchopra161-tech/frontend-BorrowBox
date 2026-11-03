import { useState } from 'react'
import { getCurrentUser, updateProfile } from '../services/api.js'

export default function Profile() {
    const user = getCurrentUser()
    const [form, setForm] = useState({
        name: user.name,
        contact: user.contact,
        location: user.location,
    })
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        try {
            updateProfile(form)
            setNotice('Profile saved.')
            setError('')
        } catch (saveError) {
            setError(saveError.message)
        }
    }

    return (
        <section>
            <h1>Profile</h1>
            <p>{user.email}</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="profile-name">Name</label>
                <input id="profile-name" name="name" value={form.name} onChange={handleChange} required maxLength={100} />
                <label htmlFor="profile-contact">Contact method</label>
                <input id="profile-contact" name="contact" value={form.contact} onChange={handleChange} required maxLength={100} />
                <label htmlFor="profile-location">General location</label>
                <input id="profile-location" name="location" value={form.location} onChange={handleChange} required maxLength={100} />
                {error && <p role="alert">{error}</p>}
                {notice && <p role="status">{notice}</p>}
                <button type="submit">Save profile</button>
            </form>
        </section>
    )
}
