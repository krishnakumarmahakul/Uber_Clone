import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
function CaptainLogin() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.email) next.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email"
    if (!form.password) next.password = "Password is required"
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setSubmitting(true)
    try {
      // TODO: Call your API here
      // await loginCaptain(form.email, form.password)
      navigate('/home')
    } catch (err) {
      setErrors({ form: "Login failed. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <header className="flex items-center gap-2 mb-6">
        <i className="fa-brands fa-uber text-3xl" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-black">Uber Captain</h1>
      </header>

      <form onSubmit={handleSubmit} noValidate className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        {errors.form && <p className="mb-4 text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-col">
          <label htmlFor="email" className="text-base text-gray-700 mb-2">
            What is your email?
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="Enter your email"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
          />
          {errors.email && (
            <p id="email-error" className="mb-3 text-sm text-red-600">
              {errors.email}
            </p>
          )}

          <label htmlFor="password" className="text-base text-gray-700 mb-2">
            What is your password?
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Enter your password"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
          />
          {errors.password && (
            <p id="password-error" className="mb-3 text-sm text-red-600">
              {errors.password}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-sm">
        <span>Don&apos;t have an account? </span>
        <Link to="/captain/signup" className="text-blue-500 hover:text-blue-700">
          Sign Up
        </Link>
      </div>
    </div>
  )
}

export default CaptainLogin