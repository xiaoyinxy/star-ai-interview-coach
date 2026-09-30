# AI产品经理专业表达映射库（RAG上传版）

> 用途：将用户口头化项目描述映射为准确、可验证的 AI 产品经理专业表达。
> 使用原则：本文件只提供“术语知识与映射依据”；全局真实性和防过度包装规则应放在 Expression Generator 的 System Prompt 中。

<<<PARENT_SPLIT>>>

## P01 分类任务指标：Recall、Precision、F1

### 概念范围

Recall（召回率）：在真实正样本中，有多少被系统识别出来。

Precision（精确率）：在系统判断为正样本的结果中，有多少是真正的正样本。Precision 不应翻译成 Accuracy“准确率”。

F1-score：Precision 与 Recall 的调和平均，用于希望两者相对平衡的分类任务。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们更怕漏掉风险用户。”
- “宁可多拦一点，也不能漏掉。”
- “最开始找得很多，但误报也很多。”
- “后来我们既想少漏掉，也不想误伤正常用户。”
- “我们最后综合看了查全和查准两个指标。”

可映射：

“减少漏掉真实正样本” → Recall。

“减少误报、误伤、错误命中” → Precision。

“同时平衡 Recall 与 Precision” → F1-score。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们主要怕漏掉风险用户，所以先让模型尽量多找出来。”

专业表达：
“在风险识别场景中，我优先关注 Recall，先提升对真实风险样本的覆盖能力，再进一步控制误报。”

用户原话：
“找出来的人太多了，很多其实不是目标用户，所以我们后来减少误判。”

专业表达：
“后续重点优化 Precision，降低误报比例，避免错误命中对正常用户体验造成影响。”

禁止包装：

- 用户没有真实分类任务时，不要硬套 Recall / Precision。
- 用户没提供 F1，不要自行计算或声称 F1 提升。
- 不要把普通“准确率提高”自动翻译成 Precision。

<<<PARENT_SPLIT>>>

## P02 排序与推荐效果：AUC、NDCG、CTR/CVR

### 概念范围

AUC 常用于衡量二分类模型对正负样本的整体区分或排序能力。

NDCG 常用于搜索、推荐等排序任务，更关注相关结果是否排在列表前部。

CTR（点击率）与 CVR（转化率）属于线上用户行为指标，用于观察推荐、广告、搜索等策略是否产生真实业务行为变化。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们不是只看有没有召回，还看好的结果是不是排在前面。”
- “用户通常只看前几条，所以首屏结果特别重要。”
- “算法分数更好了，但线上点击没有变化。”
- “我们比较的是用户会不会点、会不会继续转化。”
- “模型主要负责对候选结果做排序。”

可映射：

“相关结果排得更靠前” → NDCG / Ranking Quality。

“正负样本整体排序能力” → AUC。

“线上点击变化” → CTR。

“点击后进一步完成目标行为” → CVR。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们发现用户基本只看前几条，所以重点优化最前面的搜索结果。”

专业表达：
“相比只关注整体召回，我更关注 Ranking Quality，并通过 NDCG 类指标评估高相关结果是否能够稳定出现在前排。”

用户原话：
“离线指标更好了，但用户点击没什么变化。”

专业表达：
“离线排序指标改善后，我继续用 CTR 等线上行为指标验证算法收益是否真正转化为用户价值。”

禁止包装：

- 没有排序任务，不使用 NDCG。
- 没有真实 A/B 或线上数据，不声称 CTR/CVR 因该策略显著提升。
- AUC 不是所有推荐项目的通用成功指标。

<<<PARENT_SPLIT>>>

## P03 Ground Truth、数据标注与数据清洗

### 概念范围

Ground Truth（金标/真值）是用于判断模型输出是否正确的参考标准。

Data Annotation（数据标注）是给原始样本补充标签、标准答案、评分或类别。

Data Cleaning（数据清洗）是处理重复、错误、缺失、污染或格式不一致的数据。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们先人工整理了一套标准答案。”
- “我和业务专家一起判断每条答案应该是什么。”
- “原始数据里重复和脏数据很多，我先清了一遍。”
- “不同人对‘正确’理解不一样，所以我们统一了标注规则。”
- “测试之前先做了一个人工金标集。”

可映射：

“标准答案/专家确认结果” → Ground Truth。

“人工贴标签/打分/写标准答案” → Data Annotation。

“去重、处理缺失、纠错、统一格式” → Data Cleaning。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们让两个业务同学先把问题的正确答案整理出来。”

专业表达：
“在正式评测前，我推动业务专家构建 Ground Truth，并统一标注口径，作为后续模型版本比较的金标基准。”

用户原话：
“数据里面很多重复记录和错误格式，我先处理掉。”

专业表达：
“我先进行了数据清洗，处理重复样本、异常格式和无效数据，降低脏数据对后续训练或评测的干扰。”

禁止包装：

- 没有明确参考答案，不要称为 Ground Truth。
- 只人工看过案例，不等于做了正式 Data Annotation。
- 未建立标注规范时，不要写“建立标准化标注体系”。

<<<PARENT_SPLIT>>>

## P04 Evaluation Dataset、Baseline 与回归集

### 概念范围

Evaluation Dataset：用于稳定评估模型、Prompt、RAG 或 Agent 版本表现的固定测试样本集合。

Baseline：作为比较基准的旧版本、默认方案或初始指标。

Regression Set：由历史关键 Case、已修复 Bad Case、高风险场景组成，用于检查新版本是否让旧能力退化。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们固定了一批问题，每次改 Prompt 都重新跑。”
- “每次升级都和旧版本比。”
- “之前修过的问题后来又出现了，所以我们把这些问题保存下来反复测。”
- “不是随机试几个问题，而是有一套固定测试题。”
- “上线前要保证原来能答的问题不能变差。”

可映射：

“固定测试样本” → Evaluation Dataset。

“旧版本作为对照” → Baseline。

“历史问题持续回测” → Regression Set / Regression Evaluation。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们把常见问题固定下来，每次改 Prompt 都跑一遍。”

