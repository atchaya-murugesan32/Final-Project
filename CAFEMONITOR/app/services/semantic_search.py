import os
import certifi

os.environ.setdefault("SSL_CERT_FILE", certifi.where())

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

# 1. Load a pretrained Sentence Transformer model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def semantic_search(query: str, places: dict[str,str] , top_k: int = 5) -> list[tuple[str, float]]:
    """
    Perform semantic search to find the most relevant documents for a given query.

    Args:
        query (str): The input query string.
        places (dict): A dictionary of places ID and their summaries.
        top_k (int): The number of top results to return.

    Returns:
        list[tuple[str, float]]: A list of tuples containing the top_k documents and their similarity scores.
    """
    # 2. Encode the query and documents into embeddings
    query_embedding = model.encode([query])[0]
    document_embeddings = model.encode(list(places.values()))

    # 3. Compute cosine similarity between the query and each document
    similarities = [
        (place_id, float(cos_sim(query_embedding, doc_embedding)))
        for place_id, doc_embedding in zip(places.keys(), document_embeddings)
    ]

    # 4. Sort the documents by similarity score in descending order
    similarities.sort(key=lambda x: x[1], reverse=True)

    # 5. Return the top_k most similar documents
    return similarities[:top_k]