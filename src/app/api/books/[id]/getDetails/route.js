import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";
import client from "@/openSearchClient/opensearchClient";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

async function generatePresignedUrl(bucketName, s3Key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });  
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

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

      const book = { ...body._source, _id: body._id };

      
      const bucketName = "bookfilestorage";
      const imageUrl = await generatePresignedUrl(bucketName, book.image_url);      
      book.image_url = imageUrl;      
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