专业表达：
“我建立了固定 Evaluation Dataset，并以当前线上版本作为 Baseline，对每轮 Prompt 调整进行可重复的离线评测。”

用户原话：
“以前修好的问题后来又出错，所以我们把历史错例都保留了。”

专业表达：
“我将已修复的关键 Bad Case 沉淀为 Regression Set，避免新版本优化局部能力时引入历史能力退化。”

禁止包装：

- 随机人工试 3～5 个问题不应称为 Evaluation Dataset。
- 没有历史版本比较，不要声称“建立 Baseline 评估框架”。
- 只有一次复测，不等于建立 Regression 机制。

<<<PARENT_SPLIT>>>

## P05 A/B Testing、Ablation Study 与 Backtesting

### 概念范围

A/B Testing：通过实验组和对照组比较真实用户或流量结果，验证新策略效果。

Ablation Study（消融实验）：移除或替换系统中的某个组件，观察整体效果变化，以判断该组件的实际贡献。

Backtesting（历史回测）：使用历史数据验证策略、预测或规则在过去样本上的表现。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们让一部分用户用新版本，另一部分继续用旧版本。”
- “为了验证 Rerank 到底有没有用，我们把它去掉重新测。”
- “我想知道到底是 Prompt 还是 RAG 起作用，所以分别关掉测试。”
- “我们拿历史订单数据重新跑预测，看能不能还原真实结果。”
- “不是一起改完看结果，而是单独验证每个模块。”

可映射：

“实验组/对照组真实流量” → A/B Testing。

“移除组件看贡献” → Ablation Study。

“用历史数据验证预测策略” → Backtesting。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们拿 20% 流量上新版本，剩下继续用旧版本，然后比较转化。”

专业表达：
“我通过 A/B Test 将新旧方案置于可比流量环境中，对核心转化指标进行线上验证。”

用户原话：
“我把 Rerank 去掉后重新测，效果明显差了。”

专业表达：
“我通过 Ablation Study 单独移除 Rerank 模块，验证该模块对整体检索质量的边际贡献。”

禁止包装：

- 没有随机或合理对照，不要自动称为 A/B Test。
- 没有控制变量，不要声称某个模块“因果提升”。
- 历史数据验证适合预测或策略回测，不要把所有离线评测都叫 Backtesting。
- 用户没提供统计显著性，不得补写“达到统计显著”。

<<<PARENT_SPLIT>>>

## P06 埋点、转化漏斗与指标体系

### 概念范围

Event Tracking（埋点）：记录关键用户行为事件，为产品分析提供数据。

Conversion Funnel（转化漏斗）：观察用户从进入到完成目标任务过程中，各关键步骤的转化和流失。

North Star Metric（北极星指标）：最能代表产品核心用户价值的关键指标。

Guardrail Metric（护栏指标）：用于防止局部优化伤害其他重要目标的约束指标。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们记录用户在哪一步退出。”
- “从进入功能到最后提交，一共拆了四个步骤。”
- “核心看完成任务的人数，但同时也看投诉不能上涨。”
- “之前只有总使用量，后来把关键行为都打了点。”
- “我们想知道优化是不是只让点击变高，但完成率反而下降。”

可映射：

“记录用户行为事件” → Event Tracking。

“分步骤看转化与流失” → Conversion Funnel。

“代表核心价值的主指标” → North Star Metric。

“防止副作用的约束指标” → Guardrail Metric。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们把用户从打开功能到最后生成成功的每一步都记录下来。”

专业表达：
“我重新梳理关键行为埋点，并搭建 Conversion Funnel，定位用户从进入功能到任务完成之间的主要流失节点。”

用户原话：
“虽然点击率变高了，但我们还看投诉有没有增加。”

专业表达：
“除了核心增长指标，我同时设置 Guardrail Metric，防止局部优化以牺牲用户体验为代价。”

禁止包装：

- 只有几个埋点，不等于“建立完整数据体系”。
- 没有真正核心价值指标时，不要随意称为 North Star Metric。
- Guardrail Metric 必须是明确被监控的约束指标。

<<<PARENT_SPLIT>>>

## P07 Root Cause Analysis、Bad Case Analysis 与 Error Taxonomy

### 概念范围

Root Cause Analysis（根因分析）：寻找表面问题背后的真实原因。

Bad Case Analysis：系统收集 AI 失败样本并分析失败模式。

Error Taxonomy：把失败样本按原因或类型进行分类，形成结构化错误体系。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我把回答错的例子都收集起来。”
- “后来发现错误不是一种，有的是没检索到，有的是检索对了但模型答错。”
- “我们按错误原因分成了几类。”
- “不是看到效果差就直接换模型，而是先判断问题出在哪。”
- “每周复盘失败样本，找最高频的问题。”

可映射：

“收集失败样本” → Bad Case Analysis。

“按错误原因分类” → Error Taxonomy。

“追到真正原因” → Root Cause Analysis。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们把错的回答收集起来，按没检索到、检索错、生成错分了三类，然后分别优化。”

专业表达：
“我建立 Bad Case Analysis 机制，并通过 Error Taxonomy 将失败样本拆分为 Retrieval Failure、Retrieval Mismatch 和 Generation Error，基于高频错误类型进行定向优化。”

用户原话：
“最开始觉得是模型问题，后来发现其实是知识没召回。”

专业表达：
“通过 Root Cause Analysis，我将问题从‘模型效果差’进一步定位为 Retrieval 层的召回失败，避免直接通过换模型解决错误问题。”

禁止包装：

- 只看过几个错例，不要写“建立 Bad Case 体系”。
- 用户没真的分类，不要补造 Error Taxonomy。
- 不要把所有错误都称为“幻觉”。

<<<PARENT_SPLIT>>>

## P08 Prompt Engineering、System Prompt 与 Few-shot

### 概念范围

Prompt Engineering：通过设计指令、上下文、约束和示例，引导模型稳定完成任务。

System Prompt：用于定义模型角色、任务边界、行为规则和全局约束。

Few-shot：在上下文中提供少量示例，帮助模型理解期望任务模式、风格或输出结构。

