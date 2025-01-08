import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";

export async function GET(request, { params }) {
    const { id } = await params;
  console.log("id is ",id)

  try {
    await connect();
    const book = await Book.findById(id);
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(book), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch book" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}