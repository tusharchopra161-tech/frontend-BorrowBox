import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const user = localStorage.getItem('user.login')

    if (user === "false") return <Navigate to="/login" replace />
    return children
}