Zero-shot：不提供示例，仅依靠指令让模型完成任务。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我把提示词拆成角色、任务、限制和输出格式。”
- “模型总是不按格式输出，所以我加了示例。”
- “我给了几个好的 STAR 样例，让它模仿结构。”
- “不同 Agent 我分别写了不同的系统规则。”
- “第一版只靠指令，没有给任何示例。”

可映射：

“结构化优化提示词” → Prompt Engineering。

“全局角色与规则” → System Prompt。

“提供少量示例” → Few-shot。

“纯指令无示例” → Zero-shot。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我不是一句话告诉模型怎么做，而是把角色、任务、边界和输出格式分开写。”

专业表达：
“我对 Prompt 进行了结构化设计，将角色定义、任务指令、行为约束和输出 Schema 分层组织，提高模型指令遵循的一致性。”

用户原话：
“模型老是写得不像面试回答，所以我给了三个好例子。”

专业表达：
“我引入 Few-shot 示例，让模型学习高质量 STAR 表达的结构与风格，而不是直接复制案例内容。”

禁止包装：

- 只改了一两句 Prompt，不要夸大为“搭建 Prompt Engineering Framework”。
- Few-shot 是示例驱动，不是知识库检索。
- 示例没有实际作用验证时，不声称“显著提升”。

<<<PARENT_SPLIT>>>

## P09 Temperature、分步推理提示与 Self-check

### 概念范围

Temperature：控制模型采样随机性的参数之一，通常较低时输出更稳定，较高时随机性更强。

分步推理提示：通过任务拆解、步骤规划或中间检查，让模型更稳定处理复杂任务。

Self-check / Critique：生成结果后再依据规则进行自检、校验或二次审阅。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “为了保证格式稳定，我们把随机性调低了。”
- “创意文案那部分希望更多样，所以调高一点。”
- “我让模型先判断缺什么，再决定问什么。”
- “生成后再让模型检查有没有编造数字。”
- “我们不是一次让模型全部完成，而是拆成几步。”

可映射：

“调随机性” → Temperature Tuning。

“复杂任务拆步骤” → Step-wise Reasoning / Task Decomposition。

“生成后再检查” → Self-check / Critique / Verification Step。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我先让模型判断 STAR 缺什么，再决定下一题，而不是直接生成问题。”

专业表达：
“我将复杂任务拆成 ‘Gap Detection → Question Planning → Question Generation’ 的分步流程，降低单次 Prompt 同时承担多目标任务带来的不稳定性。”

用户原话：
“生成故事后再检查有没有凭空出现数字。”

专业表达：
“我增加 Verification Step，对最终 STAR 中的数字、动作和结果进行事实一致性检查，降低无依据补全。”

禁止包装：

- 不要把所有“分步骤”都写成 CoT。
- 不建议把“展示完整中间推理”作为产品卖点。
- Self-check 不能被描述成绝对消除幻觉。

<<<PARENT_SPLIT>>>

## P10 Structured Outputs、Schema 与 Slot Filling

### 概念范围

Structured Outputs：通过固定 Schema 约束模型输出结构，便于后续程序读取和工作流处理。

Schema：定义字段名称、类型和结构。

Slot Filling：从用户输入中抽取并持续补全预定义字段，例如 STAR 中的 Situation、Task、Action、Result、Metrics、Ownership。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我让模型固定返回 JSON。”
- “每轮都抽取 S、T、A、R 哪些字段已经有了。”
- “后面节点需要读取模型结果，所以输出必须结构化。”
- “我们不靠自然语言判断状态，而是存字段。”
- “用户回答后会更新缺失项。”

可映射：

“固定 JSON/字段结构” → Structured Outputs / Schema-constrained Output。

“持续抽取预定义字段” → Slot Filling。

“结构化保存对话状态” → Structured State Management。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“每次用户回答完，我就让模型提取 STAR 四个部分，并标记哪些还缺。”

专业表达：
“我通过 Slot Filling 将用户自由文本持续映射到 STAR Schema，并维护 missing_fields，使后续追问由结构化状态而不是完整对话文本直接驱动。”

用户原话：
“后面节点要读取，所以我要求模型固定返回 JSON。”

专业表达：
“我采用 Schema-constrained Structured Output，保证模型结果可以被后续 Workflow 稳定解析和路由。”

禁止包装：

- 仅在 Prompt 里说“请输出 JSON”但没有稳定 Schema 时，不要夸大成严格 Structured Outputs。
- Slot Filling 必须有预定义槽位。
- 不要因为用了 JSON 就声称“实现状态机”。

<<<PARENT_SPLIT>>>

## P11 Context Window、Tokenization 与上下文管理

### 概念范围

Context Window：模型单次推理能够接收的上下文容量。

Tokenization：文本被拆成模型处理单元的过程。

Context Management：决定哪些历史对话、RAG 内容、用户信息和状态应该进入当前模型上下文。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “对话越来越长，模型开始忘前面的重点。”
- “我们不能把所有历史消息每次都塞进去。”
- “长文档超出上下文，所以先分段或摘要。”
- “Prompt 太长导致费用和延迟都上升。”
- “我只保留当前问题相关的信息。”

可映射：

“上下文容量限制” → Context Window。

“文本处理单位/调用量” → Tokenization / Token Usage。

“筛选、摘要、保留关键上下文” → Context Management。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“多轮对话变长后，我把历史回答压缩成结构化状态，而不是每次都传完整对话。”

专业表达：
“为控制 Context Window 占用，我将长对话中的关键事实压缩为结构化状态，只向模型注入当前任务所需上下文。”

禁止包装：

- Context Window 不等于真正长期记忆。
- Tokenization 不应被包装成用户价值本身。
- 没有实际做上下文裁剪，不要写“Context Optimization”。

<<<PARENT_SPLIT>>>

## P12 Long-term Memory 与会话状态

### 概念范围

Long-term Memory：通常指应用层将用户偏好、历史事实或长期状态持久化，并在后续会话按需重新提供给模型。

Conversation State：当前任务或对话的结构化状态。

二者都不是模型“天然永久记住用户”。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “用户下次回来还能继续上次项目。”
- “我们把用户偏好存下来，下次再注入模型。”
- “当前轮的问题数、缺失字段会保存。”
- “模型本身不记得，所以我们把状态放数据库。”
- “同一个项目可以跨会话继续。”

