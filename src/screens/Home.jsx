import { useState } from 'react'
import { listAvailableItems } from '../services/api.js'

function getBrowseData() {
    try {
        return { items: listAvailableItems(), error: '' }
    } catch (loadError) {
        return { items: [], error: loadError.message }
    }
}

export default function Home() {
    const [browseData] = useState(getBrowseData)
    const { items, error } = browseData

    return (
        <div>
            <header>
                <div>
                    <p>BORROW NEARBY</p>
                    <h1>Find something useful.</h1>
                    <p>Borrow from people in your community, or share an item of your own.</p>
                </div>
            </header>
            {error && <p role="alert">{error}</p>}
            {items.length ? (
                <section aria-label="Available items">
                    {items.map((item) => (
                        <article key={item.id}>
                            {item.images?.[0]
                                ? <img src={item.images[0]} alt={item.title} />
                                : <div aria-hidden="true">BorrowBox</div>}
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.category} · {item.condition} · {item.location}</p>
                                <p>{item.description}</p>
                                <p>Shared by {item.ownerName || 'a community member'}</p>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <section>
                    <span aria-hidden="true">⌂</span>
                    <h2>No items listed yet</h2>
                    <p>Check back soon for items shared by local owners.</p>
                </section>
            )}
        </div>
    )
}