import { useAuth } from "../context/AuthContext/index"; // Adjust the import path as needed

const Navbar = () => {
  const { userLoggedIn } = useAuth(); // Get the userLoggedIn state from AuthContext

  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CW</span>
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold text-white">CrimeWatch</span>
              <span className="hidden sm:inline ml-2 text-sm text-gray-600">India</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-blue-600 px-3 py-2 font-medium active:text-blue-600">
              Crime Map
            </a>
            {!userLoggedIn ? (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:text-blue-600 transition-colors ">
                <a href="/login">Login</a>
              </button>
            ) : (
              <a href="/form" className="text-white hover:text-blue-600 active:text-blue-600 px-3 py-2 font-medium">
                Form
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2">
              <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <a href="/" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
            Crime Map
          </a>
          {!userLoggedIn ? (
            <a href="/login" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Login
            </a>
          ) : (
            <a href="/form" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Form
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