可映射：

“跨会话保存并重新取回” → Long-term Memory / Persistent Memory。

“当前任务字段” → Conversation State / State Management。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“用户下次回来还能继续上次没写完的 STAR，我们会把项目状态存下来。”

专业表达：
“我通过持久化 Story State 实现跨会话的 Long-term Memory，使用户能够从上一次的项目进度继续，而不是依赖模型上下文本身记忆。”

禁止包装：

- 只保留当前 Chat History 不等于 Long-term Memory。
- 不要说“模型永久记住用户”，除非应用层确实持久化并检索。

<<<PARENT_SPLIT>>>

## P13 RAG 基础链路：Chunking、Embedding、Vector Retrieval

### 概念范围

RAG（Retrieval-Augmented Generation）：先从外部知识源检索相关内容，再把结果作为上下文提供给生成模型。

Chunking：把文档切成可索引、可检索的知识单元。

Embedding：把文本映射成向量表示，用于语义相似检索。

Vector Database / Vector Store：保存向量并支持相似度查询的存储与检索组件。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我把能力模型文档放到知识库里。”
- “Dify 会把文档切块后做向量化。”
- “用户说到 RAG 项目时，再检索相关知识。”
- “我们不是把整份文档都塞给模型，而是先找相关片段。”
- “不同块会转成向量再做语义匹配。”

可映射：

“检索外部知识后生成” → RAG。

“把文档拆成知识单元” → Chunking。

“文本向量化” → Embedding。

“向量检索存储” → Vector Store / Vector Database。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我把 AI 产品经理能力模型放到 Dify 知识库，用户讲项目时先找相关内容再问。”

专业表达：
“我通过 RAG 将 AIPM 能力模型作为外部知识源，先基于用户项目描述进行语义检索，再将相关知识片段注入 Question Generator，增强追问的岗位专业度。”

禁止包装：

- 仅上传 PDF 不等于“设计 RAG 架构”。
- 没有实际 Embedding/检索，不要写“向量检索”。
- RAG 主要补充外部知识，不应被描述为自动解决所有幻觉。

<<<PARENT_SPLIT>>>

## P14 Semantic Similarity、Hybrid Retrieval 与 Metadata Filtering

### 概念范围

Semantic Similarity：根据语义而非纯字面相同度匹配文本。

Hybrid Retrieval：组合语义检索与关键词/全文检索，兼顾同义表达和精确关键词。

Metadata Filtering：在检索前或检索过程中，通过 role、competency、document type 等字段缩小候选知识范围。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “用户说‘错例分析’，知识库里写的是 Bad Case，也希望能找到。”
- “有些专有名词必须精准匹配，所以不能只靠向量。”
- “先限制只查用户洞察文档，再做语义检索。”
- “我们给知识文档打了 competency 标签。”
- “同义表达很多，希望意思接近就能召回。”

可映射：

“意思相近即可匹配” → Semantic Similarity。

“向量 + 关键词” → Hybrid Retrieval。

“先按标签限制范围” → Metadata Filtering。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“有的查询是口语化表达，有的是具体技术名词，所以我们既看语义也看关键词。”

专业表达：
“针对自然语言 Query 与专业术语并存的情况，我采用 Hybrid Retrieval，在 Semantic Retrieval 的基础上保留关键词匹配能力，降低纯向量检索对专有名词的漏召回。”

用户原话：
“用户问数据驱动时只查数据驱动相关文档。”

专业表达：
“通过 competency 等 Metadata Filtering 缩小候选文档范围，降低跨能力知识相互干扰。”

禁止包装：

- 没真正组合两种检索方式，不要写 Hybrid Retrieval。
- Metadata 只是存了标签但没参与检索，不要写“通过 Metadata Filtering 优化召回”。

<<<PARENT_SPLIT>>>

## P15 Query Rewriting、Top-K 与 Reranking

### 概念范围

Query Rewriting：将用户原始查询改写为更适合检索的表达。

Top-K：第一阶段检索返回的候选结果数量。

Reranking：对初步召回的候选内容做二次相关性排序，从中选出更适合进入模型 Context 的知识。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “用户说得太口语，直接检索命中不好，所以先改写问题。”
- “先召回多一点，再从里面选最相关的。”
- “向量搜索找到的前几条有些不够准，所以加了重排。”
- “不是越多知识越好，最后只放最相关的几块。”
- “用户问题里有很多上下文，我先提炼成检索 Query。”

可映射：

“把口语问题变成检索式” → Query Rewriting。

“第一阶段返回若干候选” → Top-K Retrieval。

“候选结果二次排序” → Reranking。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“用户说一大段经历，我先让模型抽取核心能力缺口，再拿这个去查知识库。”

专业表达：
“我先进行 Query Rewriting，将冗长项目描述压缩为与目标能力相关的检索 Query，再进入知识检索，提升召回语义的聚焦度。”

用户原话：
“先找五条，再重新选最相关的三条。”

专业表达：
“我采用 ‘Candidate Retrieval + Reranking’ 两阶段检索，在扩大初始召回覆盖的同时控制最终 Context 噪声。”

禁止包装：

- 仅修改用户问题文本不一定构成系统化 Query Rewriting。
- 没使用二阶段排序，不要写 Reranking。
- Top-K 数值必须来自真实配置，不能补造。

<<<PARENT_SPLIT>>>

## P16 RAG 质量：Recall@K、Hit Rate、Groundedness 与 Faithfulness

### 概念范围

Recall@K / Hit Rate@K：用于判断相关知识是否成功进入前 K 个候选结果。

Groundedness / Faithfulness：判断最终生成内容是否有检索证据支持，是否忠实于提供的上下文。

Citation Accuracy：判断引用内容是否真正支持对应回答。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “知识库明明有，但经常搜不到。”
- “能搜到文档，但最终回答会自己多说一些。”
- “引用了来源，但来源其实不支持那句话。”
- “我们单独看检索有没有命中，再看生成有没有基于命中的内容回答。”
- “我把召回和生成分开评估。”

