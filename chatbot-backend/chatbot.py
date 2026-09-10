import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError("API Key is missing")

BASE_DIR = Path(__file__).resolve().parent

KNOWLEDGE_FILE = BASE_DIR / "knowledge.txt"

CHROMA_DIR = BASE_DIR / "chroma_db"

def load_knowledge():
    if not KNOWLEDGE_FILE.exists():
        raise FileNotFoundError(
            f"File not found {KNOWLEDGE_FILE}"
        )
    text = KNOWLEDGE_FILE.read_text( encoding= "utf-8")

    return text



def create_documents(): 
    knowledge = load_knowledge() 
    document = Document( page_content=knowledge, metadata={ "source": "OriginX Knowledge Base" } )


    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500, 
        chunk_overlap=50, 
        separators=[ "\n\n", "\n", ". ", " ", "" ]
    )

    documents = text_splitter.split_documents([document])

    return documents


embeddings = GoogleGenerativeAIEmbeddings(
    model = "gemini-embedding-001",
    google_api_key=GOOGLE_API_KEY
)


def get_vectorstore():

    documents = create_documents()

    vectorstore = Chroma(
        collection_name="CarbonRoot_knowledge",
        embedding_function=embeddings,
        persist_directory=str(CHROMA_DIR)
    )
    
    existing = vectorstore.get()

    if not existing["ids"]:

        vectorstore.add_documents(
            documents
        )

    return vectorstore


vectorstore = get_vectorstore()


retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 4
    }
)

llm = ChatGoogleGenerativeAI(
    model= os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-flash"
    ),

    temperature=0.2,

    google_api_key=GOOGLE_API_KEY
)



prompt = ChatPromptTemplate.from_messages([

    (
       
    "system",
    """
You are the official CarbonRoot Trust Assistant.

CarbonRoot is a climate and carbon infrastructure platform focused on
enabling transparent, measurable and credible carbon projects.

Your role is to help users understand CarbonRoot, carbon credits,
carbon projects, carbon markets, farmers, climate impact, MRV
(Measurement, Reporting and Verification), project monitoring,
carbon project development, sustainability and related CarbonRoot
capabilities.

IMPORTANT RULES:

1. Use ONLY the provided CarbonRoot context.

2. Never invent CarbonRoot product information.

3. Never invent carbon credit quantities, prices, revenues,
   project sizes or financial figures.

4. Never invent project IDs, farmer IDs, transaction IDs,
   verification IDs or other identifiers.

5. Never claim that a carbon credit, carbon project or climate
   impact has been verified unless the provided context explicitly
   confirms that verification.

6. Never invent certifications, standards, registrations or
   third-party approvals.

7. Never invent farmers, beneficiaries, project locations or
   geographical information.

8. Never invent carbon reduction, carbon removal, emissions,
   sequestration or sustainability figures.

9. Never invent partnerships, customers, investors or
   organizational relationships.

10. Never invent MRV results, monitoring data or verification
    records.

11. Never provide financial, investment or carbon-credit pricing
    information unless it is explicitly available in the
    provided CarbonRoot context.

12. Clearly distinguish between:
    - CarbonRoot capabilities and what the platform is designed to
      support.
    - Information that is actually available and verified in the
      provided context.

13. If the context does not contain enough verified information to
    answer the user's question, respond:

    "I don't have enough verified CarbonRoot information to answer that."

14. Do not use general knowledge to fill missing CarbonRoot
    information.

15. Never make assumptions based on a user's question.

16. Never create fictional examples, IDs, projects, farmers,
    carbon credits or verification records that could be mistaken
    for real CarbonRoot data.

17. If a user asks whether a specific carbon project, credit,
    farmer, organization or activity is verified, only confirm it
    when the provided context explicitly supports the claim.

18. If the user asks about a specific number, statistic,
    projection or financial figure, provide it only when that
    information exists in the provided context.

19. Keep answers concise, professional and premium.

20. When appropriate, use short bullet points for clarity.

21. Do not call yourself ChatGPT, an AI model, or another assistant.

22. You represent CarbonRoot.

23. Do not claim that CarbonRoot has capabilities that are not
    explicitly described in the provided context.

24. If the user asks something unrelated to CarbonRoot and the
    provided context does not support an answer, politely explain
    that you can only provide information based on verified
    CarbonRoot information.

CARBONROOT CONTEXT:

{context}
"""
),

(
    "human",
    "{question}"
)
])




def ask_carbonroot(question: str):

    question = question.strip()

    if not question:

        return "Please enter a question about CarbonRoot."


    documents = retriever.invoke(
        question
    )


    if not documents:

        return (
            "I don't have enough verified CarbonRoot "
            "information to answer that."
        )


    context = "\n\n".join(
        document.page_content
        for document in documents
    )


 

    formatted_prompt = prompt.format_messages(
        context=context,
        question=question
    )


    response = llm.invoke(
        formatted_prompt
    )


    return response.content
    