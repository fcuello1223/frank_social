import { useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, signInWithGithub, signOut } = useAuth();

  const displayName = user?.user_metadata.user_name || user?.email;

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-mono text-xl font-bold text-white">
            Frank <span className="text-cyan-500">Social</span>
          </Link>
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-cyan-500 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="text-white hover:text-cyan-500 transition-colors"
            >
              Create Post
            </Link>
            <Link
              to="/communities"
              className="text-white hover:text-cyan-500 transition-colors"
            >
              Communities
            </Link>
            <Link
              to="/community/create"
              className="text-white hover:text-cyan-500 transition-colors"
            >
              Create Community
            </Link>
          </div>
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-white">{displayName}</span>
                <button
                  onClick={signOut}
                  className="bg-rose-500 px-3 py-1 rounded cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGithub}
                className="bg-emerald-500 px-3 py-1 rounded"
              >
                Sign In With Github
              </button>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-white focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-white hover:text-cyan-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[rgba(10, 10, 10, 0.9)]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-cyan-500"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-cyan-500"
            >
              Create Post
            </Link>
            <Link
              to="/communities"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-cyan-500"
            >
              Communities
            </Link>
            <Link
              to="/community/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-cyan-500"
            >
              Create Community
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
