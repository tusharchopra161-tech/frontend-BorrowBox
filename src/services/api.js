const USERS_KEY = 'borrowbox.users'
const SESSION_KEY = 'borrowbox.session'
const ITEMS_KEY = 'borrowbox.items'

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
    return {
        borrowed: user.borrowedHistory ?? [],
        lending: user.lendingHistory ?? [],
    }
}