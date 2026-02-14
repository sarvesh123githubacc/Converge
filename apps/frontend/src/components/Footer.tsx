import logo from "../assets/logo.png"
import { Link } from 'react-router-dom'

const Footer = () => {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gradient-to-br from-[#071A2D] to-[#0B2A3A] text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <img src={logo} alt="Converge Logo" className="mb-4 w-36" />
          <p className="text-sm mb-4 text-gray-400">
            Presence, reimagined for remote teams.
          </p>
          <div className="flex gap-4 text-xl">
            <i className="fab fa-twitter hover:text-white cursor-pointer" />
            <i className="fab fa-linkedin hover:text-white cursor-pointer" />
            <i className="fab fa-github hover:text-white cursor-pointer" />
            <i className="fas fa-envelope hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-3">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/aboutus" onClick={scrollTop} className="hover:underline">Features</Link></li>
            <li><Link to="/aboutus" onClick={scrollTop} className="hover:underline">Private Areas</Link></li>
            <li><Link to="/aboutus" onClick={scrollTop} className="hover:underline">Space Builder</Link></li>
            <li>Pricing</li>
            <li>Contact Sales</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white font-semibold mb-3">Resources</h4>
          <ul className="space-y-2">
            <li><Link to="/aboutus" onClick={scrollTop} className="hover:underline">Blog</Link></li>
            <li>Help Center</li>
            <li>Admin Support</li>
            <li>Discord Community</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/aboutus" onClick={scrollTop} className="hover:underline">
                About Us
              </Link>
            </li>
            <li>Careers</li>
            <li>
              <Link to="/aboutus" onClick={scrollTop} className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/aboutus" onClick={scrollTop} className="hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 mt-10">
        © 2026 Converge. All rights reserved.
      </div>
    </div>
  )
}

export default Footer
