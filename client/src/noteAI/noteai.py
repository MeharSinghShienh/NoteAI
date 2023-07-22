import os
import sys
import openai

import config


openai.api_key = (config.openai_api_key)

response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful research assistant."},
                        {"role": "user", "content": f"Summarize this in concise point form: {sys.argv[1]}"},
                            ],
                                )

print(response["choices"][0]["message"]["content"])

sys.stdout.flush()

