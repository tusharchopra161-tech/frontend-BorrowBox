import { useState } from 'react'
import { confirmBookingStep, listMyBookings, rateBooking } from '../services/api.js'
import './Booking.css'

function getBookings() {
    try {
        return { bookings: listMyBookings(), error: '' }
    } catch (loadError) {
        return { bookings: [], error: loadError.message }
    }
}

function formatStatus(status) {
    if (status === 'requested') return 'Requested (pending owner response)'
    if (status === 'handed-over') return 'Handed over'
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function Booking() {
    const [data, setData] = useState(getBookings)
    const [ratings, setRatings] = useState({})
    const [error, setError] = useState(data.error)
    const [notice, setNotice] = useState('')

    const refresh = () => setData(getBookings())

    const confirmStep = (bookingId, step) => {
        try {
            confirmBookingStep(bookingId, step)
            refresh()
            setError('')
            setNotice(step === 'handover' ? 'Handover confirmed.' : 'Return confirmed.')
        } catch (actionError) {
            setError(actionError.message)
            setNotice('')
        }
    }

    const submitRating = (event, bookingId) => {
        event.preventDefault()
        try {
            const rating = ratings[bookingId] ?? { stars: '5', feedback: '' }
            rateBooking(bookingId, rating.stars, rating.feedback)
            refresh()
            setError('')
            setNotice('Thank you for sharing your feedback.')
        } catch (ratingError) {
            setError(ratingError.message)
            setNotice('')
        }
    }

    const changeRating = (bookingId, name, value) => {
        setRatings((current) => ({
            ...current,
            [bookingId]: { ...current[bookingId], [name]: value },
        }))
    }

    return (
        <main>
            <h1>My bookings</h1>
            <p>See your current requests and completed borrowing history.</p>
            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}

            {data.bookings.length ? data.bookings.map((booking) => (
                <article key={booking.id}>
                    <h2>{booking.title}</h2>
                    <p>Owner: {booking.ownerName}</p>
                    <p>Dates: {booking.startDate} to {booking.endDate}</p>
                    <p>Status: {formatStatus(booking.status)}</p>
                    <p>Your message: {booking.message}</p>
                    {booking.decidedBy && <p>Decision recorded by {booking.decidedBy.name}</p>}
                    {booking.handoverConfirmedBy && (
                        <p>Handover confirmed by {booking.handoverConfirmedBy.name}</p>
                    )}
                    {booking.returnConfirmedBy && (
                        <p>Return confirmed by {booking.returnConfirmedBy.name}</p>
                    )}

                    {booking.status === 'approved' && (
                        <button type="button" onClick={() => confirmStep(booking.id, 'handover')}>
                            Confirm handover
                        </button>
                    )}
                    {booking.status === 'handed-over' && (
                        <button type="button" onClick={() => confirmStep(booking.id, 'return')}>
                            Confirm return
                        </button>
                    )}
                    {booking.status === 'returned' && !booking.rating && (
                        <form onSubmit={(event) => submitRating(event, booking.id)}>
                            <h3>Rate your borrowing experience</h3>
                            <label>
                                Rating
                                <select value={ratings[booking.id]?.stars ?? '5'}
                                    onChange={(event) => changeRating(booking.id, 'stars', event.target.value)}>
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Good</option>
                                    <option value="3">3 - Okay</option>
                                    <option value="2">2 - Poor</option>
                                    <option value="1">1 - Bad</option>
                                </select>
                            </label>
                            <label>
                                Feedback (optional)
                                <textarea value={ratings[booking.id]?.feedback ?? ''}
                                    onChange={(event) => changeRating(booking.id, 'feedback', event.target.value)}
                                    maxLength={500} />
                            </label>
                            <button type="submit">Save rating</button>
                        </form>
                    )}
                    {booking.rating && (
                        <p>Your rating: {booking.rating} out of 5{booking.feedback ? ` — ${booking.feedback}` : ''}</p>
                    )}
                </article>
            )) : <p>You have no bookings yet.</p>}
        </main>
    )
}
