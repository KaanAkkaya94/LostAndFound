import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/allreports?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/allreports');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-400 text-white py-5 px-8 flex justify-between items-center shadow-lg rounded-b-lg border-b-4 border-yellow-300">
      <Link to="/allreports" className="text-3xl font-extrabold tracking-wide drop-shadow-lg hover:scale-105 transition">
        Lost & Found App
      </Link>
      <form onSubmit={handleSearch} className="flex items-center mr-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded-l text-black border focus:outline-none"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-r font-bold hover:bg-yellow-300 transition"
        >
          Search
        </button>
      </form>
      <div>
        {user ? (
          <>
            <Link to="/allreports" className="mr-6 font-semibold hover:text-yellow-200 transition">All Reports</Link>
            <Link to="/lostreports" className="mr-6 font-semibold hover:text-yellow-200 transition">Create Lost Report</Link>
            <Link to="/profile" className="mr-6 font-semibold hover:text-yellow-200 transition">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-yellow-400 text-purple-900 px-5 py-2 rounded-full font-bold shadow hover:bg-yellow-300 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-6 font-semibold hover:text-yellow-200 transition">Login</Link>
            <Link
              to="/register"
              className="bg-white text-purple-700 px-5 py-2 rounded-full font-bold shadow hover:bg-yellow-200 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;