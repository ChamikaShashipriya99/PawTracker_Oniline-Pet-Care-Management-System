import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import { useSnackbar } from "notistack";

const DeleteAdvertisement = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteAdvertisement = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:5000/advertisements/delete/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Advertisement Deleted Successfully", { variant: "success" });
        navigate("/advertisements/my-ads");
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error deleting advertisement:", error);
        enqueueSnackbar("Error deleting advertisement", { variant: "error" });
      });
  };

  return (
    <div className="p-6">
      <BackButton />
      <h1 className="text-3xl my-4 font-bold">Delete Advertisement</h1>
      {loading && <Spinner />}
      <div className="flex flex-col items-center border-2 border-red-400 rounded-xl w-[600px] p-8 mx-auto bg-white shadow-md">
        <h3 className="text-2xl mb-4">Are you sure you want to delete this advertisement?</h3>
        <button
          className="p-4 bg-red-600 text-white rounded-lg w-full hover:bg-red-700 transition"
          onClick={handleDeleteAdvertisement}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes, Delete It"}
        </button>
      </div>
    </div>
  );
};

export default DeleteAdvertisement;