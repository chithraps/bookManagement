import { Client } from "@opensearch-project/opensearch";

const client = new Client({
    node : process.env.OPENSEARCH_ENDPOINT,
    auth :{
        username : process.env.OPENSEARCH_USERNAME,
        password : process.env.OPENSEARCH_PASSWORD,
    },
});

export default client;