可映射：

“正确知识是否进入候选” → Retrieval Recall / Hit Rate。

“回答是否基于证据” → Groundedness / Faithfulness。

“引用与陈述是否对应” → Citation Accuracy。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们把错误拆成‘没搜到’和‘搜到了但答错’两类。”

专业表达：
“我将 RAG Evaluation 拆分为 Retrieval Quality 与 Generation Quality：前者关注正确知识是否被召回，后者关注回答的 Groundedness 与 Faithfulness，避免把所有错误都归因于模型。”

禁止包装：

- 没有明确 K 值和评测方式，不要自行写 Recall@5、Hit Rate@10。
- Groundedness 不等于“事实绝对正确”，而是回答是否有提供上下文支持。
- 不要把 Retrieval 指标和最终用户价值混为一谈。

<<<PARENT_SPLIT>>>

## P17 Fine-tuning、SFT 与 LoRA

### 概念范围

Fine-tuning：基于已有模型，使用特定训练数据进一步调整模型行为。

SFT（Supervised Fine-Tuning）：通过输入-输出示例进行有监督微调，使模型更稳定学习特定任务行为。

LoRA：一种参数高效微调方法，通过更新较少参数降低训练资源需求。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们不是只改 Prompt，而是拿标注数据继续训练模型。”
- “准备了很多指令-回答对，让模型学固定风格。”
- “没有全量训练参数，只训练少量适配参数。”
- “模型行为通过训练数据做了定制。”
- “这是模型训练层面的调整，不是 RAG 注入知识。”

可映射：

“基于特定数据继续训练” → Fine-tuning。

“指令-回答监督训练” → SFT。

“参数高效微调” → LoRA。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们整理了几千条客服问题和标准回复，用来训练模型。”

专业表达：
“在 Prompt 优化之外，我们进一步构建指令-回答数据进行 SFT，使模型更稳定地学习目标任务的响应模式。”

禁止包装：

- 仅做 Prompt、RAG 或 Few-shot 不属于 Fine-tuning。
- 用户没参与训练数据设计或训练过程，不要替他包装成“负责微调”。
- LoRA 只有实际采用该训练方法时才使用。

<<<PARENT_SPLIT>>>

## P18 RLHF、偏好数据与人类反馈

### 概念范围

RLHF：利用人类偏好反馈训练奖励或偏好信号，并进一步优化模型行为的一类方法。

Preference Data：人类对多个输出进行选择、排序或偏好标注形成的数据。

在产品项目中，用户更常真实参与的是“偏好数据设计或人工评价”，而不是直接实现完整 RLHF。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们让评审从两个回答里选更好的。”
- “收集专家对输出排序的偏好数据。”
- “模型训练团队后来用这些偏好数据继续优化。”
- “我们定义了什么样的回答更符合用户偏好。”
- “我主要参与的是评价规则，不是训练算法。”

可映射：

“比较/排序输出” → Preference Data / Pairwise Preference Evaluation。

“偏好数据进入后续强化优化” → 可能涉及 RLHF。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我设计了评审标准，让专家从两个回答里选哪个更好，数据交给算法训练。”

专业表达：
“我参与了 Preference Data 的构建，通过 Pairwise Comparison 收集专家偏好，为后续模型行为优化提供监督信号。”

禁止包装：

- 只做人工打分不要直接写“负责 RLHF”。
- 如果用户不知道算法团队是否真正采用 RLHF，专业表达应停留在 Preference Data / Human Feedback。
- 不把普通用户反馈统一称为 RLHF。

<<<PARENT_SPLIT>>>

## P19 Tool Calling / Function Calling

### 概念范围

Tool Calling / Function Calling：模型根据当前任务选择外部工具，并生成结构化参数，由应用程序真正执行工具。

常见工具包括搜索、数据库查询、日历、邮件、CRM、计算和企业内部 API。

模型负责“决定调用什么、提供什么参数”，真实执行仍由外部系统完成。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “模型判断什么时候查数据库。”
- “AI 会根据问题调用搜索工具。”
- “模型生成参数后，我们的后端真正调用 API。”
- “不是模型自己发邮件，而是触发邮件工具。”
- “不同任务会选择不同工具。”

可映射：

“模型动态选择外部能力” → Tool Calling / Function Calling。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“用户问实时订单状态时，模型会自动查订单接口再回答。”

专业表达：
“我通过 Tool Calling 将 LLM 的意图理解能力与订单系统 API 连接：模型负责识别查询意图并生成结构化参数，后端负责真实执行查询并回传结果。”

禁止包装：

- 固定后端 API 调用不一定属于模型 Tool Calling。
- 不要说“LLM 直接操作数据库”，除非系统真实如此。
- 工具是否自动执行、是否人工确认要按真实事实表达。

<<<PARENT_SPLIT>>>

## P20 Workflow、Agent 与 Multi-Agent Orchestration

### 概念范围

Workflow：步骤与路由大体可以预先定义的流程。

Agent：模型根据目标和中间结果动态决定下一步行为或工具调用。

Multi-Agent Orchestration：多个具有相对独立职责、状态或工具能力的 Agent 进行协作与编排。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “流程是固定的：解析、判断、生成。”
- “模型会根据当前结果决定下一步查哪个工具。”
- “两个角色分别有独立目标和工具，然后互相传递结果。”
- “我们最开始想做多 Agent，后来发现固定 Workflow 更稳定。”
- “不同节点只是不同 Prompt，并没有独立决策。”

可映射：

“预定义步骤” → Workflow。

“动态决定下一步” → Agent。

“多个独立智能体协作” → Multi-Agent Orchestration。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“解析、缺口判断、生成下一题都是固定顺序，只是每步用不同 Prompt。”

专业表达：
“我采用可控的 Workflow 将任务拆成多个职责清晰的 LLM 节点，而没有为了复杂度强行引入 Multi-Agent。”

用户原话：
“不同 Agent 会根据中间结果决定是否调用工具和把任务交给谁。”

专业表达：
“在需要动态任务分配的环节，我采用 Multi-Agent Orchestration，让不同 Agent 基于独立职责和中间状态进行协同决策。”

