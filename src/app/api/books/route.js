import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";
import path from "path";
import client from "@/openSearchClient/opensearchClient";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";

export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1; 
    const limit = parseInt(url.searchParams.get("limit")) || 10; 

    const from = (page - 1) * limit;
    console.log("I am in post")    
     // Fetch books from OpenSearch
     const { body } = await client.search({
      index: "books",
      body: {
        from,
        size: limit,
        query: {
          match_all: {},
        },
      },
    });

    
    const books = body.hits.hits.map(hit => ({
      ...hit._source,
      _id: hit._id,  
    }));
    console.log("books ",books)
    return new Response(
      JSON.stringify({
        books,
        totalBooks: body.hits.total.value,
        totalPages: Math.ceil(body.hits.total.value / limit),
        currentPage: page,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching books:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
export async function POST(request) {
  try {
    await connect();

    const formData = await request.formData();
    const title = formData.get("title");
    const author = formData.get("author");
    const publicationYear = formData.get("publicationYear");
    const isbn = formData.get("isbn");
    const description = formData.get("description");

    console.log("isbn ", isbn);
    const imageFile = formData.get("imageFile");
    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No files received." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = Date.now() + imageFile.name.replaceAll(" ", "_"); 
    console.log(filename);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    await mkdir(uploadDir, { recursive: true });

    // Write the image file to the disk
    await writeFile(path.join(uploadDir, filename), buffer);

    // Save the image path (relative path) to the database
    const imagePath = `/uploads/${filename}`;
    console.log(imagePath)

    const newBook = new Book({
      title,
      author,
      publicationYear,
      isbn,
      description,
      image_url : imagePath,
    });

    await newBook.save();
    await client.index({
      index : "books",
      id : newBook._id.toString(),
      body:{
        title,
        author,
        publicationYear,
        isbn,
        description,
        image_url: imagePath,
      }
    })
    return new Response(JSON.stringify(newBook), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to add the book" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
