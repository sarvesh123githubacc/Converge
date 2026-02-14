import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"
import { CircleUserRound, Merge } from 'lucide-react'

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileClicked, setIsProfileClicked] = useState(false);
    const [username, setUsername] = useState<string | null>(null)
    const navigate = useNavigate()
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

      {!isLoggedIn && (
        <div className="flex items-center gap-4">
          <Link to="/signup">
            <button className="bg-[#FED767] text-[#CC6933] px-4 py-2 font-bold rounded-lg hover:shadow-lg transition">
              Signup
            </button>
          </Link>

          <Link
            to="/signin"
            className="text-white font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      )}

      {isLoggedIn && (
        <div className="flex items-center gap-6">

          <div className="bg-[#FED767] text-[#CC6933] px-4 py-2 flex items-center gap-2 rounded-2xl shadow-sm hover:shadow-md transition">
            <button
              onClick={() => {
                navigate("/join-space");
              }}
              className="flex items-center gap-2 font-semibold text-lg hover:underline"
            >
              <Merge size={18} />
              Join a space
            </button>
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
              <div className="absolute top-full mt-3 bg-white shadow-xl rounded-xl border border-gray-200 min-w-[120px] z-50 overflow-hidden">

                <button
                  onClick={() => {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("userId");
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  </div>
);

}


export default Navbar