禁止包装：

- 多个 LLM 节点 ≠ Multi-Agent。
- 不具备动态决策的流程不要硬称 Agent。
- 只有角色 Prompt 不足以证明“多智能体架构”。

<<<PARENT_SPLIT>>>

## P21 AI-as-a-Judge、Human Evaluation 与 Pairwise Evaluation

### 概念范围

AI-as-a-Judge：使用另一个模型按照明确评价标准，对模型输出进行评分、分类或比较。

Human Evaluation：由人工按照 Rubric 评估输出质量。

Pairwise Evaluation：比较 A/B 两个输出哪个更优，而不是给绝对分数。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们让另一个模型按五个维度给回答打分。”
- “重要样本还是由人工复核。”
- “我们不直接打 1-10 分，而是让评审选 A 和 B 哪个更好。”
- “先让 AI 批量评，再抽样跟人工结果对齐。”
- “Judge 和人工结果不一致时我们会检查评分标准。”

可映射：

“模型自动评分” → AI-as-a-Judge。

“专家按规则评价” → Human Evaluation。

“A/B 输出偏好比较” → Pairwise Evaluation。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“为了快速迭代 Prompt，我们用大模型先批量打分，再抽一部分人工检查。”

专业表达：
“我引入 AI-as-a-Judge 做大规模自动评测，并通过人工抽样校准 Judge 与 Human Evaluation 的一致性，在评测效率和可靠性之间做平衡。”

禁止包装：

- 让模型随便“打个分”不等于可靠 AI-as-a-Judge。
- 没有 Rubric 不要写“标准化自动评测”。
- AI Judge 不是绝对 Ground Truth。

<<<PARENT_SPLIT>>>

## P22 Hallucination Governance、Grounding 与 Guardrails

### 概念范围

Hallucination Governance：通过多种产品和技术机制降低无依据生成带来的风险。

Grounding：让输出基于提供的可靠数据、检索内容或工具结果。

Guardrails：在输入、生成、工具调用或输出阶段增加规则、校验、权限或安全约束。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “没有数据时不能让模型自己编。”
- “所有关键事实必须来自用户输入。”
- “如果知识库没搜到，就标记不知道。”
- “生成后再检查有没有凭空出现数字。”
- “工具调用前还有规则校验。”

可映射：

“限制无依据生成” → Hallucination Governance。

“回答必须有证据” → Grounding。

“额外规则与校验” → Guardrails。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“用户没有提供项目数据时，我们宁可留待补充，也不能让模型帮他编一个提升百分比。”

专业表达：
“我设计了事实约束型 Hallucination Governance：所有数字和项目事实必须绑定用户已确认信息，缺失字段显式保留为待补充，而不是由模型自动补全。”

禁止包装：

- 加一句“不要幻觉”不等于建立 Hallucination Governance。
- RAG 本身不等于完全消除幻觉。
- Guardrail 必须对应真实规则、校验或权限机制。

<<<PARENT_SPLIT>>>

## P23 Human-in-the-loop、Confidence 与人工兜底

### 概念范围

Human-in-the-loop（HITL）：在 AI 流程的关键节点引入人工确认、复核、修正或标注。

Confidence：某些分类器或经过校准的模型可以输出置信度，但 LLM 自己声称“我有 90% 把握”并不应直接视为可靠概率。

Fallback：当主要 AI 路径不可靠或失败时，切换到更保守的规则、备用模型、人工或降级体验。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “低把握的案例转给人工。”
- “重要操作一定要用户确认。”
- “模型失败时切到规则方案。”
- “AI 先处理，大部分简单情况自动过，难的人工接管。”
- “我们没有把模型自己报的置信度直接当概率。”

可映射：

“关键节点人工确认” → Human-in-the-loop。

“低可靠场景转其他路径” → Fallback / Escalation。

“有真实校准分数” → Confidence Score。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“普通简历自动处理，但判断不出来的我们让人工确认。”

专业表达：
“我采用 Human-in-the-loop 机制，将高确定性的常规 Case 自动化处理，对低置信或高风险 Case 触发人工复核，实现效率与可靠性的平衡。”

禁止包装：

- 没有真实 Confidence 机制时，不要补“低于 0.7 转人工”。
- LLM 自报置信度不应被当作可靠校准概率。
- 所有结果都人工确认不一定代表高水平 HITL 设计。

<<<PARENT_SPLIT>>>

## P24 Red Teaming、Robustness 与安全边界

### 概念范围

Red Teaming：主动使用恶意、极端或对抗性输入挑战系统安全边界。

Robustness：系统面对噪声、异常输入、分布变化或攻击时仍保持合理表现的能力。

Safety Boundary：明确 AI 在哪些场景可以做、哪些场景应该拒绝、降级或转人工。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “我们故意输入乱序、拼写错误、恶意提示。”
- “上线前专门测试用户怎么绕过规则。”
- “即使输入很乱，系统也应该至少不要生成危险结果。”
- “某些高风险问题直接拒绝自动执行。”
- “修复安全问题后加入固定测试。”

可映射：

“主动攻击测试” → Red Teaming。

“异常输入仍稳定” → Robustness。

“明确拒绝/降级范围” → Safety Boundary / Guardrail。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“上线前我们故意用越权指令、恶意 Prompt 和奇怪输入去测系统。”

专业表达：
“上线前我组织 Red Teaming，使用越权、Prompt Injection 和异常输入主动挑战系统边界，并将关键安全 Case 沉淀到后续回归测试中。”

禁止包装：

- 普通功能测试不要称为 Red Teaming。
- 鲁棒性必须对应异常或分布变化场景。
- 没有安全测试记录，不要夸大成“建立安全评估体系”。

<<<PARENT_SPLIT>>>

## P25 Latency Optimization、Streaming 与异步体验

### 概念范围

Latency Optimization：降低系统从用户请求到获得有效响应之间的时间。

Streaming：模型生成过程中逐步输出内容，降低用户感知等待。

Async Processing：对耗时任务异步处理，不要求用户持续等待完整结果。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “回答要等十几秒，用户以为卡住了。”
- “我们改成边生成边展示。”
- “长任务放后台跑，完成后再通知用户。”
- “不是只换快模型，也优化了等待体验。”
- “把多个串行步骤并行后减少总耗时。”

