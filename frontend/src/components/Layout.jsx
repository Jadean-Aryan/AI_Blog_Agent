import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Zap, History, Plus, Sun, Moon, LogOut, Shield, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { logout } from '../utils/api'
import { useAuth } from '../App'
import toast from 'react-hot-toast'

export default function Layout() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try { await logout() } catch {}
    setUser(null)
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-14 lg:w-52 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 px-2 sticky top-0 h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight">BlogForge</span>
        </div>

        {/* New Post */}
        <button onClick={() => navigate('/')} className="btn-primary mb-3 justify-center lg:justify-start text-sm py-2">
          <Plus size={15} />
          <span className="hidden lg:inline">New Post</span>
        </button>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <NavLink to="/history" className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
             ${isActive ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
            <History size={16} />
            <span className="hidden lg:inline">History</span>
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-1">
          {/* User info */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-1">
              <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                {user.role === 'admin'
                  ? <Shield size={12} className="text-violet-600 dark:text-violet-400" />
                  : <User size={12} className="text-violet-600 dark:text-violet-400" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}

          <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden lg:inline">{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {user && (
            <button onClick={handleLogout} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full">
              <LogOut size={16} />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
