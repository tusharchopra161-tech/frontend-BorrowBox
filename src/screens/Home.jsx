import { useState } from 'react'
import { createBooking, getCurrentUser, getItemDateStatus, listAvailableItems } from '../services/api.js'
import './Home.css'

function getBrowseData() {
    try {
        return { items: listAvailableItems(), error: '' }
    } catch (loadError) {
        return { items: [], error: loadError.message }
    }
}

function getToday() {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export default function Home() {
    const [browseData, setBrowseData] = useState(getBrowseData)
    const [keyword, setKeyword] = useState('')
    const [category, setCategory] = useState('')
    const [location, setLocation] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [availability, setAvailability] = useState('any')
    const [requests, setRequests] = useState({})
    const [error, setError] = useState(browseData.error)
    const [notice, setNotice] = useState('')
    const user = getCurrentUser()

    const categories = [...new Set(browseData.items.map((item) => item.category).filter(Boolean))]
    const hasDateRange = Boolean(startDate && endDate)
    const matchingItems = browseData.items.filter((item) => {
        const searchText = `${item.title} ${item.description} ${item.category} ${item.location} ${item.ownerName}`
        const dateStatus = hasDateRange ? getItemDateStatus(item.id, startDate, endDate) : null
        const matchesAvailability = availability === 'any'
            || !hasDateRange
            || (availability === 'available' && !dateStatus.approved)
            || (availability === 'pending' && dateStatus.pending)
            || (availability === 'approved' && dateStatus.approved)
        return searchText.toLowerCase().includes(keyword.trim().toLowerCase())
            && (!category || item.category === category)
            && (item.location || '').toLowerCase().includes(location.trim().toLowerCase())
            && matchesAvailability
    })

    const changeRequest = (itemId, name, value) => {
        setRequests((current) => ({
            ...current,
            [itemId]: { ...current[itemId], [name]: value },
        }))
    }

    const submitRequest = (event, item) => {
        event.preventDefault()
        try {
            const request = requests[item.id] ?? {}
            createBooking(item.id, request)
            setNotice(`Your request for ${item.title} was sent.`)
            setError('')
            setRequests((current) => ({ ...current, [item.id]: {} }))
            setBrowseData(getBrowseData())
        } catch (requestError) {
            setError(requestError.message)
            setNotice('')
        }
    }

    return (
        <main>
            <header>
                <h1>Find something useful</h1>
                <p>Search local items and send the owner a borrowing request.</p>
            </header>

            <section>
                <h2>Search and filter</h2>
                <label>
                    Keyword
                    <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                </label>
                <label>
                    Category
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option value="">All categories</option>
                        {categories.map((itemCategory) => (
                            <option key={itemCategory} value={itemCategory}>{itemCategory}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Location
                    <input value={location} onChange={(event) => setLocation(event.target.value)} />
                </label>
                <label>
                    Start date
                    <input type="date" min={getToday()} value={startDate}
                        onChange={(event) => setStartDate(event.target.value)} />
                </label>
                <label>
                    End date
                    <input type="date" min={startDate || getToday()} value={endDate}
                        onChange={(event) => setEndDate(event.target.value)} />
                </label>
                <label>
                    Availability
                    <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                        <option value="any">Any availability</option>
                        <option value="available">Available on these dates</option>
                        <option value="pending">Pending request on these dates</option>
                        <option value="approved">Approved booking on these dates</option>
                    </select>
                </label>
                {!hasDateRange && availability !== 'any' && <p>Choose both dates to filter by availability.</p>}
            </section>

            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}

            <section aria-label="Available items">
                <h2>Items ({matchingItems.length})</h2>
                {matchingItems.length ? matchingItems.map((item) => {
                    const dateStatus = hasDateRange ? getItemDateStatus(item.id, startDate, endDate) : null
                    return (
                        <article key={item.id}>
                            {item.images?.[0] && <img src={item.images[0]} alt={item.title} />}
                            <h3>{item.title}</h3>
                            <p>Category: {item.category}</p>
                            <p>Condition: {item.condition}</p>
                            <p>Location: {item.location}</p>
                            <p>Owner: {item.ownerName || 'Community member'}</p>
                            <p>{item.description}</p>
                            {hasDateRange && (
                                <p>
                                    {dateStatus.approved
                                        ? 'Approved booking overlaps these dates.'
                                        : dateStatus.pending
                                            ? 'Available, but a request is pending for these dates.'
                                            : 'Available for these dates.'}
                                </p>
                            )}
                            {item.ownerId !== user?.id && (
                                <details>
                                    <summary>Request this item</summary>
                                    <form onSubmit={(event) => submitRequest(event, item)}>
                                        <label>
                                            Start date
                                            <input type="date" min={getToday()}
                                                value={requests[item.id]?.startDate ?? ''}
                                                onChange={(event) => changeRequest(item.id, 'startDate', event.target.value)}
                                                required />
                                        </label>
                                        <label>
                                            End date
                                            <input type="date" min={requests[item.id]?.startDate || getToday()}
                                                value={requests[item.id]?.endDate ?? ''}
                                                onChange={(event) => changeRequest(item.id, 'endDate', event.target.value)}
                                                required />
                                        </label>
                                        <label>
                                            Short message or reason
                                            <textarea value={requests[item.id]?.message ?? ''}
                                                onChange={(event) => changeRequest(item.id, 'message', event.target.value)}
                                                maxLength={300} required />
                                        </label>
                                        <button type="submit">Send request</button>
                                    </form>
                                </details>
                            )}
                        </article>
                    )
                }) : <p>No items match your search.</p>}
            </section>
        </main>
    )
}
