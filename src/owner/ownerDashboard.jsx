import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    createItem,
    getCurrentUser,
    getHistory,
    listOwnerItems,
    removeItem,
    toggleItemStatus,
    updateItem,
} from '../services/api.js'

const blankItem = (location = '') => ({
    title: '',
    category: '',
    description: '',
    images: '',
    condition: 'Good',
    location,
    rules: '',
})

function getDashboardData() {
    try {
        return { profile: getCurrentUser(), items: listOwnerItems(), history: getHistory(), error: '' }
    } catch (loadError) {
        return { profile: getCurrentUser(), items: [], history: { borrowed: [], lending: [] }, error: loadError.message }
    }
}

export default function OwnerDashboard() {
    const [dashboard, setDashboard] = useState(getDashboardData)
    const { profile, items, history } = dashboard
    const [form, setForm] = useState(blankItem(profile?.location))
    const [editingId, setEditingId] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState(dashboard.error)
    const [notice, setNotice] = useState('')

    const refresh = () => {
        setDashboard(getDashboardData())
    }

    const openNewForm = () => {
        setEditingId(null)
        setForm(blankItem(profile?.location))
        setShowForm(true)
        setError('')
    }

    const openEditForm = (item) => {
        setEditingId(item.id)
        setForm({ ...item, images: (item.images ?? []).join('\n') })
        setShowForm(true)
        setError('')
    }

    const handleItemChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleItemSubmit = (event) => {
        event.preventDefault()
        const imageUrls = form.images.split('\n').map((url) => url.trim()).filter(Boolean)
        const hasInvalidImageUrl = imageUrls.some((url) => {
            try {
                const parsed = new URL(url)
                return parsed.protocol !== 'http:' && parsed.protocol !== 'https:'
            } catch {
                return true
            }
        })
        if (hasInvalidImageUrl) {
            setError('Please use valid http or https image URLs.')
            return
        }
        const fields = {
            title: form.title.trim(),
            category: form.category.trim(),
            description: form.description.trim(),
            images: imageUrls,
            condition: form.condition,
            location: form.location.trim(),
            rules: form.rules.trim(),
        }
        try {
            if (editingId) {
                updateItem(editingId, fields)
                setNotice('Listing updated.')
            } else {
                createItem(fields)
                setNotice('Listing created.')
            }
            refresh()
            setError('')
            setShowForm(false)
            setEditingId(null)
        } catch (saveError) {
            setError(saveError.message)
        }
    }

    const handleToggle = (itemId) => {
        try {
            toggleItemStatus(itemId)
            refresh()
            setNotice('Listing status updated.')
            setError('')
        } catch (actionError) {
            setError(actionError.message)
        }
    }

    const handleRemove = (itemId) => {
        if (!window.confirm('Remove this listing? This cannot be undone.')) return
        try {
            removeItem(itemId)
            refresh()
            setNotice('Listing removed.')
            setError('')
        } catch (actionError) {
            setError(actionError.message)
        }
    }

    const activeCount = items.filter((item) => item.status === 'active').length

    return (
        <div>
            <header>
                <div>
                    <p>OWNER DASHBOARD</p>
                    <h1>Hello, {profile?.name?.split(' ')[0] ?? 'there'}</h1>
                    <p>Keep your listings and profile up to date.</p>
                </div>
                <button onClick={openNewForm}>+ Add a listing</button>
            </header>

            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}

            <section aria-label="Listing summary">
                <article><span>All listings</span><strong>{items.length}</strong></article>
                <article><span>Available</span><strong>{activeCount}</strong></article>
                <article><span>Paused</span><strong>{items.length - activeCount}</strong></article>
            </section>

            {showForm && (
                <section aria-labelledby="listing-form-title">
                    <div>
                        <div>
                            <p>{editingId ? 'UPDATE ITEM' : 'NEW ITEM'}</p>
                            <h2 id="listing-form-title">{editingId ? 'Edit listing' : 'Create a listing'}</h2>
                        </div>
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                    <form onSubmit={handleItemSubmit}>
                        <div>
                            <label htmlFor="item-title">Title</label>
                            <input id="item-title" name="title" value={form.title} onChange={handleItemChange} required maxLength={100} />
                        </div>
                        <div>
                            <label htmlFor="item-category">Category</label>
                            <input id="item-category" name="category" placeholder="Tools, kitchen, outdoors..." value={form.category} onChange={handleItemChange} required maxLength={60} />
                        </div>
                        <div>
                            <label htmlFor="item-description">Description</label>
                            <textarea id="item-description" name="description" rows="3" value={form.description} onChange={handleItemChange} required maxLength={1000} />
                        </div>
                        <div>
                            <label htmlFor="item-condition">Condition</label>
                            <select id="item-condition" name="condition" value={form.condition} onChange={handleItemChange}>
                                <option>Excellent</option><option>Good</option><option>Fair</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="item-location">General location</label>
                            <input id="item-location" name="location" value={form.location} onChange={handleItemChange} required maxLength={100} />
                        </div>
                        <div>
                            <label htmlFor="item-images">Image URLs <span>(optional, one per line)</span></label>
                            <textarea id="item-images" name="images" rows="2" placeholder="https://example.com/item.jpg" value={form.images} onChange={handleItemChange} />
                        </div>
                        <div>
                            <label htmlFor="item-rules">Lending rules <span>(optional)</span></label>
                            <textarea id="item-rules" name="rules" rows="2" placeholder="Pickup times, deposit, or care instructions" value={form.rules} onChange={handleItemChange} maxLength={500} />
                        </div>
                        <div>
                            <button type="submit">{editingId ? 'Save changes' : 'Publish listing'}</button>
                            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </section>
            )}

            <section>
                <div>
                    <div>
                        <p>YOUR ITEMS</p>
                        <h2>My listings</h2>
                    </div>
                    <button onClick={openNewForm}>+ Add item</button>
                </div>
                {items.length === 0 ? (
                    <div>
                        <span aria-hidden="true">⌂</span>
                        <h3>Your first listing starts here</h3>
                        <p>List something useful and let your neighbors borrow it.</p>
                        <button onClick={openNewForm}>Create a listing</button>
                    </div>
                ) : (
                    <div>
                        {items.map((item) => (
                            <article key={item.id}>
                                {item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.title} />
                                ) : <div aria-hidden="true">BorrowBox</div>}
                                <div>
                                    <div>
                                        <h3>{item.title}</h3>
                                        <span>{item.status}</span>
                                    </div>
                                    <p>{item.category} · {item.condition} · {item.location}</p>
                                    <p>{item.description}</p>
                                    {item.rules && <p><strong>Rules:</strong> {item.rules}</p>}
                                    <div>
                                        <button onClick={() => openEditForm(item)}>Edit</button>
                                        <button onClick={() => handleToggle(item.id)}>
                                            {item.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                        <button onClick={() => handleRemove(item.id)}>Remove</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div>
                <section>
                    <p>YOUR ACCOUNT</p>
                    <h2>Profile</h2>
                    <p>{profile?.name}</p>
                    <p>{profile?.email}</p>
                    <Link to="/profile">Edit your profile</Link>
                </section>
                <section>
                    <p>ACTIVITY</p>
                    <h2>Borrowing & lending history</h2>
                    <div>
                        <h3>Lending</h3>
                        {history.lending.length ? history.lending.map((entry, index) => (
                            <p key={entry.id ?? index}>{entry.title} <span>{entry.date ?? entry.status}</span></p>
                        )) : <p>No lending history yet.</p>}
                    </div>
                    <div>
                        <h3>Borrowing</h3>
                        {history.borrowed.length ? history.borrowed.map((entry, index) => (
                            <p key={entry.id ?? index}>{entry.title} <span>{entry.date ?? entry.status}</span></p>
                        )) : <p>No borrowing history yet.</p>}
                    </div>
                </section>
            </div>
        </div>
    )
}