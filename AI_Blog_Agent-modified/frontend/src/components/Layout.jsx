// import { Outlet, NavLink, useNavigate } from 'react-router-dom'
// import { Zap, History, Plus, Sun, Moon, LogOut, Shield, User, Eye, Users } from 'lucide-react'
// import { useState } from 'react'
// import { logout } from '../utils/api'
// import { useAuth } from '../App'
// import toast from 'react-hot-toast'

// export default function Layout() {
//   const navigate = useNavigate()
//   const { user, setUser } = useAuth()
//   const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

//   // Role helpers
//   const isGuest = !user || user.role === 'guest'
//   const isAdmin = user?.role === 'admin'

//   const toggleTheme = () => {
//     const next = !dark
//     setDark(next)
//     document.documentElement.classList.toggle('dark', next)
//     localStorage.setItem('theme', next ? 'dark' : 'light')
//   }

//   const handleLogout = async () => {
//     try { await logout() } catch {}
//     localStorage.removeItem('session')
//     localStorage.removeItem('guestMode')
//     setUser(null)
//     navigate('/login')
//     toast.success('Logged out')
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

//       {/* ── Sidebar ────────────────────────────────────────────────────────── */}
//       <aside className="w-14 lg:w-52 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 px-2 sticky top-0 h-screen">

//         {/* Logo */}
//         <div className="flex items-center gap-2 px-2 mb-6">
//           <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
//             <Zap size={15} className="text-white" fill="white" />
//           </div>
//           <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight">BlogForge</span>
//         </div>

//         {/* 🔒 New Post — hidden for guests */}
//         {!isGuest && (
//           <button onClick={() => navigate('/')} className="btn-primary mb-3 justify-center lg:justify-start text-sm py-2">
//             <Plus size={15} />
//             <span className="hidden lg:inline">New Post</span>
//           </button>
//         )}

//         {/* 🌐 Guest — show Sign In prompt instead */}
//         {isGuest && (
//           <button
//             onClick={() => navigate('/login')}
//             className="btn-ghost mb-3 justify-center lg:justify-start text-sm py-2 border border-dashed border-gray-300 dark:border-gray-700"
//           >
//             <LogOut size={15} />
//             <span className="hidden lg:inline">Sign In</span>
//           </button>
//         )}

//         {/* Nav */}
//         <nav className="flex flex-col gap-1">
//           {/* 🔒 History — hidden for guests */}
//           {!isGuest && (
//             <NavLink to="/history" className={({ isActive }) =>
//               `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
//                ${isActive ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
//                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
//               <History size={16} />
//               <span className="hidden lg:inline">History</span>
//             </NavLink>
//           )}

//           {/* 🛡️ Admin Panel — only for admins */}
//           {isAdmin && (
//             <NavLink to="/admin" className={({ isActive }) =>
//               `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
//                ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
//                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
//               <Users size={16} />
//               <span className="hidden lg:inline">Admin Panel</span>
//             </NavLink>
//           )}
//         </nav>

//         {/* ── Bottom ───────────────────────────────────────────────────────── */}
//         <div className="mt-auto flex flex-col gap-1">

//           {/* User info card */}
//           {user && (
//             <div className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-1">
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
//                 ${isAdmin ? 'bg-amber-100 dark:bg-amber-900/30'
//                 : isGuest ? 'bg-gray-100 dark:bg-gray-700'
//                 : 'bg-violet-100 dark:bg-violet-900/30'}`}>
//                 {isAdmin
//                   ? <Shield size={12} className="text-amber-600 dark:text-amber-400" />
//                   : isGuest
//                     ? <Eye size={12} className="text-gray-500" />
//                     : <User size={12} className="text-violet-600 dark:text-violet-400" />}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user.username}</p>
//                 <p className={`text-xs capitalize
//                   ${isAdmin ? 'text-amber-500' : isGuest ? 'text-gray-400' : 'text-violet-400'}`}>
//                   {user.role}
//                 </p>
//               </div>
//             </div>
//           )}

