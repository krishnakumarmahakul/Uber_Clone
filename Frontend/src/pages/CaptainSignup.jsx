import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function CaptainSignup() {
  const [form, setForm] = useState({
    name:  {
      firstname: "",
      lastname: "",
    }
    ,
    email: "",
    vehicleNumber: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name) next.name = "Name is required"
    if (!form.email) next.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email"
    if (!form.vehicleNumber) next.vehicleNumber = "Vehicle number is required"
    if (!form.password) next.password = "Password is required"
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters"
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
      // TODO: Call signup API
      // await signupCaptain(form)
      // Optionally navigate on success
    } catch (err) {
      setErrors({ form: "Signup failed. Please try again." })
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
          <label htmlFor="name" className="text-base text-gray-700 mb-2">What is your name?</label>
          <div className="flex gap-2">
          <input
            id="name"
            name="name"
            type="text"
            value={form.name.firstname}
            onChange={onChange}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Enter your name"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          <input
            id="name"
            name="name"
            type="text"
            value={form.name.lastname}
            onChange={onChange}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Enter your name"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />

          </div>
          
          {errors.name && <p id="name-error" className="mb-3 text-sm text-red-600">{errors.name}</p>}

          <label htmlFor="email" className="text-base text-gray-700 mb-2">What is your email?</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="Enter your email"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          {errors.email && <p id="email-error" className="mb-3 text-sm text-red-600">{errors.email}</p>}

          <label htmlFor="vehicleNumber" className="text-base text-gray-700 mb-2">What is your vehicle number?</label>
          <input
            id="vehicleNumber"
            name="vehicleNumber"
            type="text"
            value={form.vehicleNumber}
            onChange={onChange}
            autoComplete="off"
            aria-invalid={!!errors.vehicleNumber}
            aria-describedby={errors.vehicleNumber ? "vehicleNumber-error" : undefined}
            placeholder="Enter your vehicle number"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          {errors.vehicleNumber && (
            <p id="vehicleNumber-error" className="mb-3 text-sm text-red-600">{errors.vehicleNumber}</p>
          )}

          <label htmlFor="password" className="text-base text-gray-700 mb-2">What is your password?</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Enter your password"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          {errors.password && <p id="password-error" className="mb-3 text-sm text-red-600">{errors.password}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={submitting}
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-sm">
        <span>Already have an account? </span>
        <Link to="/captain/login" className="text-blue-500 hover:text-blue-700">Log in</Link>
      </div>
    </div>
  )
}

export default CaptainSignup