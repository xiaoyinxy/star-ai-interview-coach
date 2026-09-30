# AI 产品经理 STAR 面试故事挖掘教练 PRD-第二版

**版本：V1.0**
**产品形态：AI 对话式面试故事挖掘工具**
**首发用户：AI 产品经理校招 / 初级岗位求职者**
**核心技术方案：Dify Chatflow + STAR State + RAG + Few-shot + LLM Evaluation**

------

# 1. 产品概述

## 1.1 产品定位

一款面向 AI 产品经理求职者的 **行为面试故事挖掘教练**。

产品不直接替用户“润色简历”或“编写面试答案”，而是通过基于 STAR 原则的动态追问，帮助用户从模糊、流水账式的项目经历中逐步回忆并补充：

- 项目背景
- 目标与任务
- 个人关键动作
- 决策依据
- 遇到的困难
- 数据结果
- 个人贡献
- 复盘与反思

最终将用户提供的真实信息整理为一份：

> **真实、具体、有数据、有个人贡献、符合 AIPM 岗位表达习惯的 STAR 面试故事。**

------

# 2. 背景与用户痛点

## 2.1 目标用户

首发聚焦：

**AI 产品经理校招 / 1～3 年经验求职者**

典型特征：

- 有实习、课程项目、比赛或校园经历，但不知道哪些值得讲；
- 项目经历容易描述成流水账；
- 熟悉 STAR 概念，但实际回答仍然缺乏结构；
- 不知道面试官会继续追问什么；
- 不擅长量化结果；
- 容易把团队成果讲成个人成果，或反过来忽视自己的实际贡献；
- 对 Prompt、RAG、Agent、Evaluation 等 AI 产品术语有一定接触，但不会将真实经历准确地表达成专业语言。

------

## 2.2 核心问题

当前常见解决方式主要存在两个问题。

### 通用 LLM

用户通常直接输入：

> “帮我优化一下这段项目经历。”

模型会直接重新组织语言。

问题是：

- 不知道哪些信息是真实的、哪些信息缺失；
- 很少主动连续追问；
- 容易把“信息不足”误认为“表达不好”；
- 可能擅自补充数字、方法或专业术语；
- 无法针对 AIPM 岗位进行有深度的项目追问。

### 人类 Mock Interview

质量高，但：

- 成本较高；
- 时间不可控；
- 无法高频使用；
- 很难针对每一段经历反复进行结构化打磨。

------

# 3. 产品目标

产品的核心目标不是：

> “让 AI 写出一篇看起来很厉害的 STAR。”

而是：

> **通过 AI 追问，提高用户真实经历中的有效信息密度，再对真实信息进行结构化表达。**

因此产品需要完成三个核心任务：

### 任务一：发现缺口

判断用户经历中：

> **现在还缺什么？**

通过 STAR State / Gap Analyzer 完成。

------

### 任务二：决定追问方向

结合：

- 当前项目类型；
- AIPM 能力模型；
- 目标 JD；
- 当前缺失信息；

判断：

> **最值得继续挖什么？**

通过 Domain Knowledge RAG 完成。

------

### 任务三：高质量表达

将用户确认过的事实转换成：

- 清晰 STAR；
- 专业但自然的 AIPM 表达；
- 可直接用于面试练习的回答。

通过：

**Few-shot + Expression RAG + STAR Generator**

完成。

------

# 4. 产品核心原则

## 4.1 真实性第一

AI 不允许替用户创造经历。

包括但不限于：

- 不编造数据；
- 不编造项目规模；
- 不编造用户数量；
- 不编造 A/B Test；
- 不编造 Evaluation Set；
- 不编造 Bad Case Analysis；
- 不编造用户未实际完成的技术动作。

如果信息不足：

> 使用 `[待补充]` 标识。

而不是补齐一个“看起来合理”的答案。

------

## 4.2 先挖掘，再表达

产品必须避免：

> 用户刚输入一句话 → AI立即生成STAR。

正确流程是：

> 经历解析
> → 缺口检测
> → 动态追问
> → 信息收敛
> → STAR生成。

------

## 4.3 每轮只追问一个最高价值问题

避免一次抛出：

> “背景是什么？目标是什么？你做了什么？结果是什么？”

产品每轮只选择：

> **当前信息增益最高的一个问题。**

