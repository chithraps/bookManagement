import { connect } from "@/dbConfig/dbConfig";
import Book from "@/models/book";
import client from "@/openSearchClient/opensearchClient";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

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

  return await getSignedUrl(s3, command, { expiresIn: 3600 }); // Expires in 1 hour
}
export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    const from = (page - 1) * limit;
    console.log("I am in post");
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

    const bucketName = "bookfilestorage";

    const books = await Promise.all(
      body.hits.hits.map(async (hit) => {
        const book = { ...hit._source, _id: hit._id };
        const imageUrl = await generatePresignedUrl(bucketName, book.image_url);
        book.image_url = imageUrl;

        return book;
      })
    );
    console.log("books ", books);
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

    const bucketName = "bookfilestorage";
    const s3Key = `books/${filename}`;
    console.log("s3Key ", s3Key);
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: imageFile.type,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    console.log("images are stored in s3")
    const newBook = new Book({
      title,
      author,
      publicationYear,
      isbn,
      description,
      image_url: s3Key,
    });

    await newBook.save();
    console.log("book details saved")
    await client.index({
      index: "books",
      id: newBook._id.toString(),
      body: {
        title,
        author,
        publicationYear,
        isbn,
        description,
        image_url: s3Key,
      },
    });
    console.log("saved in opensearch")
    return new Response(JSON.stringify(newBook), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error ||"Failed to add the book"}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
