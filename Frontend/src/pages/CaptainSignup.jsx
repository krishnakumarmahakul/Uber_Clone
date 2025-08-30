import React, { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

import { useNavigate } from "react-router-dom"

function CaptainSignup() {
  const [form, setForm] = useState({
    fullname: { firstname: "", lastname: "" },
    email: "",
    vehicle: { color: "", plate: "", capacity: "", vehicleType: "" },
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  // top-level fields (email, password)
  const onChangeTop = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  // nested: fullname
  const onChangeName = (e) => {
    const { name, value } = e.target // name: "firstname" | "lastname"
    setForm((f) => ({ ...f, fullname: { ...f.fullname, [name]: value } }))
    setErrors((prev) => ({ ...prev, name: undefined, form: undefined }))
  }

  // nested: vehicle
  const onChangeVehicle = (e) => {
    const { name, value } = e.target // name: "color" | "plate" | "capacity" | "vehicleType"
    setForm((f) => ({ ...f, vehicle: { ...f.vehicle, [name]: value } }))
    setErrors((prev) => ({ ...prev, vehicle: undefined, form: undefined }))
  }

  const validate = (values) => {
    const next = {}
    if (!values.fullname.firstname?.trim() || !values.fullname.lastname?.trim()) {
      next.name = "First and last name are required"
    }
    if (!values.email?.trim()) next.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email"
    if (!values.password) next.password = "Password is required"
    else if (values.password.length < 6) next.password = "Password must be at least 6 characters"

    if (!values.vehicle.color?.trim()) next.vehicleColor = "Vehicle color is required"
    if (!values.vehicle.plate?.trim()) next.vehiclePlate = "Vehicle plate is required"
    const capNum = Number(values.vehicle.capacity)
    if (!values.vehicle.capacity?.toString().trim() || !Number.isFinite(capNum) || capNum <= 0) {
      next.vehicleCapacity = "Vehicle capacity must be a positive number"
    }
    if (!values.vehicle.vehicleType?.trim()) next.vehicleType = "Vehicle type is required"

    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      fullname: {
        firstname: form.fullname.firstname.trim(),
        lastname: form.fullname.lastname.trim(),
      },
      email: form.email.trim().toLowerCase(),
      password: form.password,
      vehicle: {
        color: form.vehicle.color.trim(),
        plate: form.vehicle.plate.trim().toUpperCase(),
        capacity: Number(form.vehicle.capacity),
        vehicleType: form.vehicle.vehicleType.trim(),
      },
    }

    const nextErrors = validate(payload)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      console.log("Submitting payload:", payload);
      
      const response = await axios.post("http://localhost:5000/captains/register", payload)
      const data = response.data
      console.log("Signup successful:", data)
      const token = data.token  
      localStorage.setItem("captainToken", token)
      navigate("/home")

    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Signup failed. Please try again." })
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
          <label className="text-base text-gray-700 mb-2">What is your name?</label>
          <div className="flex gap-2">
            <input
              id="firstname"
              name="firstname"
              type="text"
              value={form.fullname.firstname}
              onChange={onChangeName}
              autoComplete="given-name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="First name"
              className="w-1/2 px-4 h-10 border border-gray-300 rounded mb-1"
              required
            />
            <input
              id="lastname"
              name="lastname"
              type="text"
              value={form.fullname.lastname}
              onChange={onChangeName}
              autoComplete="family-name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Last name"
              className="w-1/2 px-4 h-10 border border-gray-300 rounded mb-1"
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
            onChange={onChangeTop}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="Enter your email"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          {errors.email && <p id="email-error" className="mb-3 text-sm text-red-600">{errors.email}</p>}

          <label htmlFor="password" className="text-base text-gray-700 mb-2">What is your password?</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChangeTop}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Enter your password"
            className="w-full px-4 h-10 border border-gray-300 rounded mb-1"
            required
          />
          {errors.password && <p id="password-error" className="mb-3 text-sm text-red-600">{errors.password}</p>}

          <h3 className="text-base text-gray-700 mb-2">Vehicle Information</h3>
          <div className="flex gap-4 mb-3">
            <input
              required
              className="w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base"
              type="text"
              name="color"
              placeholder="Vehicle Color"
              value={form.vehicle.color}
              onChange={onChangeVehicle}
            />
            <input
              required
              className="w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base"
              type="text"
              name="plate"
              placeholder="Vehicle Plate"
              value={form.vehicle.plate}
              onChange={onChangeVehicle}
            />
          </div>
          <div className="flex gap-4 mb-7">
            <input
              required
              className="w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base"
              type="number"
              name="capacity"
              min="1"
              placeholder="Vehicle Capacity"
              value={form.vehicle.capacity}
              onChange={onChangeVehicle}
            />
            <select
              required
              className="w-1/2 rounded-lg px-4 py-2 border text-lg"
              name="vehicleType"
              value={form.vehicle.vehicleType}
              onChange={onChangeVehicle}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
          </div>

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