降低用户认知负担，同时让对话更接近真人面试。

------

## 4.4 专业表达不能凌驾于事实

专业术语的作用是：

> **准确命名用户已经做过的事情。**

而不是：

> 为了让经历显得专业而增加用户没做过的事情。

------

# 5. 产品核心闭环

产品完整体验如下：

```text
用户输入项目经历
        ↓
经历解析 / STAR Slot Filling
        ↓
形成当前 Story State
        ↓
缺失信息检测
        ↓
判断是否需要继续追问
        ↓
       YES
        ↓
岗位 / 项目知识 RAG
        ↓
确定当前最值得深挖的方向
        ↓
Question Generator
        ↓
每次生成一个问题
        ↓
用户回答
        ↓
Information Merger
        ↓
更新 Story State
        ↓
再次判断
        ↓
────────────循环 3～5 轮────────────
        ↓
信息达到生成条件
        ↓
Expression RAG
        ↓
检索与用户真实动作对应的专业表达
        ↓
STAR Generator
        ↓
真实性检查
        ↓
STAR Evaluation
        ↓
岗位能力匹配
        ↓
预测面试官追问
        ↓
最终报告
```

------

# 6. 用户主流程

## 6.1 Step 1：输入经历

用户可以输入：

- 一段口语化经历；
- 一段简历项目经历；
- 一段自己准备的 STAR；
- 后续版本支持上传简历。

例如：

> 我之前做了一个 AI 客服项目，主要负责 Prompt 优化，后来回答效果提升了一些。

系统此时不直接生成 STAR。

------

# 7. 经历解析模块

## 7.1 Story Parser

LLM 首先将用户输入提取为结构化 Story State。

例如：

```json
{
  "project_type": "AI客服 / Prompt",
  "situation": "",
  "task": "",
  "actions": [
    "优化Prompt"
  ],
  "decisions": [],
  "challenges": [],
  "result": "回答效果提升",
  "metrics": [],
  "ownership": "",
  "reflection": "",
  "missing_fields": [
    "situation",
    "task",
    "action_detail",
    "metrics",
    "ownership"
  ]
}
```

这里的核心不是总结用户的话，而是：

> **确定哪些信息已经存在，哪些信息仍然缺失。**

------

# 8. STAR State 与 Gap Analyzer

产品维护一份持续更新的 Story State。

建议核心变量：

```text
project_type
situation
task
actions
decisions
challenges
metrics
result
ownership
reflection

missing_fields
question_count
information_gain
target_jd
target_competencies
```

其中：

**Story State 决定“现在缺什么”。**

它是整个系统的控制中心。

------

# 9. 动态追问系统

## 9.1 追问优先级

不建议机械执行：

> S → T → A → R。

实际优先级应当是：

### 第一优先级：Action

重点确认：

- 用户具体做了什么；
- 为什么这么做；
- 是否有其他方案；
- 为什么选择当前方案；
- 用户个人贡献是什么。

------

### 第二优先级：Result

重点确认：

- 结果是什么；
- 如何衡量；
- Baseline 是什么；
- 是否有前后对比；
- 是否存在业务影响。

------

### 第三优先级：Challenge / Decision

重点确认：

- 遇到什么困难；
- 出现什么 Bad Case；
- 哪个决策最关键；
- 用户如何进行 trade-off。

------

### 第四优先级：Situation / Task

确保用户可以解释：

- 为什么项目存在；
- 当时需要解决什么问题；
- 用户承担什么任务。

------

### 第五优先级：Reflection

主要用于面试模拟，不作为基础 STAR 生成强制条件。

------

# 10. 第一类 RAG：Domain Knowledge RAG

## 10.1 作用

Domain Knowledge RAG 主要用于：

> **动态追问阶段。**

它回答：

> “针对这个项目和这个岗位，哪些地方值得深挖？”

------

## 10.2 知识库内容

建议 Knowledge Base 分为三类。

### AIPM 能力模型

例如：

- 用户洞察
- 数据驱动
- AI 模型认知
- 产品设计
- Evaluation
- Prompt Engineering
- RAG
- Agent
- Bad Case 分析
- 成本意识
- Ownership
- Collaboration
- Problem Solving

------

### AI 项目知识

按照项目类型建立知识模块，例如：

#### RAG 项目