可映射：

“减少实际等待” → Latency Optimization。

“边生成边展示” → Streaming。

“后台处理长任务” → Async Processing。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“模型本身还是需要几秒，但我们改成逐字输出，用户感觉快很多。”

专业表达：
“在模型端到端耗时暂时无法大幅下降的情况下，我通过 Streaming 优化感知延迟，缩短用户看到首个有效反馈的时间。”

禁止包装：

- Streaming 改善的是感知延迟，不等于模型推理本身更快。
- 没有测量时，不补造“延迟降低 40%”。

<<<PARENT_SPLIT>>>

## P26 Token Cost Optimization、Prompt Caching 与结果复用

### 概念范围

Token Cost Optimization：通过减少无效输入、控制输出长度、模型分层、缓存或上下文裁剪降低模型调用成本。

Prompt Caching：对重复 Prompt 前缀或上下文进行缓存复用，以降低重复计算成本或延迟。

Result Caching：对可以安全复用的确定性或高重复结果进行缓存。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “每次都传整段历史太贵，所以我们只传必要信息。”
- “很多固定 System Prompt 每次都重复。”
- “相同请求没必要每次重新调模型。”
- “输出太长，我们限制长度。”
- “简单任务不用最贵模型。”

可映射：

“减少无效 Token” → Token Cost Optimization。

“复用重复 Prompt” → Prompt Caching。

“复用相同结果” → Result Caching。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我把完整历史对话改成结构化状态，只保留当前轮需要的信息。”

专业表达：
“我通过 Context Compression 降低无效 Token 消耗，在不丢失关键状态的前提下控制单次调用成本。”

用户原话：
“固定提示词每次都一样，所以做了缓存。”

专业表达：
“针对高重复 Prompt 前缀引入 Prompt Caching，减少重复计算带来的成本与延迟。”

禁止包装：

- 未真实启用缓存不要写 Prompt Caching。
- 成本优化必须有真实动作，不要只因为“用了小模型”就声称建立成本体系。
- 没有成本数据，不补造具体降本比例。

<<<PARENT_SPLIT>>>

## P27 Model Routing 与模型分层

### 概念范围

Model Routing：根据任务复杂度、风险、成本或延迟要求，将请求路由到不同模型或处理路径。

常见思路：

简单分类 → 小模型或规则。
复杂推理 → 强模型。
需要知识 → RAG。
高风险 → 强模型 + 人工确认。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “简单问题走便宜模型，复杂问题再升级。”
- “先让小模型判断问题类型，再决定调用谁。”
- “高风险问题强制走更严格路径。”
- “不是所有用户请求都用最强模型。”
- “失败后会切换备用模型。”

可映射：

“按任务选择模型” → Model Routing。

“不同复杂度使用不同能力等级” → Tiered Model Strategy。

“主路径失败切备用模型” → Model Fallback。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“简单分类用小模型，只有复杂项目分析才用大模型。”

专业表达：
“我设计了 Model Routing，根据任务复杂度进行模型分层：低复杂度请求优先走轻量模型，高价值复杂任务再升级到更强模型，在质量与成本之间做动态权衡。”

禁止包装：

- 手工偶尔换模型不等于 Model Routing。
- 没有明确路由条件，不要写“智能模型路由”。
- 模型分层不能只讲成本，也要保留质量边界。

<<<PARENT_SPLIT>>>

## P28 ROI、Unit Economics 与商业可持续性

### 概念范围

ROI：投入与收益之间的整体回报关系。

Unit Economics：关注单次任务、单个用户或单个客户层面的收入、价值与成本结构。

AI 产品中常见成本包括模型调用、Token、推理服务、RAG、第三方工具和人工审核。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “AI 每次调用有成本，但能节省人工时间。”
- “用户越多，模型费用也线性上涨。”
- “我们算过每完成一次任务大概多少钱。”
- “这个功能很酷，但经济上不一定划算。”
- “企业客户节省的人力成本足以覆盖模型费用。”

可映射：

“整体收益/投入” → ROI。

“单次任务/单用户经济模型” → Unit Economics。

“AI 替代人工成本” → Cost-to-Serve / Automation Economics。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“虽然强模型一次贵一些，但能帮销售省二十分钟，所以企业场景还是划算。”

专业表达：
“我没有只看模型调用成本，而是从 Unit Economics 判断单次 AI 任务的 Cost-to-Serve 与用户节省的人力价值，评估方案是否具备商业可持续性。”

禁止包装：

- 没有真实收益数据，不要声称 ROI 为正。
- 不要凭感觉补用户愿付价格。
- ROI 不是“功能好不好”的替代指标。

<<<PARENT_SPLIT>>>

## P29 Cold Start、Synthetic Data 与数据稀缺

### 概念范围

Cold Start：新用户、新内容或新系统缺少历史行为数据，导致个性化或学习能力不足。

Synthetic Data：使用模型或规则生成模拟样本，用于补充稀缺场景、训练、测试或安全覆盖。

Fallback Rule / Heuristic：数据不足时用规则、热门内容、人工策略等作为临时方案。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “新用户没有历史行为，所以没法直接个性化。”
- “一开始真实 Bad Case 太少，我们先生成模拟数据做测试。”
- “冷启动阶段先给热门内容。”
- “等数据积累起来再切到个性化策略。”
- “用合成样本覆盖真实数据很难出现的边界情况。”

可映射：

“缺历史数据” → Cold Start。

“生成模拟样本” → Synthetic Data。

“早期规则兜底” → Heuristic / Rule-based Fallback。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“刚上线没用户历史，所以先用热门内容，等有行为数据后再个性化。”

专业表达：
“针对 Cold Start，我先用热门召回作为 Rule-based Fallback，随着用户行为数据积累再逐步切换到个性化策略。”

用户原话：
“真实安全攻击案例太少，所以用强模型模拟了一批。”

专业表达：
“针对稀缺边界场景，我使用 Synthetic Data 扩充测试覆盖，但仍保留真实样本作为核心评测基准。”

