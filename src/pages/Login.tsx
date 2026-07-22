import { useState } from 'react'
import { supabase } from '../lib/supabase'

import { Header } from '../components'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (data.session) {
      console.log(data.session.access_token)
    }

    if (error) {
      setMessage(error.message)
    } else if (isSignUp) {
      setMessage('Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 font-sans">
      <Header />

      <br></br>

      <div className="mb-15 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-2xl font-medium text-zinc-900">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="transition-shadows mt-1 w-full cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white duration-200 hover:bg-blue-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

        <p className="mt-5 text-sm text-zinc-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            className="cursor-pointer text-blue-500 hover:underline"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