可能包含：

- 数据来源
- Chunk Strategy
- Embedding
- Retrieval
- Top-K
- Rerank
- Evaluation
- Hallucination
- Latency
- Cost
- Bad Case

#### Prompt 项目

可能包含：

- Prompt 版本管理
- Few-shot
- Evaluation Dataset
- Bad Case
- Prompt Constraints
- Token Cost
- Model Comparison

#### Agent 项目

可能包含：

- Task Planning
- Tool Calling
- Memory
- Error Recovery
- Agent Evaluation
- Multi-step Success Rate

后续可继续增加其他项目类型。

------

### JD 能力要求

用户可以：

- 选择目标岗位；
- 粘贴 JD。

系统抽取：

```json
{
  "target_competencies": [
    "AI产品设计",
    "用户洞察",
    "数据分析",
    "RAG"
  ]
}
```

用于调整追问权重。

------

# 11. 下一题生成逻辑

下一轮问题不是模型自由生成。

可以抽象为：

```text
Next Question =
STAR Gap
+
Project Knowledge
+
JD Priority
+
Previous Answer
+
Question Strategy
```

例如：

当前状态：

```text
STAR Gap：
Result不具体

Project：
RAG

JD Priority：
数据驱动 / Evaluation

用户回答：
“上线以后回答效果好了很多”
```

普通追问可能是：

> “具体提升了多少？”

系统应进一步生成：

> “这里的‘效果好了很多’最好变成可验证指标。你们当时是通过离线测试集、人工评分还是线上用户反馈来衡量回答质量的？有上线前后的对比吗？”

------

# 12. Question Few-shot

Few-shot 不负责提供岗位知识。

它负责：

> **告诉模型，一个高质量追问应该长什么样。**

例如：

### Bad Example

用户：

> 效果挺好的。

AI：

> 结果怎么样？

------

### Good Example

用户：

> 效果挺好的。

AI：

> 这里的“效果好”如果能变成一个可验证指标，面试时会更有说服力。你们当时主要看准确率、用户满意度还是业务转化？有没有上线前后的对比？

Few-shot 主要学习：

- 不机械复述；
- 每次只问一个核心问题；
- 给用户适当启发；
- 不诱导用户编数据；
- 根据上一轮回答继续向下钻。

------

# 13. 追问收敛机制

系统必须避免无限追问。

## 13.1 基础停止条件

满足以下主要条件后允许进入生成：

```text
Situation 存在

Task 存在

Action >= 2 个具体动作 / 决策

Result 存在

个人贡献基本明确
```

Result 中：

如果有真实数据，则保存数据。

如果用户明确表示没有数据，也允许进入下一阶段，但标记：

```text
Result Quantification = Missing
```

------

## 13.2 强制停止规则

满足任意条件：

```text
question_count >= 6
```

或：

```text
连续两轮新增有效信息非常少
```

或：

```text
用户主动选择“先生成看看”
```

则停止继续追问。

------

# 14. Story Health Check

在最终生成之前，对 Story State 进行健康度判断。

### Green

核心信息完整，可以直接生成。

------

### Yellow

存在：

- 数据不足；
- Challenge 不具体；
- Task 模糊；

但仍然可以形成基本 STAR。

系统提醒用户：

> 当前故事可以生成，但 Result 缺少数据，后续模拟面试官可能重点追问这一部分。

------

### Red

存在：

- Action 严重缺失；
- 完全无法区分团队成果和个人贡献。

系统建议继续补充。

但用户仍可以选择：

> “带缺陷生成”。

------

# 15. 第二类 RAG：Domain Expression RAG

这是 STAR 生成阶段使用的 RAG。

它与前面的 Knowledge RAG 职责不同。

### Knowledge RAG

回答：

> **应该挖什么？**

### Expression RAG

回答：

> **用户已经做过的事情，专业上应该叫什么？**

------

# 16. Domain Expression RAG 知识结构

不建议只建立简单的：

> “术语 → 中文解释”

而应该建立：

> **真实行为 → 专业表达**

映射。

例如：

------

### Bad Case Analysis

**含义**

对模型错误输出进行收集、分类、归因和针对性优化。

**适用条件**

用户明确提到：

- 收集错误回答；
- 分析错误原因；
- 对错误进行分类；
- 根据错误类型优化方案。

