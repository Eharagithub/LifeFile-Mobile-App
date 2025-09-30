from langchain_google_vertexai import VertexAI
from google.cloud import aiplatform
import os

def test_vertex_ai():
    print("Testing Vertex AI Connection...")
    print(f"Using credentials from: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
    
    try:
        # Initialize Vertex AI
        aiplatform.init(
            project='health-app-472017',
            location='us-central1'
        )
        
        # Create Gemini Pro model
        llm = VertexAI(
            model_name="gemini-2.5-pro",
            max_output_tokens=2048,
            temperature=0.3,
            top_p=0.8,
            verbose=True
        )
        
        # Test simple completion
        test_prompt = "Generate a simple greeting in JSON format."
        print("\nSending test prompt:", test_prompt)
        
        response = llm.invoke(test_prompt)
        print("\nResponse from Vertex AI:")
        print(response)
        
        return True
        
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_vertex_ai()
    if success:
        print("\nVertex AI test completed successfully! ✅")
    else:
        print("\nVertex AI test failed! ❌")