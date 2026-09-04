import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import type { Session } from '@supabase/supabase-js'

import { Header, LoginDoodles } from '@/components'
import { supabase } from '@/lib/supabase'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { usePageTitle } from '@/lib/usePageTitle'

type FloatingInputProps = {
  id: string
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  minLength?: number
}

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  minLength,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className="peer focus:border-sea-teal block w-full rounded-lg border border-slate-300 bg-white px-3 pt-4 pb-1.5 text-sm text-slate-900 focus:outline-none"
      />
      <label
        htmlFor={id}
        className="peer-focus:text-sea-teal absolute inset-s-3 top-2 z-10 origin-left -translate-y-4 scale-75 bg-white px-1 text-sm text-slate-500 duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2! peer-focus:-translate-y-4! peer-focus:scale-75!"
      >
        {label}
      </label>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  usePageTitle(isSignUp ? 'Sign Up | StudyNote' : 'Log In | StudyNote')

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
    setError(false)
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError(false)
    setMessage('')

    if (isSignUp && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setError(true)
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

    // if (data.session) {
    //   console.log(data.session.access_token)
    // }

    if (error) {
      setMessage(error.message)
      setError(true)
    } else if (isSignUp) {
      if (data.user?.identities?.length === 0) {
        setMessage('An account with this email already exists.')
        setError(true)
      } else {
        setError(false)
        setMessage('Check your email to confirm your account.')
      }
    }

    setLoading(false)
    setSession(data.session)
  }

  return (
    <div className="login-backdrop relative flex h-screen flex-col items-center overflow-hidden bg-slate-50 p-6 font-sans">
      <LoginDoodles />

      <h1 className="text-sea-navy relative mt-26 font-serif text-4xl font-bold">
        StudyNote
      </h1>

      <p className="relative mt-4 text-slate-700">
        Organized and accessible notes for your studies.
      </p>

      <br></br>

      <div className="relative mb-15 w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex-1 cursor-pointer rounded-md py-2 transition ${
              !isSignUp
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex-1 cursor-pointer rounded-md py-2 transition ${
              isSignUp
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <FloatingInput
              id="name"
              label="Real Name"
              type="text"
              value={displayName}
              onChange={setDisplayName}
            />
          )}

          <FloatingInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <div className="flex flex-col gap-1">
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              minLength={8}
            />
            {isSignUp && password.length < 8 && (
              <p className="text-xs text-amber-600">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {isSignUp && (
            <FloatingInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              minLength={8}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="transition-shadows bg-sea-teal hover:bg-sea-teal-dark mt-1 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-white duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
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

        {message && (
          <p
            className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-amber-500'}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
