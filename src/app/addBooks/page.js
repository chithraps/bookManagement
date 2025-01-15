"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddBook() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publicationYear: "",
    isbn: "",
    description: "",
    imageFile: null,
  });

  const [loading, setLoading] = useState(false);  
  const [errors, setErrors] = useState({}); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: e.target.files[0],
    }));
  };

  const validateForm = () => {
    let formErrors = {};
   
    if (!formData.title) formErrors.title = "Title is required";
    if (!formData.author) formErrors.author = "Author is required";
    if (!formData.publicationYear) formErrors.publicationYear = "Publication year is required";
    if (!formData.isbn) formErrors.isbn = "ISBN is required";
    if (!formData.description) formErrors.description = "Description is required";
    if (!formData.imageFile) formErrors.imageFile = "Image is required";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});  

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    try {
      await axios.post("/api/books", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Book added successfully!", {
        onClose: () => {
          router.push("/");
        },
      });
    } catch (error) {
      console.error("Error adding book:", error);

      if (error.response) {
        
        toast.error(`Error: ${error.response.data.message || "Failed to add the book."}`);
      } else if (error.request) {
       
        toast.error("Network error. Please try again later.");
      } else {
        
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-6">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-lg max-w-lg w-full"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Add a New Book
        </h2>

        <div className="space-y-6">
          <div className="mb-4">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : ""
              }`}
              
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="author" className="text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.author ? "border-red-500" : ""
              }`}
              
            />
            {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
          </div>

          <div className="mb-4">
            <label
              htmlFor="publicationYear"
              className="text-sm font-medium text-gray-700"
            >
              Publication Year
            </label>
            <input
              type="number"
              id="publicationYear"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.publicationYear ? "border-red-500" : ""
              }`}
              
            />
            {errors.publicationYear && (
              <p className="text-sm text-red-500">{errors.publicationYear}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="isbn" className="text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.isbn ? "border-red-500" : ""
              }`}
              
            />
            {errors.isbn && <p className="text-sm text-red-500">{errors.isbn}</p>}
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : ""
              }`}
              rows="4"
              
            ></textarea>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="imageFile"
              className="text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              onChange={handleFileChange}
              className={`w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.imageFile ? "border-red-500" : ""
              }`}
            />
            {errors.imageFile && <p className="text-sm text-red-500">{errors.imageFile}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
