"use client"

export default function Header({onAddBook}){
    return (
        <header className="flex justify-between items-center bg-gray-100 p-4 shadow-md">
          <h1 className="text-xl font-bold">Book Library</h1>
          <button
            onClick={onAddBook}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Book
          </button>
        </header>
      );
}