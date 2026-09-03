import os
from openai import OpenAI

# Initialize the OpenAI client with NVIDIA's base URL and your API key
client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key=os.environ.get("NVIDIA_API_KEY", "")
)

print("Sending request to NVIDIA Nemotron-3 Super...")

# Create the completion request
completion = client.chat.completions.create(
  model="nvidia/nemotron-3-super-120b-a12b",
  messages=[{"role":"user", "content":"Hello! Can you briefly introduce your reasoning capabilities?"}],
  temperature=1,
  top_p=0.95,
  max_tokens=16384,
  extra_body={"chat_template_kwargs":{"enable_thinking":True}, "reasoning_budget":16384},
  stream=True
)

print("==== Response Stream ====\n")

# Stream the response back
for chunk in completion:
  if not chunk.choices:
    continue
    
  # Extract reasoning (the thought process) if available
  reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
  if reasoning:
    print(reasoning, end="", flush=True)
    
  # Extract the final expected reply
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="", flush=True)

print("\n\n==== Done !====")
