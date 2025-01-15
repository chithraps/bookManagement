"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { use } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UpdateBookPage({ params }) {
  const { id } = use(params);
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/books/${id}/getDetails`);
        const data = response.data.book;
        setBook(data);
        setTitle(data.title);
        setAuthor(data.author);
        setIsbn(data.isbn);
        setDescription(data.description || "");
        setPublicationYear(data.publicationYear || "");
      } catch (error) {
        toast.error("Failed to fetch book details. Please try again.");
        console.error("Error fetching book details:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchBook();
  }, [id]);

  const validateFields = () => {
    const newErrors = {};
    if (!title) newErrors.title = "Title is required.";
    if (!author) newErrors.author = "Author is required.";
    if (!isbn) newErrors.isbn = "ISBN is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!publicationYear) newErrors.publicationYear = "Publication Year is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/books/${id}/update`, {
        title,
        author,
        isbn,
        description,
        publicationYear,
      });
      toast.success("Book updated successfully!", {
        onClose: () => router.push("/"),
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred while updating the book.";
      toast.error(errorMessage);
      console.error("Error updating book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p>Loading book details...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 p-8">
      <ToastContainer />
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Update Book</h1>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
              ISBN
            </label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label
              htmlFor="publicationYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Publication Year
            </label>
            <input
              id="publicationYear"
              type="number"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.publicationYear && (
              <p className="text-red-500 text-sm mt-1">{errors.publicationYear}</p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
