import json
import os
import time

import requests


DIFY_API_URL = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1/chat-messages")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "").strip()

if not DIFY_API_KEY:
    raise RuntimeError("Missing DIFY_API_KEY. Set it in your local environment before running this script.")


def load_dataset(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def call_dify_api(item, max_retries=3):
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": {
            "story_state": str(item.get("story_state", "")),
            "last_question": str(item.get("last_question", "")),
        },
        "query": item["query"],
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "eval_bot",
    }

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(
                DIFY_API_URL,
                headers=headers,
                json=payload,
                timeout=(10, 60),
            )
            if response.status_code != 200:
                print(
                    f"\n⚠️ ID {item.get('id')} 请求异常 "
                    f"[HTTP {response.status_code}]: {response.text[:120]}"
                )
                time.sleep(2)
                continue

            try:
                res_data = response.json()
            except requests.exceptions.JSONDecodeError:
                print(
                    f"\n⚠️ ID {item.get('id')} 服务器未返回 JSON: "
                    f"{response.text[:120]}"
                )
                time.sleep(2)
                continue

            return res_data.get("answer", "").strip()
        except requests.exceptions.Timeout:
            print(f"\n⏳ ID {item.get('id')} 超时 (第 {attempt}/{max_retries} 次重试...)")
            time.sleep(2)
        except Exception as exc:
            print(f"\n❌ ID {item.get('id')} 发生未知错误: {exc}")
            time.sleep(1)

    print(f"\n💥 ID {item.get('id')} 连续 {max_retries} 次调用失败！")
    return "ERROR"


def run_evaluation(dataset_path):
    dataset = load_dataset(dataset_path)
    total = len(dataset)
    correct = 0
    badcases = []

    print(f"🚀 开始评测，共 {total} 条数据...\n")
    start_time = time.time()

    for idx, item in enumerate(dataset, 1):
        print(f"正在测试 [{idx}/{total}] ID: {item.get('id')} ...", end="\r")
        predicted = call_dify_api(item)
        expected = str(item["expected_intent"]).strip()

        if predicted == expected:
            correct += 1
        else:
            badcases.append(
                {
                    "id": item.get("id"),
                    "query": item["query"],
                    "expected": expected,
                    "predicted": predicted,
                    "story_state": item.get("story_state"),
                    "last_question": item.get("last_question"),
                }
            )
        time.sleep(0.3)

    elapsed_time = round(time.time() - start_time, 2)
    accuracy = round((correct / total) * 100, 2)

    print("\n" + "=" * 40)
    print("📊 评测结果报告")
    print(f"总测试数: {total}")
    print(f"正确数量: {correct}")
    print(f"准确率 (Accuracy): {accuracy}%")
    print(f"总耗时: {elapsed_time}s")
    print("=" * 40)

    if badcases:
        with open("badcases.json", "w", encoding="utf-8") as file:
            json.dump(badcases, file, ensure_ascii=False, indent=2)
        print(f"⚠️ 已生成 badcases.json，包含 {len(badcases)} 条误判/异常数据。")


if __name__ == "__main__":
    run_evaluation("意图识别评测集.json")
