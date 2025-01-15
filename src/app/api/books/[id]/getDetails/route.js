import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";
import client from "@/openSearchClient/opensearchClient";

export async function GET(request, { params }) {
    const { id } = await params;
  console.log("id is ",id)

  try {
    await connect();
    if (id) {
      // Fetch a specific book by ID
      const { body } = await client.get({
        index: "books",
        id: id,
      });

      if (!body.found) {
        return new Response(JSON.stringify({ error: "Book not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const book = {
        ...body._source,
        _id: body._id,
      };
      console.log("book ",book)
      return new Response(JSON.stringify({ book }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    
    return new Response(
      JSON.stringify({ error: "No bookId provided" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error fetching book:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch book" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}