**禁止使用**

用户只说：

> “模型效果不好，我做了优化。”

则不能自动称为 Bad Case Analysis。

------

### Evaluation Set

**适用条件**

用户明确描述过：

- 构造固定测试问题；
- 建立标准答案；
- 多版本使用同一批样本测试；
- 通过固定样本比较模型效果。

如果只是：

> “我自己随便测了几个问题。”

则不能包装为正式 Evaluation Set。

------

# 17. Expression RAG Evidence Binding

为了避免“专业黑话幻觉”，每个检索到的术语需要绑定用户事实。

例如：

```json
{
  "term": "Bad Case Analysis",
  "matched_fact": "收集模型错误问题并按错误原因分类",
  "confidence": 0.95
}
```

STAR Generator 的规则：

> 只有存在明确 `matched_fact` 的术语才能进入最终回答。

例如用户说：

> 我把错误回答收集起来，按知识缺失、召回错误、生成错误分成三类，然后针对召回错误调整了知识库切片。

Expression RAG 可以返回：

```text
Bad Case Analysis
Error Taxonomy
Chunking Strategy
```

最后写成：

> 对模型输出开展 Bad Case Analysis，将错误归因为知识缺失、检索失败与生成问题，并针对检索类问题调整 RAG 的 Chunking Strategy。

事实没有改变。

只是完成：

> **事实 → 专业概念**

映射。

------

# 18. STAR Generator

经过追问后，生成器输入主要包含：

```text
① 用户确认过的 Story State
② STAR 写作规则
③ STAR Few-shot
④ Expression RAG
⑤ 目标 JD
```

其中优先级为：

```text
用户真实事实
>
STAR结构
>
Few-shot表达方式
>
专业术语
>
JD表达偏好
```

任何知识库信息不得覆盖用户事实。

------

# 19. STAR Few-shot

STAR Few-shot 与 Question Few-shot 分开维护。

Question Few-shot 教模型：

> **怎么问。**

STAR Few-shot 教模型：

> **怎么组织。**

建议高质量案例采用：

```text
Raw Experience
↓
Questioning Process
↓
Verified Facts
↓
Final STAR
```

结构保存。

模型重点学习：

- Action 占主要篇幅；
- 用动作和决策代替空泛形容词；
- Result 尽可能量化；
- 明确个人贡献；
- S/T 简洁；
- 不重复；
- 不拔高用户未提供的信息。

------

# 20. 最终输出结构

最终报告建议包含五部分。

## 20.1 STAR Interview Story

### S — Situation

项目背景及为什么需要解决。

### T — Task

用户负责的目标及责任边界。

### A — Action

重点展示：

- 用户行动；
- 决策；
- Trade-off；
- 难点；
- 解决方式。

### R — Result

展示：

- 量化结果；
- 业务影响；
- 用户反馈；
- 项目结果。

------

# 21. 信息缺口提示

例如：

> ⚠ Result 缺少明确 Baseline。

> ⚠ 当前数据只体现团队整体结果，尚未明确你的个人贡献。

> ⚠ 用户提到“优化模型”，但没有解释具体优化方式。

所有未确认信息使用：

```text
[待补充]
```

而不是自动生成。

------

# 22. STAR Evaluation

MVP 不做 12～20 个复杂评分指标。

首版采用 5 个核心维度。

| 指标         | 权重 |
| ------------ | ---- |
| STAR完整度   | 20%  |
| Action具体度 | 30%  |
| Result量化度 | 20%  |
| Ownership    | 15%  |
| 岗位匹配度   | 15%  |

每项：

```text
0～5 分
```

同时必须返回评分理由。

例如：

```json
{
  "action_score": 4,
  "reason": "描述了两个具体决策，但缺少备选方案比较。"
}
```

而不是只输出一个数字。

------

# 23. 能力图谱

根据最终 Story State 识别这段经历能证明的能力。

例如：

```text
数据驱动        █████
AI产品理解      ████
Ownership       ████
用户洞察        ██
协作能力        ███
```

目的不是评价用户“能力高低”。

而是告诉用户：

> **这段故事最适合证明哪些能力。**

------

# 24. 面试官预测追问

根据最终 STAR 中仍然存在的：

- 薄弱信息；
- 争议点；
- 关键决策；
- 数据；
- 技术选择；

