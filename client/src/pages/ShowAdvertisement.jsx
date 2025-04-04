import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";

const ShowAdvertisement = () => {
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/advertisements/details/${id}`)
      .then((response) => {
        setAdvertisement(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching advertisement:", error);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="p-6">
      <BackButton />
      <h1 className="text-3xl my-4 font-bold">Advertisement Details</h1>
      {loading ? (
        <Spinner />
      ) : advertisement ? (
        <div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-6 mx-auto bg-white shadow-md">
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Heading:</span>
            <span>{advertisement.heading}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Description:</span>
            <span>{advertisement.description}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Name:</span>
            <span>{advertisement.name}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Email:</span>
            <span>{advertisement.email}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Contact Number:</span>
            <span>{advertisement.contactNumber}</span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Type:</span>
            <span>{advertisement.advertisementType}</span>
          </div>
          {advertisement.petType && (
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-600">Pet Type:</span>
              <span>{advertisement.petType}</span>
            </div>
          )}
          {advertisement.photo && (
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-600">Image:</span>
              <img
                src={`http://localhost:5000/uploads/${advertisement.photo}`}
                alt={advertisement.heading}
                className="w-64 h-64 object-cover rounded-md"
              />
            </div>
          )}
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Status:</span>
            <span className={`${advertisement.status === "Approved" ? "text-green-500" : advertisement.status === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
              {advertisement.status}
            </span>
          </div>
          <div className="my-4">
            <span className="text-xl mr-4 text-gray-600">Payment Status:</span>
            <span>{advertisement.paymentStatus}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Advertisement not found.</p>
      )}
    </div>
  );
};

export default ShowAdvertisement;