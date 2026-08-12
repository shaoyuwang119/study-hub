import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import type { Session } from '@supabase/supabase-js'

import { Header } from '@/components'
import { supabase } from '@/lib/supabase'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    checkSession()
  }, [])

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  function switchMode(signUp: boolean) {
    setIsSignUp(signUp)
    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setMessage('')

    if (isSignUp && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
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
    setSession(data.session)
  }

  return (
    <div className="flex h-screen flex-col items-center bg-zinc-50 p-35 font-sans">
      <Header />

      <br></br>

      <div className="mb-15 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex rounded-lg bg-zinc-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex-1 cursor-pointer rounded-md py-2 transition ${
              !isSignUp
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex-1 cursor-pointer rounded-md py-2 transition ${
              isSignUp
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          )}
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
          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-200 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="transition-shadows mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white duration-200 hover:bg-blue-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}

export default Login