生成 3 个最可能的问题。

例如：

1. 为什么选择 RAG，而不是 Fine-tuning？
2. 你说准确率提升了 11%，这个指标是怎么计算的？
3. 这个项目里如果去掉你个人的工作，最终结果会有什么不同？

MVP 首版不需要真的实现多个独立 Agent。

------

# 25. 多面试官模式

首版将面试官风格作为 Prompt 参数，而不是多个 Agent。

例如：

```json
{
  "interviewer_style": "pressure"
}
```

支持：

### Pressure

重点攻击：

- 数据真实性；
- 因果关系；
- 个人贡献；
- 技术选择。

### Friendly

重点帮助用户：

- 补充背景；
- 梳理表达；
- 深入反思。

### Data-driven

重点追问：

- 指标；
- Baseline；
- Evaluation；
- A/B Test；
- ROI。

该能力作为 V1.5 / V2 功能。

------

# 26. Dify Chatflow 设计

推荐主流程：

```text
START
  ↓
用户经历
  ↓
Story Parser
  ↓
更新 Story State
  ↓
Gap Analyzer
  ↓
IF / ELSE
  ↓
信息是否足够？
```

### NO

```text
Knowledge Retrieval
AIPM / JD / Project Knowledge
        ↓
Question Planner
        ↓
Question Generator
        ↓
Answer
        ↓
用户下一轮回答
        ↓
Information Merger
        ↓
更新 Story State
        ↓
Gap Analyzer
```

形成循环。

### YES

```text
Expression Retrieval
        ↓
STAR Generator
        ↓
Truth Checker
        ↓
STAR Evaluator
        ↓
Interview Question Generator
        ↓
Final Report
```

------

# 27. Dify 节点拆分建议

MVP 建议保持在约 8～10 个核心逻辑节点。

### Node 1 — User Input

接收：

```text
experience
target_role
target_jd
```

------

### Node 2 — Story Parser

职责：

> 从用户输入中提取当前已有事实。

输出：

```text
Story State
```

------

### Node 3 — Gap Analyzer

职责：

> 判断缺失信息和下一步优先级。

输出：

```json
{
  "enough": false,
  "highest_priority_gap": "result_metric",
  "reason": "结果存在但不可验证"
}
```

------

### Node 4 — Knowledge Retrieval

查询：

> 当前项目相关的 AIPM 考察点。

------

### Node 5 — Question Generator

综合：

```text
Gap
+
RAG
+
Few-shot
+
Previous Answer
```

只生成一个问题。

------

### Node 6 — Information Merger

将用户回答更新到：

> Story State。

原则：

> 只增加用户明确提供的信息。

------

### Node 7 — Expression Retrieval

根据最终 Action 检索：

> 可以准确描述这些行为的专业概念。

------

### Node 8 — STAR Generator

输出结构化 STAR。

------

### Node 9 — Evaluator

完成：

- STAR评分；
- 信息缺口；
- 岗位能力匹配。

------

### Node 10 — Interview Question Generator

生成最终 3 个预测追问。

------

# 28. AI 系统职责划分

整个系统可以用四层架构解释。

## Layer 1 — Understanding Layer

负责：

> 用户到底做了什么？

包括：

- Story Parsing
- Slot Filling
- Information Extraction

------

## Layer 2 — Reasoning Layer

负责：

> 下一步该问什么？

包括：

- Gap Detection
- Question Policy
- State Management
- Convergence Control

------

## Layer 3 — Domain Layer

负责：

> 这个 AIPM 项目专业上应该关注什么？

包括：

- Knowledge RAG
- JD
- AIPM Ability Model
- AI Project Knowledge
- Expression RAG

------

## Layer 4 — Output & Evaluation Layer

负责：

> 怎么形成最终面试材料？

包括：

- STAR Generator
- Truth Checker
- STAR Evaluation
- Competency Mapping
- Mock Questions

------

# 29. RAG 与 Few-shot 的职责边界

这是系统非常重要的设计原则。

## STAR State

回答：

> **现在缺什么？**

------

## Knowledge RAG

回答：

> **这个岗位 / 项目值得挖什么？**

------

## Question Few-shot

回答：

> **一个好面试官应该怎么问？**

------

## Expression RAG

回答：

> **用户真实做过的事情专业上叫什么？**

