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

export async function GET(request) {
  try {
    console.log("In search get ");
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    const from = (page - 1) * limit;

    const shouldQueries = [
      { match: { title: query } },
      { match: { author: query } },
      { match: { isbn: query } },
    ];

    if (!isNaN(query)) {
      shouldQueries.push({ term: { publicationYear: parseInt(query) } });
    }

    const { body } = await client.search({
      index: "books",
      body: {
        from,
        size: limit,
        query: {
          bool: {
            should: shouldQueries,
            minimum_should_match: 1,
          },
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
    console.error("Error searching books:", error);
    return new Response(JSON.stringify({ error: "Failed to search books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
