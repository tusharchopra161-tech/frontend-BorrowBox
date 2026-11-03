const USERS_KEY = 'borrowbox.users'
const SESSION_KEY = 'borrowbox.session'
const ITEMS_KEY = 'borrowbox.items'
const BOOKINGS_KEY = 'borrowbox.bookings'

const demoUser = {
    id: 'demo-owner',
    name: 'Demo Owner',
    email: 'demo@borrowbox.com',
    contact: 'demo@borrowbox.com',
    location: 'Your area',
    role: 'owner',
    borrowedHistory: [],
    lendingHistory: [],
}

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : fallback
    } catch (error) {
        throw new Error(`Could not read saved data: ${error.message}`)
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        throw new Error(`Could not save your changes: ${error.message}`)
    }
}

function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function hashPassword(password, salt) {
    if (!globalThis.crypto?.subtle) {
        throw new Error('Secure password support is unavailable in this browser.')
    }
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
        key,
        256,
    )
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicProfile(user) {
    const profile = { ...user }
    delete profile.passwordHash
    delete profile.passwordSalt
    return profile
}

export function getCurrentUser() {
    return readStorage(SESSION_KEY, null)
}

export async function register({ name, email, password, contact, location, role }) {
    if (role !== 'browser' && role !== 'owner') {
        throw new Error('Please choose Browser or Owner.')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const users = readStorage(USERS_KEY, [])
    if (users.some((user) => user.email === normalizedEmail)) {
        throw new Error('An account with this email already exists.')
    }

    const passwordSalt = createId()
    const user = {
        id: createId(),
        name: name.trim(),
        email: normalizedEmail,
        contact: contact.trim(),
        location: location.trim(),
        role,
        borrowedHistory: [],
        lendingHistory: [],
        passwordSalt,
        passwordHash: await hashPassword(password, passwordSalt),
    }
    users.push(user)
    writeStorage(USERS_KEY, users)
    const profile = publicProfile(user)
    writeStorage(SESSION_KEY, profile)
    return profile
}

export async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail === demoUser.email && password === 'demo1234') {
        writeStorage(SESSION_KEY, demoUser)
        return demoUser
    }

    const user = readStorage(USERS_KEY, []).find((entry) => entry.email === normalizedEmail)
    if (!user || (await hashPassword(password, user.passwordSalt)) !== user.passwordHash) {
        throw new Error('Email or password is incorrect.')
    }
    const profile = publicProfile(user)
    writeStorage(SESSION_KEY, profile)
    return profile
}

export function logout() {
    localStorage.removeItem(SESSION_KEY)
}

export function updateProfile(changes) {
    const session = getCurrentUser()
    if (!session) throw new Error('Please sign in again.')
    const profile = {
        ...session,
        name: changes.name.trim(),
        contact: changes.contact.trim(),
        location: changes.location.trim(),
    }
    writeStorage(SESSION_KEY, profile)

    const users = readStorage(USERS_KEY, [])
    const userIndex = users.findIndex((user) => user.id === session.id)
    if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...profile }
        writeStorage(USERS_KEY, users)
    }
    return profile
}

export function listOwnerItems() {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    return readStorage(ITEMS_KEY, []).filter((item) => item.ownerId === user.id)
}

export function listAvailableItems() {
    return readStorage(ITEMS_KEY, []).filter((item) => item.status === 'active')
}

function dateRangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
    return firstStart <= secondEnd && firstEnd >= secondStart
}

function isBlockingBooking(booking) {
    return booking.status === 'approved' || booking.status === 'handed-over'
}

function validateDates(startDate, endDate) {
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
        throw new Error('Please choose valid start and end dates.')
    }
    const isValidDate = (value) => {
        const [year, month, day] = value.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Please choose valid start and end dates.')
    }
    if (startDate < todayString || endDate < startDate) {
        throw new Error('Choose a start date today or later and an end date on or after it.')
    }
}

export function getItemDateStatus(itemId, startDate, endDate) {
    if (!startDate || !endDate) return { approved: false, pending: false }
    const bookings = readStorage(BOOKINGS_KEY, []).filter((booking) =>
        booking.itemId === itemId
        && dateRangesOverlap(startDate, endDate, booking.startDate, booking.endDate))
    return {
        approved: bookings.some(isBlockingBooking),
        pending: bookings.some((booking) => booking.status === 'requested'),
    }
}

export function createBooking(itemId, { startDate, endDate, message }) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    validateDates(startDate, endDate)
    if (typeof message !== 'string' || !message.trim() || message.trim().length > 300) {
        throw new Error('Add a short message of 1 to 300 characters.')
    }

    const items = readStorage(ITEMS_KEY, [])
    const item = items.find((entry) => entry.id === itemId && entry.status === 'active')
    if (!item) throw new Error('This item is no longer available.')
    if (item.ownerId === user.id) throw new Error('You cannot request your own item.')

    const bookings = readStorage(BOOKINGS_KEY, [])
    const booking = {
        id: createId(),
        itemId: item.id,
        title: item.title,
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        borrowerId: user.id,
        borrowerName: user.name,
        startDate,
        endDate,
        message: message.trim(),
        status: 'requested',
        createdAt: new Date().toISOString(),
    }
    bookings.unshift(booking)
    writeStorage(BOOKINGS_KEY, bookings)
    return booking
}

export function listMyBookings() {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    return readStorage(BOOKINGS_KEY, []).filter((booking) => booking.borrowerId === user.id)
}