------

## STAR Few-shot

回答：

> **一个高质量 STAR 应该怎么组织？**

------

因此可以总结为：

> **用户回答提供事实。**

> **STAR State 提供状态。**

> **RAG 提供领域知识。**

> **Few-shot 提供行为范式。**

> **LLM 负责推理与生成。**

------

# 30. 为什么 MVP 不采用真正的双 Agent

早期方案考虑：

- Agent A：负责深度追问；
- Agent B：负责岗位能力审核。

MVP 阶段不采用真正的 Multi-Agent 调度。

原因：

- 增加 Agent 间通信复杂度；
- 增加 Token 成本；
- 增加不可控推理；
- Debug 难度更高；
- 当前业务逻辑可以通过明确职责节点完成。

因此将 Agent B 的职责拆解为：

```text
Knowledge RAG
+
Gap Analyzer
+
Evaluator
```

把整体决策权集中在：

> Question Planner / State Machine。

未来只有当不同 Agent 之间需要：

> 独立目标 + 独立状态 + 协商决策

时，再引入 Multi-Agent。

------

# 31. 幻觉与真实性治理

## 31.1 禁止事实扩写

Prompt明确要求：

> 不允许增加用户没有确认的事实。

------

## 31.2 数据缺失

例如：

> 转化率提升 [待补充]

而不是：

> 转化率提升 20%。

------

## 31.3 专业术语 Evidence Binding

专业术语必须绑定：

> 用户真实 Action。

------

## 31.4 Truth Checker

生成 STAR 后，再由独立检查节点比较：

```text
Final STAR
VS
Verified Story State
```

检查是否出现：

- 新数字；
- 新动作；
- 新工具；
- 新实验；
- 新结论。

如果存在：

> 删除或标红。

------

# 32. 用户隐私

用户可能上传：

- 简历；
- 公司经历；
- 项目数据；
- 学校信息；
- 联系方式。

因此产品需要明确：

### MVP

- 提醒用户不要输入不必要的个人敏感信息；
- 不把用户姓名、手机号、邮箱作为 RAG 内容；
- 用户可以删除历史故事。

### 后续版本

考虑：

- PII 脱敏；
- 姓名 / 手机号 / 邮箱 Mask；
- 企业数据过滤；
- 数据保存时间说明。

OCR 不作为 MVP 核心能力。

------

# 33. MVP 范围

V1 只验证一个核心价值：

> **动态追问是否真的比直接让 ChatGPT 润色更容易得到高质量项目故事？**

MVP 功能：

```text
输入经历
↓
自动解析STAR
↓
动态追问3～5轮
↓
生成STAR
↓
专业表达增强
↓
真实性检测
↓
5维评分
↓
3个预测追问
```

------

# 34. MVP 暂不实现

首版删除：

- OCR；
- 语音识别；
- 真正 Multi-Agent；
- 自动 Fine-tuning；
- 多行业插件；
- 复杂用户画像；
- 自动学习个人偏好；
- 12+ 维评价体系；
- 多模型复杂动态路由；
- 完整压力面试 Agent；
- 商业化付费系统。

这些全部进入 Roadmap。

------

# 35. 核心产品指标

## 35.1 核心结果指标

**STAR Quality Improvement**

用户使用前后：

> STAR 综合质量评分提升程度。

------

## 35.2 过程指标

### Story Completion Rate

进入系统后成功完成 STAR 的用户比例。

### Average Question Rounds

平均有效追问轮次。

理想 MVP：

```text
3～5轮
```

不是越高越好。

### Information Gain

每轮回答增加多少新的有效 Story Slot。

### User Edit Rate

生成后用户需要大幅修改的比例。

越低代表：

> 系统对真实事实和表达理解越准确。

------

# 36. Evaluation Dataset

建议建立一套小型测试集。

第一阶段：

```text
20～50 条经历
```

每条包含：

```text
Raw Experience

Expected Missing Fields

Recommended Question Direction

Verified Facts

Good STAR Output

Bad Cases
```

------

# 37. AI-as-a-Judge

Evaluator 可以从五个维度进行测试：

```text
STAR完整度
Action具体度
Result量化
Ownership
岗位匹配
```

同时单独建立：

> **Hallucination Rate**

检测：

> 最终答案中有多少信息无法从用户回答中找到依据。

