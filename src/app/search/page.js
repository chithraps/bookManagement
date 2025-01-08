"use client"

import { useState } from "react";
import axios from "axios";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async (page = 1) => {
    try {
        console.log("in handle search")
      const response = await axios.get(
        `/api/search?query=${query}&page=${page}&limit=10`
      );
      const data = response.data;
      setBooks(data.books);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Error searching books:", error);
      console.error("Error searching books:", error?.response?.data || error.message);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handleSearch(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) handleSearch(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Search Books</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or description"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={() => handleSearch(1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>
      {books.length === 0 ? (
        <p className="text-gray-500 text-lg">No books found.</p>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {books.map((book, index) => (
              <div key={index} className="p-2 rounded">
                <img
                  src={book.image_url || "/default-book.png"}
                  alt={book.title}
                  className="h-48 w-32 object-cover mb-2"
                />
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
                <p className="text-sm text-gray-500">{book.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded ml-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}