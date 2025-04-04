import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">PawTracker</Link>
        <nav className="flex gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/advertisements/create" className="hover:underline">Create Ad</Link>
          <Link to="/advertisements/my-ads" className="hover:underline">My Ads</Link>
          <Link to="/advertisements/admin" className="hover:underline">Admin</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;