"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { use } from "react";

export default function getDetails({ params }) {
  const { id } = use(params);
  console.log("in update book page ", id);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/books/${id}/getDetails`);
        const data = response.data;
        console.log("data is ", data);
        setBook(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);
  const handleUpdateBook = (id) => {
    console.log("fgsdfgsdh id is ", id);
    router.push(`/updateBook/${id}`);
  };
  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`/api/books/${id}/delete`);
      setIsDeleted(true);
      toast.success("Book deleted successfully!", {
        onClose: () => {
          router.push("/");
        },
      });
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (!book && !isDeleted) {
    return <div className="text-center text-red-500">Book not found.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
        >
          back
        </button>
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 p-6">
          {/* Book Image */}
          {book.book.image_url && (
            <div className="w-full md:w-1/3">
              <img
                src={book.book.image_url}
                alt={book.book.title}
                className="object-cover w-full h-full rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Book Details */}
          <div className="w-full md:w-2/3 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {book.book.title}
            </h1>
            <p className="text-lg text-gray-700">
              <strong className="font-semibold">Author:</strong>{" "}
              {book.book.author}
            </p>
            <p className="text-lg text-gray-700">
              <strong className="font-semibold">Publication Year:</strong>{" "}
              {book.book.publicationYear}
            </p>
            <p className="text-lg text-gray-700">
              <strong className="font-semibold">ISBN:</strong> {book.book.isbn}
            </p>
            <p className="text-lg text-gray-700">
              <strong className="font-semibold">Description:</strong>{" "}
              {book.book.description}
            </p>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleUpdateBook(book.book._id)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteBook(book.book._id)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