//           <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
//             {dark ? <Sun size={16} /> : <Moon size={16} />}
//             <span className="hidden lg:inline">{dark ? 'Light Mode' : 'Dark Mode'}</span>
//           </button>

//           {/* Sign Out — only for real logged-in users */}
//           {!isGuest && user && (
//             <button onClick={handleLogout} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full">
//               <LogOut size={16} />
//               <span className="hidden lg:inline">Sign Out</span>
//             </button>
//           )}
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────────────────────── */}
//       <main className="flex-1 min-w-0 overflow-auto">

//         {/* 🌐 Guest banner */}
//         {isGuest && (
//           <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between gap-3">
//             <div className="flex items-center gap-2">
//               <Eye size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
//               <p className="text-xs text-amber-700 dark:text-amber-300">
//                 Browsing as <strong>Guest</strong> — view-only, published posts only.
//                 Sign in to create and save blogs.
//               </p>
//             </div>
//             <button onClick={() => navigate('/login')}
//               className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline flex-shrink-0">
//               Sign In →
//             </button>
//           </div>
//         )}

//         <Outlet />
//       </main>
//     </div>
//   )
// }


import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Zap, History, Plus, Sun, Moon, LogOut, Shield, User, Eye, Users } from 'lucide-react'
import { useState } from 'react'
import { logout } from '../utils/api'
import { useAuth } from '../App'
import toast from 'react-hot-toast'

export default function Layout() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  // Role helpers — null means not logged in at all, guest means explicitly chose guest
  const isGuest = user?.role === 'guest'
  const isLoggedIn = user && user.role !== 'guest'
  const isAdmin = user?.role === 'admin'

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try { await logout() } catch {}
    localStorage.removeItem('session')
    localStorage.removeItem('guestMode')
    setUser(null)
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sidebar ── */}
      <aside className="w-14 lg:w-52 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 px-2 sticky top-0 h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight">BlogForge</span>
        </div>

        {/* New Post — logged-in users only */}
        {isLoggedIn && (
          <button onClick={() => navigate('/')} className="btn-primary mb-3 justify-center lg:justify-start text-sm py-2">
            <Plus size={15} />
            <span className="hidden lg:inline">New Post</span>
          </button>
        )}

        {/* Sign In — shown for null users and guests */}
        {!isLoggedIn && (
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost mb-3 justify-center lg:justify-start text-sm py-2 border border-dashed border-gray-300 dark:border-gray-700"
          >
            <LogOut size={15} />
            <span className="hidden lg:inline">Sign In</span>
          </button>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {/* History — logged-in users only */}
          {isLoggedIn && (
            <NavLink to="/history" className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
               ${isActive ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <History size={16} />
              <span className="hidden lg:inline">History</span>
            </NavLink>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
               ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <Users size={16} />
              <span className="hidden lg:inline">Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* ── Bottom ── */}
        <div className="mt-auto flex flex-col gap-1">

          {/* User info card — only when logged in */}
          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${isAdmin ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                {isAdmin
                  ? <Shield size={12} className="text-amber-600 dark:text-amber-400" />
                  : <User size={12} className="text-violet-600 dark:text-violet-400" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user.username}</p>
                <p className={`text-xs capitalize ${isAdmin ? 'text-amber-500' : 'text-violet-400'}`}>
                  {user.role}
                </p>
              </div>
            </div>
          )}

          {/* Guest user info card */}
          {isGuest && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                <Eye size={12} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">Guest</p>
                <p className="text-xs text-gray-400">guest</p>
              </div>
            </div>
          )}

          <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden lg:inline">{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Sign Out — logged-in users only */}
          {isLoggedIn && (
            <button onClick={handleLogout} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full">
              <LogOut size={16} />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-auto">

        {/* Guest banner — only for explicit guests, not null users */}
        {isGuest && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Browsing as <strong>Guest</strong> — SEO scoring and history disabled.
                Sign in for full access.
              </p>
            </div>
            <button onClick={() => navigate('/login')}
              className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline flex-shrink-0">
              Sign In →
            </button>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  )
}