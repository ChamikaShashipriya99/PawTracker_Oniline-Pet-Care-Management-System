const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} PawTracker. All rights reserved.</p>
          <p>Contact us: support@PawTracker.com | +94-800-Paw-Tracker</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;