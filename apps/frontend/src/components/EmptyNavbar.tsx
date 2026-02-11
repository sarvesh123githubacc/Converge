import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"
import { CircleUserRound } from 'lucide-react'

const EmptyNavbar = () => {
    const [isProfileClicked, setIsProfileClicked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState<string | null>("")
    function getUserStatus() {
        const token = sessionStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }
    useEffect(() => {
        getUserStatus();
    }, [])

    useEffect(() => {
        const username = sessionStorage.getItem("username")
        setUsername(username)
    }, [])
    const navigate = useNavigate()

    return (
  <div className="bg-[#3E74E7] shadow-md">
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">

      <div className="flex items-center">
        <Link to={`${isLoggedIn ? `/home/username/${username}` : "/"}`}>
          <img
            src={logo}
            className="w-52 hover:scale-105 transition-transform"
            alt="Converge Logo"
          />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setIsProfileClicked(!isProfileClicked);
          }}
          className="text-white hover:text-white/80 transition"
        >
          <CircleUserRound size={36} />
        </button>

        {isProfileClicked && (
          <div className="absolute right-0 top-full mt-3 bg-white shadow-xl rounded-xl border border-gray-200 min-w-[180px] z-50 overflow-hidden font-semibold">
            <Link
              to="/profile/userId"
              className="block px-4 py-3 hover:bg-gray-100"
            >
              Profile
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("userId");
                navigate("/");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>

    </div>
  </div>
);

}


export default EmptyNavbar

