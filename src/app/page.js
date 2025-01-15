"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import { useRouter } from "next/navigation";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchBooks = async (page = 1) => {
    try {
      const response = await axios.get(`/api/books?page=${page}&limit=10`);
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  const handleAddBook = () => {
    router.push("/addBooks");
  };
  const handleSearch = () => {
    router.push("/search"); 
  };
  const handleFetchBook = (id) => {   
     console.log("id is ",id)
    router.push(`/fetchBook/${id}`);
  };
  

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddBook={handleAddBook} onSearchBook={handleSearch}/>
      <div className="p-8">
        {books.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            There are no books.
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {books.map((book, index) => (
                <div key={book._id || index} className="p-2 rounded">
                  <img
                    src={book.image_url || "/default-book.png"}
                    alt={book.title}
                    className="h-48 w-32 object-cover mb-1 mx-auto"
                    onClick={()=>{handleFetchBook(book._id)}}
                  />
                  
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mt-4">
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
    </div>
  );
}
