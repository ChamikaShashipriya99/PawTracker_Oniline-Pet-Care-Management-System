import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreateAdvertisement from "./pages/CreateAdvertisement";
import ShowAdvertisement from "./pages/ShowAdvertisement";
import EditAdvertisement from "./pages/EditAdvertisement";
import DeleteAdvertisement from "./pages/DeleteAdvertisement";
import Admin from "./pages/admin";
import MyAds from "./pages/MyAds";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advertisements/create" element={<CreateAdvertisement />} />
          <Route path="/advertisements/admin" element={<Admin />} />
          <Route path="/advertisements/my-ads" element={<MyAds />} />
          <Route path="/advertisements/details/:id" element={<ShowAdvertisement />} />
          <Route path="/advertisements/edit/:id" element={<EditAdvertisement />} />
          <Route path="/advertisements/delete/:id" element={<DeleteAdvertisement />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;