禁止包装：

- Synthetic Data 不能被描述成真实用户数据。
- 没有明显数据稀缺问题，不要硬套 Cold Start。
- 合成数据不能替代真实线上分布验证。

<<<PARENT_SPLIT>>>

## P30 Feature Engineering 与传统机器学习特征

### 概念范围

Feature Engineering：从原始数据中构造对传统机器学习预测有价值的特征，例如用户近 7 天活跃、历史购买频次、时间间隔、内容标签等。

该术语主要适合传统 ML、推荐、排序、风控、预测等任务，不应泛化到所有 LLM 产品。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “原来只看用户年龄，后来增加最近活跃度和购买频次。”
- “把原始行为日志转成可训练变量。”
- “我们构造了时间窗口特征。”
- “加入更多有效特征后模型分类效果变好。”
- “模型输入不是原始数据，而是整理后的特征。”

可映射：

“构造预测变量” → Feature Engineering。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们把用户最近 7 天点击次数、购买次数和停留时长做成输入变量。”

专业表达：
“我参与 Feature Engineering，将原始行为日志转化为近 7 日点击频次、购买频次和停留时长等行为特征，为模型训练提供更具预测价值的输入。”

禁止包装：

- Prompt 中增加字段不等于 Feature Engineering。
- RAG Metadata 不应自动称为 Feature Engineering。
- LLM Context 组织通常更适合写 Context Engineering / Context Management。

<<<PARENT_SPLIT>>>

## P31 Multimodal 与多模态信息融合

### 概念范围

Multimodal：同一 AI 系统处理或理解文本、图片、音频、视频等多种模态。

多模态产品设计不仅是“上传图片”，还要明确不同模态分别提供什么信息，以及最终如何融合。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “除了文字，还分析用户语音。”
- “图片和文本一起作为模型输入。”
- “面试产品同时分析回答内容和音频表现。”
- “语音先转文字，再结合声学特征处理。”
- “不同输入类型最终统一生成反馈。”

可映射：

“多种模态共同参与任务” → Multimodal。

“跨模态信息组合” → Multimodal Fusion。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们不仅分析回答文字，还分析语音里的停顿和语速。”

专业表达：
“我将面试评估扩展为 Multimodal 方案，结合文本语义与语音侧的节奏信息形成更完整的反馈信号。”

禁止包装：

- 只是把图片 OCR 成文字后处理，不一定需要强调“多模态融合”。
- 没有真正融合多种模态信息，不要写 Multimodal Fusion。

<<<PARENT_SPLIT>>>

## P32 On-device AI / Edge AI

### 概念范围

On-device AI / Edge AI：模型或关键推理过程运行在用户本地设备，而不是全部发送到云端。

常见价值包括隐私、低网络依赖、低延迟和离线能力，但通常受到算力、模型大小和设备兼容性限制。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “敏感数据不上传服务器。”
- “模型直接在手机或电脑本地运行。”
- “没有网络也能用。”
- “为了隐私和响应速度，把部分推理放端侧。”
- “端侧模型效果弱一些，但数据不出设备。”

可映射：

“本地设备推理” → On-device AI / Edge AI。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“简历数据比较敏感，所以我们希望在本地完成部分处理，不上传云端。”

专业表达：
“针对高敏感用户数据，我评估 On-device AI 方案，将部分处理下沉到端侧，在隐私、模型能力和设备资源之间进行权衡。”

禁止包装：

- 本地前端处理不等于 On-device AI。
- 只有真实模型推理在端侧运行时才使用该术语。

<<<PARENT_SPLIT>>>

## P33 Observability、Tracing 与可调试性

### 概念范围

Observability：通过日志、指标、追踪等手段理解 AI 系统内部发生了什么。

Tracing：记录一次请求经过哪些节点、使用了什么 Prompt、检索了哪些 Chunk、调用了哪些工具、最终输出什么。

对复杂 Workflow、RAG 和 Agent 项目，Tracing 有助于定位问题发生在哪一层。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “出现错误时，我们能看到每个节点的输入输出。”
- “会记录检索到了哪些知识。”
- “Tool 调用失败能追到具体哪一步。”
- “Prompt 更新后有版本记录。”
- “不是只看最终回答，而是能还原完整执行链。”

可映射：

“系统链路可追踪” → Tracing。

“日志+指标+链路监控” → Observability。

“能复现问题” → Debuggability / Traceability。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“回答错的时候，我们能看到当时召回了哪几个 Chunk、用了哪个 Prompt。”

专业表达：
“我通过链路 Tracing 记录 Query、Retrieved Chunks、Prompt Version 与最终输出，使 Bad Case 可以从 Retrieval 到 Generation 层逐步定位。”

禁止包装：

- 普通日志不一定等于完整 Observability。
- 只记录最终回答，不要写“端到端 Tracing”。

<<<PARENT_SPLIT>>>

## P34 灰度发布、Canary 与线上验证

### 概念范围

Gray Release / Canary Release：先向一小部分用户或流量发布新版本，观察核心指标和风险，再逐步扩大。

适合模型、Prompt、RAG 或 Agent 等可能出现不可预期行为的 AI 版本迭代。

<<<CHILD_SPLIT>>>

### 口语触发语与事实证据

用户可能说：

- “没有一次性全量上线，先给一小部分用户。”
- “先内部用户，再小流量，再逐步扩大。”
- “发现异常可以快速回滚。”
- “新模型先灰度观察真实 Bad Case。”
- “线上稳定后才全量。”

可映射：

“小流量逐步发布” → Gray Release / Canary Release。

“异常时恢复旧版本” → Rollback。

<<<CHILD_SPLIT>>>

### 专业表达与使用边界

用户原话：
“我们先给少量用户用新 Prompt，稳定后再全量。”

专业表达：
“新版本采用 Gray Release，先在小流量环境观察核心指标与 Bad Case，确认质量稳定后再逐步放量，并在具备条件时保留 Rollback 路径。”

禁止包装：

- 普通内测不一定等于 Canary Release。
- 没有真实流量比例不要补百分比。
- 没有回滚机制不要写“可快速 Rollback”。