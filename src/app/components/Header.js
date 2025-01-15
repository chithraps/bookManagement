"use client";

import { useRouter } from "next/navigation";
import { FaSearch, FaPlusCircle } from "react-icons/fa"; 

export default function Header({ onAddBook, onSearchBook }) {
  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-md rounded-md mx-4">
      <h1 className="text-2xl font-semibold text-gray-800">Book Library</h1>
      <div className="flex space-x-4 items-center">
        <button
          onClick={onAddBook}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out flex items-center space-x-2"
        >
          <FaPlusCircle size={20} />
          <span>Add Book</span>
        </button>
        <button
          onClick={onSearchBook}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out flex items-center space-x-2"
        >
          <FaSearch size={20} />
          <span>Search</span>
        </button>
      </div>
    </header>
  );
}
