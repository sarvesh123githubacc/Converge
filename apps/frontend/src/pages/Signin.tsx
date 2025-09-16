//@ts-nocheck
import React, { useState } from 'react'
import { Eye, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = "http://localhost:3000"
const Signin = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/signin`, {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const response = await res.json();
            if (res.status == 200) {
                alert("signed In!!")
                navigate("/home")
            }
        } catch (error) {
            console.log("error", error.message)
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-3xl mb-6 shadow-xl">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Sign In</h1>
                    <p className="text-gray-600 text-lg">Login to your existing account</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10">

                    {/* Form Fields */}
                    <div className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Username</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="username"
                                    value={username}
                                    onChange={e => { setUsername(e.target.value) }}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value) }}
                                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
                                    placeholder="Create a strong password"
                                />
                                <Eye className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-gray-600" />
                            </div>
                        </div>

                        {/* Create Account Button */}
                        <button onClick={handleSubmit} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg  focus:ring-4 focus:ring-black transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center">
                            Sign In
                            <ArrowRight className="w-6 h-6 ml-3" />
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Doesn't have an account?{' '}
                            <span className="text-black font-bold "><Link to="/"><button className='cursor-pointer hover:underline'>Sign Up</button></Link></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signin
