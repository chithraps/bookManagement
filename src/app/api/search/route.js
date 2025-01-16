import client from "@/openSearchClient/opensearchClient";

export async function GET(request) {
    try {
        console.log("In search get ")
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
    
        const books = body.hits.hits.map((hit) => hit._source);
    
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