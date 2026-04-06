import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { createGuestSession, login, register } from '../utils/api'
import { useAuth } from '../App'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ username: form.username, password: form.password })
        toast.success('Account created! Please log in.')
        setMode('login')
      } else {
        const res = await login({ username: form.username, password: form.password })
        localStorage.setItem('session', res.data.token)
        setUser(res.data)
        navigate('/')
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      const guestUser = await createGuestSession()
      const token = guestUser.token || guestUser.access_token

      if (token) {
        localStorage.setItem('session', token)
      }

      localStorage.setItem('guestMode', 'guest')
      setUser({ ...guestUser, role: 'guest', username: 'Guest' })
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to start guest session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">BlogForge</span>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {mode === 'login' ? 'Sign in to your account' : 'Get started with BlogForge'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Username</label>
              <input
                className="input"
                placeholder="Enter username"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1">
              {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleGuest}
              disabled={loading}
              className="btn-ghost w-full justify-center text-xs py-2 gap-1.5"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Continue as Guest
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-1.5">
              Generate blogs without signup. SEO, history, and saving stay limited in guest mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