这是本产品非常重要的质量指标。

------

# 38. Bad Case 驱动迭代

每次 Prompt 或 Workflow 调整后，都保存 Bad Case。

例如：

### Bad Case 1

AI重复问用户已经回答的问题。

优化：

> Gap Analyzer 增加 answered_fields。

------

### Bad Case 2

AI连续追问技术细节，忽略个人贡献。

优化：

> Question Policy 提高 Ownership 权重。

------

### Bad Case 3

生成阶段擅自增加“做了 A/B Test”。

优化：

> Expression RAG 增加 Evidence Binding + Truth Checker。

------

### Bad Case 4

AI为了补 Result 一直逼用户提供不存在的数据。

优化：

允许用户确认：

> “没有量化数据。”

系统记录为：

```text
Metric unavailable
```

不继续强制追问。

------

# 39. A/B Test

验证核心假设：

> “动态追问比直接生成更有效。”

### Control Group

直接使用通用 LLM：

> 帮我把这段项目经历改成 STAR。

### Test Group

使用本产品：

> 解析 → 追问 → 生成。

比较：

- STAR完整度；
- Action具体度；
- Result可验证性；
- 面试官人工评分；
- 用户满意度；
- AI幻觉率。

------

# 40. 产品迭代路线

## V1 — 核心故事挖掘

完成：

```text
STAR Parsing
Gap Detection
Dynamic Questioning
STAR Generation
Evaluation
```

验证：

> AI 是否真的可以帮助用户挖出原本没讲出来的有效信息。

------

## V1.5 — AIPM 专业化

增加：

```text
AIPM Knowledge RAG
Expression RAG
JD Matching
Competency Map
```

验证：

> 垂直知识是否显著优于通用 AI。

------

## V2 — Mock Interview

增加：

- Pressure Mode
- Data-driven Interviewer
- Friendly Interviewer
- 面试后复盘。

让系统从：

> “故事生成工具”

升级为：

> “面试训练工具”。

------

## V3 — 可配置垂直引擎

将底层架构抽象成：

```text
STAR Engine
+
Domain Knowledge Plugin
+
Expression Plugin
```

未来可以扩展：

- 产品经理；
- 开发；
- 数据分析；
- 运营；
- 咨询等岗位。

AIPM 是第一个用于验证 PMF 的垂直领域，而不是系统永久的能力边界。

------

# 41. 产品核心差异化

与通用 AI 简历工具相比，本产品不是：

> **Text → Rewrite**

而是：

```text
Experience
↓
Understand
↓
Detect Gaps
↓
Ask
↓
Verify
↓
Structure
↓
Professionalize
↓
Evaluate
```

核心竞争力不在于：

> “模型更强。”

而在于：

> **把专业行为面试方法、AIPM领域知识和真实性约束，编排成一个可控的 AI Workflow。**

------

# 42. 一句话项目介绍

面试时可以将整个项目浓缩为：

> **我设计了一套面向 AI 产品经理求职者的 STAR 故事挖掘系统。与传统 AI 直接润色不同，我先将用户经历结构化成可持续更新的 Story State，通过缺失信息检测决定当前“缺什么”，再利用岗位和 AI 项目知识 RAG 判断“应该挖什么”，通过 Few-shot 控制“应该怎么问”；当信息达到收敛条件后，再利用专业表达 RAG 将用户真实动作映射成准确的行业语言，最后生成 STAR 并进行真实性和质量评估。整个系统的核心原则是 AI 只负责挖掘和提炼真实价值，而不替用户创造经历。**

------

# 43. 最核心的系统设计表达

如果只记住一套逻辑，可以记住：

```text
STAR State
决定：
现在缺什么？
        ↓
Knowledge RAG
决定：
这个项目值得挖什么？
        ↓
Question Few-shot
决定：
应该怎么问？
        ↓
用户提供真实事实
        ↓
Expression RAG
决定：
这些事实专业上叫什么？
        ↓
STAR Few-shot
决定：
最终应该怎么组织？
        ↓
Truth Checker
保证：
没有增加用户没说过的事实
```

最终产品的本质不是：

> **AI 帮用户编一个优秀故事。**

而是：

> **AI 用专业追问帮助用户找回真实细节，再把真实细节组织成一个经得起面试官追问的故事。**