export function listIncomingBookings() {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    return readStorage(BOOKINGS_KEY, []).filter((booking) => booking.ownerId === user.id)
}

export function respondToBooking(bookingId, response) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    if (user.role !== 'owner' || !['approved', 'rejected'].includes(response)) {
        throw new Error('Only the item owner can approve or reject a request.')
    }

    const bookings = readStorage(BOOKINGS_KEY, [])
    const bookingIndex = bookings.findIndex((entry) =>
        entry.id === bookingId && entry.ownerId === user.id)
    if (bookingIndex < 0) throw new Error('That booking request could not be found.')
    const booking = bookings[bookingIndex]
    if (booking.status !== 'requested') throw new Error('This request has already been answered.')

    if (response === 'approved') {
        const conflict = bookings.some((other) =>
            other.id !== booking.id
            && other.itemId === booking.itemId
            && isBlockingBooking(other)
            && dateRangesOverlap(booking.startDate, booking.endDate, other.startDate, other.endDate))
        if (conflict) throw new Error('Another approved booking overlaps these dates.')
    }

    bookings[bookingIndex] = {
        ...booking,
        status: response,
        decidedBy: { id: user.id, name: user.name, at: new Date().toISOString() },
    }
    writeStorage(BOOKINGS_KEY, bookings)
    return bookings[bookingIndex]
}

export function confirmBookingStep(bookingId, step) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    if (step !== 'handover' && step !== 'return') throw new Error('That booking step is not valid.')

    const bookings = readStorage(BOOKINGS_KEY, [])
    const bookingIndex = bookings.findIndex((entry) =>
        entry.id === bookingId && [entry.ownerId, entry.borrowerId].includes(user.id))
    if (bookingIndex < 0) throw new Error('That booking could not be found.')

    const booking = bookings[bookingIndex]
    const requiredStatus = step === 'handover' ? 'approved' : 'handed-over'
    if (booking.status !== requiredStatus) {
        throw new Error(`This booking cannot be marked ${step === 'handover' ? 'handed over' : 'returned'} now.`)
    }

    const status = step === 'handover' ? 'handed-over' : 'returned'
    const confirmation = { id: user.id, name: user.name, at: new Date().toISOString() }
    bookings[bookingIndex] = {
        ...booking,
        status,
        [step === 'handover' ? 'handoverConfirmedBy' : 'returnConfirmedBy']: confirmation,
    }
    writeStorage(BOOKINGS_KEY, bookings)
    return bookings[bookingIndex]
}

export function rateBooking(bookingId, rating, feedback) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    const numericRating = Number(rating)
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new Error('Choose a rating from 1 to 5.')
    }

    const bookings = readStorage(BOOKINGS_KEY, [])
    const bookingIndex = bookings.findIndex((entry) =>
        entry.id === bookingId && entry.borrowerId === user.id)
    if (bookingIndex < 0) throw new Error('That booking could not be found.')
    const booking = bookings[bookingIndex]
    if (booking.status !== 'returned') throw new Error('You can rate a booking after it is returned.')
    if (booking.rating) throw new Error('You have already rated this booking.')
    if (typeof feedback !== 'string') throw new Error('Feedback must be text.')
    if (feedback.trim().length > 500) throw new Error('Feedback must be 500 characters or fewer.')

    bookings[bookingIndex] = {
        ...booking,
        rating: numericRating,
        feedback: feedback.trim(),
        ratedAt: new Date().toISOString(),
    }
    writeStorage(BOOKINGS_KEY, bookings)
    return bookings[bookingIndex]
}

export function createItem(fields) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    const items = readStorage(ITEMS_KEY, [])
    const item = {
        ...fields,
        id: createId(),
        ownerId: user.id,
        ownerName: user.name,
        status: 'active',
        createdAt: new Date().toISOString(),
    }
    items.unshift(item)
    writeStorage(ITEMS_KEY, items)
    return item
}

export function updateItem(itemId, changes) {
    return changeItem(itemId, (item) => ({ ...item, ...changes }))
}

export function toggleItemStatus(itemId) {
    return changeItem(itemId, (item) => ({ ...item, status: item.status === 'active' ? 'paused' : 'active' }))
}

export function removeItem(itemId) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    const items = readStorage(ITEMS_KEY, [])
    const nextItems = items.filter((item) => item.id !== itemId || item.ownerId !== user.id)
    if (nextItems.length === items.length) throw new Error('That listing could not be found.')
    writeStorage(ITEMS_KEY, nextItems)
}

function changeItem(itemId, update) {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    const items = readStorage(ITEMS_KEY, [])
    const itemIndex = items.findIndex((entry) => entry.id === itemId && entry.ownerId === user.id)
    if (itemIndex < 0) throw new Error('That listing could not be found.')
    items[itemIndex] = update(items[itemIndex])
    writeStorage(ITEMS_KEY, items)
    return items[itemIndex]
}

export function getHistory() {
    const user = getCurrentUser()
    if (!user) throw new Error('Please sign in again.')
    const bookings = readStorage(BOOKINGS_KEY, [])
    return {
        borrowed: [
            ...bookings.filter((booking) => booking.borrowerId === user.id),
            ...(user.borrowedHistory ?? []),
        ],
        lending: [
            ...bookings.filter((booking) => booking.ownerId === user.id),
            ...(user.lendingHistory ?? []),
        ],
    }
}