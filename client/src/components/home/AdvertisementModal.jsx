import { AiOutlineClose } from 'react-icons/ai';
import { MdEmail, MdContactPhone, MdSubject, MdMessage } from "react-icons/md";
import { BiUserCircle } from 'react-icons/bi';
import { LuType } from "react-icons/lu";

const AdsModal = ({ book, onClose }) => {
  return (
    <div
      className='fixed bg-black bg-opacity-60 top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center'
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className='w-[700px] max-w-full h-auto bg-white rounded-xl p-6 flex flex-col relative'
      >
        <AiOutlineClose
          className='absolute right-6 top-6 text-3xl text-red-600 cursor-pointer'
          onClick={onClose}
        />
        <h2 className="text-2xl font-bold mb-4 text-center">{book.heading}</h2>
        {book.photo && (
          <img src={`/uploads/${book.photo}`} alt={book.heading} className="w-64 h-64 object-cover mx-auto mb-6 rounded-lg shadow-md" />
        )}
        <div className="space-y-3">
          <div className='flex items-center gap-x-2'>
            <BiUserCircle className='text-red-300 text-2xl' />
            <span className="text-gray-600">Name:</span>
            <span>{book.name}</span>
          </div>
          <div className='flex items-center gap-x-2'>
            <MdEmail className='text-red-300 text-2xl' />
            <span className="text-gray-600">Email:</span>
            <span>{book.email}</span>
          </div>
          <div className='flex items-center gap-x-2'>
            <MdContactPhone className='text-red-300 text-2xl' />
            <span className="text-gray-600">Contact Number:</span>
            <span>{book.contactNumber}</span>
          </div>
          <div className='flex items-center gap-x-2'>
            <LuType className='text-red-300 text-2xl' />
            <span className="text-gray-600">Type:</span>
            <span>{book.advertisementType}</span>
          </div>
          {book.advertisementType === "Sell a Pet" && (
            <div className='flex items-center gap-x-2'>
              <LuType className='text-red-300 text-2xl' />
              <span className="text-gray-600">Pet Type:</span>
              <span>{book.petType}</span>
            </div>
          )}
          <div className='flex items-center gap-x-2'>
            <MdSubject className='text-red-300 text-2xl' />
            <span className="text-gray-600">Description:</span>
            <span>{book.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsModal;