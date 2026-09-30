import os

import requests


DIFY_API_URL = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1/chat-messages")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "").strip()

if not DIFY_API_KEY:
    raise RuntimeError("Missing DIFY_API_KEY. Set it in your local environment before running this script.")

payload = {
    "inputs": {"story_state": "test", "last_question": "test"},
    "query": "你好",
    "response_mode": "blocking",
    "user": "eval_bot",
}

headers = {
    "Authorization": f"Bearer {DIFY_API_KEY}",
    "Content-Type": "application/json",
}

print("正在发起单条诊断请求...\n")
try:
    res = requests.post(DIFY_API_URL, json=payload, headers=headers, timeout=30)
    print(f"📌 HTTP 状态码: {res.status_code}")
    print(f"📌 响应内容 (前 300 字符): \n{res.text[:300]}")
except Exception as exc:
    print(f"❌ 网络连接失败: {exc}")
