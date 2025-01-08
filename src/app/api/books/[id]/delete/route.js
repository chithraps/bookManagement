import client from "@/openSearchClient/opensearchClient";
import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";

export async function DELETE(request, { params }) {
  const { id } = await params;
  
    try {
      // Connect to MongoDB
      await connect();
      
  
      // Delete from MongoDB
      const mongoResult = await Book.deleteOne({ _id: id });
      if (!mongoResult.deletedCount) {
        return new Response(JSON.stringify({ error: "Book not found in MongoDB" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // Delete from Elasticsearch
      try {
        await client.delete({
          index: "books",
          id: id,
        });
      } catch (elasticError) {
        console.error("Error deleting from Elasticsearch:", elasticError);       
        return new Response(
          JSON.stringify({
            message: "Book deleted from MongoDB, but Elasticsearch deletion failed",
            elasticError: elasticError.meta?.body?.error || elasticError.message,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      return new Response(JSON.stringify({ message: "Book deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      return new Response(JSON.stringify({ error: "Failed to delete book" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
