#import os
import sys
import openai

#import config

openai.api_key = ("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")

response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo-16k",
                    messages=[
                        {"role": "system", "content": "You are a helpful research assistant."},
                        {"role": "user", "content": f"Summarize this content in concise point form: {sys.argv[1]}"},
                            ],
                                )

print(response["choices"][0]["message"]["content"])

sys.stdout.flush()

