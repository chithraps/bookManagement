import client from "@/openSearchClient/opensearchClient";
import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";

export async function PUT(request, { params }) {
    const { id } = await params;
  console.log("id is gsdfgd",id)
  
    try {
      const body = await request.json();
      const { title, author, isbn,description,
        publicationYear, } = body;
      console.log("title ",title) 
  
      if (!title || !author || !isbn ||!description ||!publicationYear) {
        return new Response(
          JSON.stringify({ error: "All fields are required: title, author, description, image_url" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // Connect to MongoDB
      await connect();
      
  
      // Update MongoDB
      const mongoResult = await Book.updateOne(
        { _id: id },
        { $set: { title, author, isbn ,description,publicationYear} }
      );
      if (!mongoResult.matchedCount) {
        return new Response(JSON.stringify({ error: "Book not found in MongoDB" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // Update Elasticsearch
      const elasticResult = await client.update({
        index: "books",  
        id: id,         
        body: {          
          doc: { 
            title, 
            author, 
            isbn ,
            description,
            publicationYear
          }
        }
      });
  
      return new Response(JSON.stringify({ message: "Book updated successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error updating book:", error);
      return new Response(JSON.stringify({ error: "Failed to update book" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }