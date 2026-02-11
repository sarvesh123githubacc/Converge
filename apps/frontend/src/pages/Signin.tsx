import { useState } from 'react'
import { Eye, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import meeting from "../assets//meeting.png"
import { toast } from 'react-toastify';


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
            const token = response.token;
            const userId = response.userId;
            // const username = response.username;
            console.log("username", username)
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("userId", userId)
            sessionStorage.setItem("username", username)

            if (res.status == 200) {
                toast("signed In!!")
                navigate(`/home/username/${username}`)
            }
        } catch (error) {
            console.log("error in signing in")
        }
    }
    return (
        <div className="min-h-screen bg-[#E9EEFA] flex items-center justify-center p-4">
            <div className='flex bg-gradient-to-b from-[#3E74E7] to-[#2B5EDC] to-80% shadow-2xl border-gray-400 border-4 rounded-2xl w-5xl h-[70vh] justify-around items-center'>
                <div className='flex flex-col justify-center p-6'>
                    <h1 className='text-white font-bold mb-6 font-serif text-3xl'>Welcome to Metaverse</h1>
                    <img className='size-80 border-6 rounded-lg' src={meeting} alt="" />
                </div>
                <div className="w-full max-w-lg">   
                <div>
                    <h1 className='text-white text-3xl font-serif ml-10 mt-10 font-bold'>Login to Existing Account</h1>
                </div> 
                {/* Form Card */}
                <div className="rounded-3xl border-white/40 p-10">

                    {/* Form Fields */}
                    <div className="space-y-6 flex-row items-center">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Username</label>
                            <div className="relative">
                                <Mail color='white' className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="username"
                                    value={username}
                                    onChange={e => { setUsername(e.target.value) }}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Password</label>
                            <div className="relative">
                                <Lock color='white' className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                        <div className='flex justify-center'>
                            {/* Create Account Button */}
                            <button onClick={handleSubmit} className="w-52 bg-[#FED767] text-[#CC6933] py-2 rounded-xl font-bold text-lg  focus:ring-4 focus:ring-black transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center">Sign In
                                <ArrowRight className="w-6 h-6 ml-3" />
                            </button>
                        </div>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-white">
                            Doesn't have an account?{' '}
                            <span className="text-white font-bold "><Link to="/signup"><button className='cursor-pointer hover:underline'>Sign Up</button></Link></span>
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Signin
