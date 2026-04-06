// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useState, useEffect, createContext, useContext } from 'react'
// import { getMe } from './utils/api'
// import Layout from './components/Layout'
// import HomePage from './pages/HomePage'
// import EditorPage from './pages/EditorPage'
// import HistoryPage from './pages/HistoryPage'
// import LoginPage from './pages/LoginPage'

// export const AuthContext = createContext(null)
// export const useAuth = () => useContext(AuthContext)

// // ─── Route Guards ─────────────────────────────────────────────────────────────

// /** Redirect to /login if not logged in (guests count as not logged in) */
// function RequireAuth({ children }) {
//   const { user } = useAuth()
//   if (!user || user.role === 'guest') {
//     return <Navigate to="/login" replace />
//   }
//   return children
// }

// // ─── App ──────────────────────────────────────────────────────────────────────

// export default function App() {
//   const [user, setUser] = useState(undefined) // undefined = loading

//   useEffect(() => {
//     getMe()
//       .then(r => setUser(r.data))
//       .catch(() => {
//         // No valid session — check if guest mode was previously set
//         const savedRole = localStorage.getItem('guestMode')
//         if (savedRole === 'guest') {
//           setUser({ username: 'Guest', role: 'guest', id: null })
//         } else {
//           setUser(null)
//         }
//       })
//   }, [])

//   // Persist guest flag so guest mode survives page refresh
//   useEffect(() => {
//     if (user?.role === 'guest') {
//       localStorage.setItem('guestMode', 'guest')
//     } else {
//       localStorage.removeItem('guestMode')
//     }
//   }, [user])

//   if (user === undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
//         <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <Routes>
//         {/* Public — guests can still visit /login to sign in */}
//         <Route
//           path="/login"
//           element={user && user.role !== 'guest' ? <Navigate to="/" replace /> : <LoginPage />}
//         />

//         <Route element={<Layout />}>
//           {/* 🌐 Public — guests can view (published posts only, enforced by backend) */}
//           <Route path="/" element={<HomePage />} />

//           {/* 🔒 USER + ADMIN only */}
//           <Route path="/editor/:postId" element={<RequireAuth><EditorPage /></RequireAuth>} />
//           <Route path="/history"        element={<RequireAuth><HistoryPage /></RequireAuth>} />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Route>
//       </Routes>
//     </AuthContext.Provider>
//   )
// }

// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useState, useEffect, createContext, useContext } from 'react'
// import { getMe } from './utils/api'
// import Layout from './components/Layout'
// import HomePage from './pages/HomePage'
// import EditorPage from './pages/EditorPage'
// import HistoryPage from './pages/HistoryPage'
// import LoginPage from './pages/LoginPage'

// export const AuthContext = createContext(null)
// export const useAuth = () => useContext(AuthContext)

// // ─── Route Guards ─────────────────────────────────────────────────────────────

// /** Redirect to /login only if completely unauthenticated (guests ARE allowed) */
// function RequireAuth({ children }) {
//   const { user } = useAuth()
//   if (!user) {
//     return <Navigate to="/" replace />
//   }
//   return children
// }

// /** Redirect to / only if fully logged-in user (not guest) */
// function RequireFullAuth({ children }) {
//   const { user } = useAuth()
//   if (!user || user.role === 'guest') {
//     return <Navigate to="/login" replace />
//   }
//   return children
// }

// // ─── App ──────────────────────────────────────────────────────────────────────

// export default function App() {
//   const [user, setUser] = useState(undefined) // undefined = loading

//   useEffect(() => {
//     getMe()
//       .then(r => setUser(r.data))
//       .catch(() => {
//         // No valid session — check if guest mode was previously set
//         const savedRole = localStorage.getItem('guestMode')
//         if (savedRole === 'guest') {
//           setUser({ username: 'Guest', role: 'guest', id: null })
//         } else {
//           // Not logged in, not guest — set null so homepage renders (not login)
//           setUser(null)
//         }
//       })
//   }, [])

//   // Persist guest flag so guest mode survives page refresh
//   useEffect(() => {
//     if (user?.role === 'guest') {
//       localStorage.setItem('guestMode', 'guest')
//     } else if (user !== undefined) {
//       localStorage.removeItem('guestMode')
//     }
//   }, [user])

//   if (user === undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
//         <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <Routes>
//         {/* Public — redirect fully logged-in users away from login */}
//         <Route
//           path="/login"
//           element={user && user.role !== 'guest' ? <Navigate to="/" replace /> : <LoginPage />}
//         />

//         <Route element={<Layout />}>
//           {/* 🌐 Public — anyone (null, guest, user, admin) can see homepage */}
//           <Route path="/" element={<HomePage />} />

//           {/* 🌐 Guest + User + Admin — guests can generate & view their blog */}
//           <Route path="/editor/:postId" element={<RequireAuth><EditorPage /></RequireAuth>} />

//           {/* 🔒 USER + ADMIN only — history requires full account */}
//           <Route path="/history" element={<RequireFullAuth><HistoryPage /></RequireFullAuth>} />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Route>
//       </Routes>
//     </AuthContext.Provider>
//   )
// }

import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { getMe } from './utils/api'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/** Guests + logged-in users allowed; only blocks null (not authenticated at all) */
function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return children
}

/** Blocks guests too — full account required */
function RequireFullAuth({ children }) {
  const { user } = useAuth()
  if (!user || user.role === 'guest') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getMe()
      .then(r => setUser(r.data))
      .catch(() => {
        const savedRole = localStorage.getItem('guestMode')
        if (savedRole === 'guest') {
          setUser({ username: 'Guest', role: 'guest', id: null })
        } else {
          setUser(null)
        }
      })
  }, [])

  useEffect(() => {
    if (user?.role === 'guest') {
      localStorage.setItem('guestMode', 'guest')
    } else if (user !== undefined) {
      localStorage.removeItem('guestMode')
    }
  }, [user])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        {/* Redirect fully logged-in users away from /login */}
        <Route
          path="/login"
          element={user && user.role !== 'guest' ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route element={<Layout />}>
          {/* Everyone sees the homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Guests + logged-in users can access editor */}
          <Route path="/editor/:postId" element={<RequireAuth><EditorPage /></RequireAuth>} />

          {/* Full account required for history */}
          <Route path="/history" element={<RequireFullAuth><HistoryPage /></RequireFullAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  )
}