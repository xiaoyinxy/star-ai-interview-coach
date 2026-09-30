from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


OUTPUT = Path(__file__).with_name("AI面试教练产品优化故事.docx")
NAVY = "17324D"
BLUE = "2B66D9"
PALE_BLUE = "EDF4FF"
PALE_GRAY = "F5F7FA"
MID_GRAY = "667085"
LIGHT_BORDER = "D9D9D9"
WHITE = "FFFFFF"
BLACK = "000000"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=120, start=140, bottom=120, end=140):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        element = borders.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:color"), LIGHT_BORDER)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_run_font(run, name="Microsoft YaHei", size=None, bold=None, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)


def add_field(paragraph, field_code):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = field_code
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, text, end])


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_font(run, size=18 if level == 1 else 13, bold=True, color=BLACK)
    return p


def add_major_heading(doc, text):
    p = add_heading(doc, text, 1)
    p.paragraph_format.page_break_before = True
    return p


def add_body(doc, text, bold_lead=None):
    p = doc.add_paragraph(style="Body Text")
    if bold_lead and text.startswith(bold_lead):
        lead = p.add_run(bold_lead)
        set_run_font(lead, size=10.5, bold=True)
        rest = p.add_run(text[len(bold_lead):])
        set_run_font(rest, size=10.5)
    else:
        run = p.add_run(text)
        set_run_font(run, size=10.5)
    return p


def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
        p.paragraph_format.keep_together = True
        run = p.add_run(item)
        set_run_font(run, size=10.2)


def add_numbered(doc, items):
    for index, item in enumerate(items, start=1):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.72)
        p.paragraph_format.first_line_indent = Cm(-0.72)
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_together = True
        run = p.add_run(f"{index}.  {item}")
        set_run_font(run, size=10.2)


def add_table(doc, headers, rows, widths=None, font_size=9.3):
    table = doc.add_table(rows=1, cols=len(headers))
    table.autofit = False
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_table_borders(table)
    header = table.rows[0]
    set_repeat_table_header(header)
    for idx, title in enumerate(headers):
        cell = header.cells[idx]
        set_cell_shading(cell, NAVY)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        if widths:
            cell.width = Cm(widths[idx])
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        set_run_font(run, size=9.2, bold=True, color=WHITE)
    for row_index, values in enumerate(rows):
        row = table.add_row()
        for idx, value in enumerate(values):
            cell = row.cells[idx]
            set_cell_shading(cell, WHITE if row_index % 2 == 0 else PALE_BLUE)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if widths:
                cell.width = Cm(widths[idx])
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(str(value))
            set_run_font(run, size=font_size)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_page_break(doc):
    doc.add_page_break()


def configure_document(doc):
    section = doc.sections[0]
    section.top_margin = Cm(2.1)
    section.bottom_margin = Cm(1.9)
    section.left_margin = Cm(2.25)
    section.right_margin = Cm(2.25)
    section.header_distance = Cm(0.9)
    section.footer_distance = Cm(0.9)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string("202633")
    normal.paragraph_format.line_spacing = 1.35
    normal.paragraph_format.space_after = Pt(6)

    body = styles["Body Text"]
    body.font.name = "Microsoft YaHei"
    body._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    body.font.size = Pt(10.5)
    body.paragraph_format.first_line_indent = Cm(0.74)
    body.paragraph_format.line_spacing = 1.38
    body.paragraph_format.space_after = Pt(6)

    title = styles["Title"]
    title.font.name = "Microsoft YaHei"
    title._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    title.font.size = Pt(28)
    title.font.bold = True
    title.font.color.rgb = RGBColor.from_string(BLACK)
    title.paragraph_format.space_after = Pt(16)
    title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    for level, size in ((1, 18), (2, 13)):
        style = styles[f"Heading {level}"]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(BLACK)
        style.paragraph_format.space_before = Pt(14 if level == 1 else 10)
        style.paragraph_format.space_after = Pt(7 if level == 1 else 5)
        style.paragraph_format.keep_with_next = True

    for style_name in ("List Bullet", "List Bullet 2", "List Number"):
        style = styles[style_name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(10.2)
        style.paragraph_format.line_spacing = 1.25
        style.paragraph_format.space_after = Pt(3)

    header = section.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header_run = header.add_run("AI 面试教练  产品优化复盘")
    set_run_font(header_run, size=8.5, color=MID_GRAY)

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("面试展示版  |  2026 年 9 月 10 日  |  第 ")
    set_run_font(run, size=8, color=MID_GRAY)
    add_field(footer, "PAGE")
    run = footer.add_run(" 页")
    set_run_font(run, size=8, color=MID_GRAY)

    settings = doc.settings._element
    update_fields = OxmlElement("w:updateFields")
    update_fields.set(qn("w:val"), "true")
    settings.append(update_fields)


def build_document():
    doc = Document()
    configure_document(doc)

    # Cover
    doc.add_paragraph().paragraph_format.space_after = Pt(52)
    label = doc.add_paragraph()
    label.paragraph_format.space_after = Pt(10)
    run = label.add_run("AI PRODUCT MANAGER CASE STUDY")
    set_run_font(run, size=10, bold=True, color=BLUE)
    title = doc.add_paragraph(style="Title")
    run = title.add_run("AI 面试教练产品优化故事")
    set_run_font(run, size=28, bold=True, color=BLACK)
    subtitle = doc.add_paragraph()
    subtitle.paragraph_format.space_after = Pt(24)
    run = subtitle.add_run("从慢响应和脆弱 JSON 到可演示的结构化面试体验")
    set_run_font(run, size=15, color=MID_GRAY)

    intro = doc.add_paragraph()
    intro.paragraph_format.space_after = Pt(26)
    intro.paragraph_format.line_spacing = 1.45
    run = intro.add_run(
        "这份文档记录我如何诊断并优化一个基于 Dify 的 STAR 行为面试教练。"
        "优化覆盖产品规则、工作流模型分层、提示词、输出协议、前端容错和端到端验证。"
        "核心结果来自同一代表性输入的单次调试测试，不等同于生产环境平均值。"
    )
    set_run_font(run, size=11.5)

    add_table(
        doc,
        ["测试指标", "优化前", "优化后", "变化"],
        [
            ["工作流响应耗时", "31.55 秒", "约 12.22 秒", "下降约 61.3%"],
            ["工作流总 token", "5,906", "约 2,613", "下降约 55.8%"],
            ["三段核心提示词", "8,919 字符", "2,060 字符", "下降约 76.9%"],
            ["前端输出", "可能丢字段或暴露 JSON", "三段式完整展示", "可靠性提升"],
        ],
        widths=[3.2, 3.5, 3.5, 4.1],
        font_size=9.5,
    )
    note = doc.add_paragraph()
    note.paragraph_format.space_before = Pt(6)
    run = note.add_run("数据口径  Dify 预览页节点日志与本地端到端测试  2026 年 9 月 10 日")
    set_run_font(run, size=8.5, color=MID_GRAY)

    add_major_heading(doc, "一 产品背景与设计目标")
    add_body(
        doc,
        "产品面向 AI 产品经理校招和一至三年经验求职者。目标用户通常有真实项目经历，也知道 STAR 的基本概念，但回答容易停留在团队流水账，缺少个人动作、决策依据和可验证结果。通用大模型往往直接润色现有文字，无法区分信息不足与表达不佳，还可能补出用户没有做过的数字或方法。",
    )
    add_body(
        doc,
        "我把产品目标定义为提高真实经历的信息密度，而不是代写一个看起来完整的故事。系统每轮识别当前最有价值的信息缺口，只追问一个最小事实单元；用户确认事实后，系统再生成 STAR 总结。",
    )

    add_heading(doc, "核心产品原则", 2)
    add_bullets(
        doc,
        [
            "真实性优先。模型只能记录用户明确说过的事实，不编造指标、项目规模、实验或技术动作。",
            "先挖掘再表达。系统先更新 Story State，再判断缺口和追问方向，最后才生成总结。",
            "每轮只问一个高价值问题。问题要沿最新事实继续向下，不重复、不跨层级。",
            "专业知识只提供视角。RAG 不能覆盖用户事实，也不能把标准答案强加给用户。",
        ],
    )

    add_heading(doc, "产品闭环", 2)
    add_table(
        doc,
        ["步骤", "系统动作", "用户价值"],
        [
            ["1", "接收自然语言项目经历", "不要求用户先掌握 STAR 模板"],
            ["2", "识别意图并增量更新 Story State", "保留历史事实和上下文"],
            ["3", "分析最高优先级缺口", "避免一次追问多个问题"],
            ["4", "按需检索 AIPM 能力知识", "让追问更贴近岗位能力"],
            ["5", "输出反馈 下一问 回答思路", "帮助用户继续回忆而不是照抄答案"],
            ["6", "事实收敛后生成 STAR 总结", "形成可练习且可追溯的面试故事"],
        ],
        widths=[1.5, 7.0, 6.1],
    )

    add_major_heading(doc, "二 系统方案")
    add_body(
        doc,
        "系统采用 Dify Chatflow 管理会话状态，并由本地前端承载面试过程和实时洞察。工作流不是单次问答，而是持续更新一份结构化故事状态，再根据缺口决定下一轮问题。",
    )

    add_heading(doc, "当前工作流", 2)
    flow = doc.add_table(rows=1, cols=7)
    flow.alignment = WD_ALIGN_PARAGRAPH.CENTER
    flow.autofit = False
    set_table_borders(flow)
    labels = ["用户输入", "意图识别", "Story State\n与缺口", "知识检索", "问题生成", "输出清洗", "前端展示"]
    for index, label_text in enumerate(labels):
        cell = flow.rows[0].cells[index]
        set_cell_margins(cell, top=180, bottom=180, start=80, end=80)
        set_cell_shading(cell, NAVY if index in (0, 6) else PALE_BLUE)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(label_text)
        set_run_font(run, size=8.5, bold=True, color=WHITE if index in (0, 6) else BLACK)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)

    add_heading(doc, "状态结构", 2)
    add_body(
        doc,
        "Story State 保存项目名称、项目类型、Situation、Task、Actions、Decisions、Challenges、Result、Metrics、Ownership、Reflection 和待确认事实。Gap State 保存故事完整度、缺失字段、唯一优先缺口、原因、检索词和是否继续追问。两个状态把会话从自由文本转换为可检查、可推进的产品逻辑。",
    )

    add_heading(doc, "前端交互", 2)
    add_bullets(
        doc,
        [
            "对话区保留完整上下文，流式显示模型回复。",
            "回复结束后拆分为教练反馈、下一步追问和回答思路三个区块。",
            "右侧 STAR Map 和 Answer Signal 让用户看到当前故事完成度。",
            "对话记录保存在本机，Dify conversation_id 用于延续后端状态。",
            "API Key 只由服务端环境变量读取，不进入浏览器 bundle。",
        ],
    )

    add_heading(doc, "质量判断", 2)
    add_body(
        doc,
        "追问质量不只看语言是否自然，还要检查五件事：是否承接用户最新回答，是否只追一个事实单元，是否优先补 Action 或关键决策，是否避免虚构，是否能让下一轮信息增益高于上一轮。",
    )

    add_major_heading(doc, "三 问题诊断")
    add_body(
        doc,
        "初版体验有两个直接影响演示的问题。第一，项目类回答需要二十秒到数分钟，用户会误以为服务失败。第二，模型输出依赖手写 JSON；一旦出现漏引号、转义或字段名拼错，前端就可能只显示 feedback，或者把 {reply: ...} 原样展示。",
    )

    add_heading(doc, "根因拆解", 2)
    add_table(
        doc,
        ["问题", "观察证据", "根因判断", "影响"],
        [
            ["响应慢", "基线 31.55 秒 5,906 tokens", "多个 LLM 串行运行 提示词过长", "等待感强 容易被判断为超时"],
            ["耗时波动", "32B Story 节点单轮达到 30.812 秒", "模型体量和供应商队列成为主要瓶颈", "相同输入时延不稳定"],
            ["结构化失败", "7B 曾输出缺引号或重复字符", "自然语言模型承担严格序列化职责", "代码节点校验失败"],
            ["内容丢失", "前端曾只展示 feedback", "解析器把 JSON 成功当作唯一契约", "下一问和 guidance 被遗漏"],
            ["错误提示模糊", "用户看到读取失败或无法连接", "网络异常 模型异常 解析异常混在一起", "难以快速定位故障"],
        ],
        widths=[2.5, 4.2, 5.0, 3.4],
        font_size=8.8,
    )

    add_heading(doc, "关键判断", 2)
    add_body(
        doc,
        "知识检索不是本轮主瓶颈。最终测试中知识检索只占 20.9 毫秒；真正耗时来自串行的模型节点。因此我没有优先重做知识库，而是先缩短提示词、重新分配模型，并修复输出契约。",
    )

    add_heading(doc, "安全风险", 2)
    add_body(
        doc,
        "项目使用服务端环境变量保存 Dify Key，前端不读取密钥。由于密钥曾在调试沟通中以明文出现，正式展示前仍应在 Dify 控制台轮换该 Key，并更新本地 .env.local。这属于发布前必须完成的安全动作。",
    )

    add_major_heading(doc, "四 优化实验与取舍")
    add_body(
        doc,
        "我按先减少无效输入 再调整模型 最后加固协议的顺序实验。每次只改变少量变量，并用同一条项目经历复测。这样可以区分提示词长度、模型能力和供应商时延对结果的影响。",
    )

    add_heading(doc, "提示词压缩", 2)
    add_table(
        doc,
        ["节点", "优化前", "优化后", "压缩比例", "保留的核心职责"],
        [
            ["意图识别", "2,175 字符", "516 字符", "76.3%", "七类意图和单一数字输出"],
            ["Story 与缺口分析", "1,915 字符", "1,064 字符", "44.4%", "事实合并 缺口优先级 JSON 状态"],
            ["问题生成", "4,829 字符", "480 字符", "90.1%", "反馈 单一追问 回答思路"],
            ["合计", "8,919 字符", "2,060 字符", "76.9%", "删除重复角色描述和解释性规则"],
        ],
        widths=[3.0, 2.7, 2.7, 2.4, 5.1],
        font_size=8.8,
    )

    add_heading(doc, "模型实验", 2)
    add_table(
        doc,
        ["方案", "结果", "决定"],
        [
            ["Qwen3.5 9B 用于 Story State", "单次等待超过 30 秒 无稳定结果", "不采用"],
            ["Qwen3.5 4B 用于 Story State", "出现挂起和波动", "不采用"],
            ["Qwen2.5 7B 用于 Story State", "速度较快 但 JSON 严重畸形并触发输出校验失败", "不采用"],
            ["7B 加结构化输出", "严格 schema 增加等待且仍不稳定", "不采用"],
            ["32B Story 加 7B 问题生成", "状态可靠 但 Story 节点 30.812 秒 且最终文本受污染", "仅作对照"],
            ["Gemini 2.5 Flash 处理 Story 和问题生成", "Story 4.617 秒 问题生成 3.972 秒 输出完整", "采用并发布"],
        ],
        widths=[5.0, 7.4, 2.4],
        font_size=8.8,
    )

    add_heading(doc, "输出协议", 2)
    add_body(
        doc,
        "我最终没有继续强迫模型生成深层 JSON。面向用户的回复改为三个稳定文本标记：本轮反馈、下一问、回答思路。Story State 仍保留 JSON，因为下游需要读取字段；展示层则使用更适合自然语言模型的浅协议。",
    )
    code = doc.add_paragraph()
    code.paragraph_format.left_indent = Cm(0.8)
    code.paragraph_format.right_indent = Cm(0.8)
    code.paragraph_format.space_before = Pt(4)
    code.paragraph_format.space_after = Pt(8)
    run = code.add_run("【本轮反馈】\n一段事实反馈\n【下一问】\n一个问题\n【回答思路】\n- 提示一\n- 提示二")
    set_run_font(run, name="Consolas", size=9.2, color=NAVY)

    add_heading(doc, "五 最终实现", 1)
    add_heading(doc, "工作流调整", 2)
    add_numbered(
        doc,
        [
            "将意图识别提示词压缩为最小分类规则，并使用 Qwen2.5 7B 完成低成本路由。",
            "将 Story State 和 Gap State 的提示词压缩为事实规则、缺口规则和唯一 JSON 模板。",
            "将 Story 与最终问题生成切换为 Gemini 2.5 Flash，降低串行模型耗时并改善格式遵循。",
            "最终问题生成只输出三个文本标记，不再返回嵌套 JSON。",
            "发布 Dify 工作流版本 1，并通过 Dify 预览页和本地应用分别验证。",
        ],
    )

    add_heading(doc, "前端容错", 2)
    add_body(
        doc,
        "前端解析器按三层策略处理回复。第一层识别三个文本标记并完整提取内容；第二层兼容旧 JSON，包括 next_question、nextQuestion、question 和拼错的 answer_guidanceance；第三层保留纯文本回退。流式过程中先显示已收到的文本，消息结束后再转换为结构化组件。",
    )
    add_table(
        doc,
        ["输入类型", "处理方式", "用户看到的结果"],
        [
            ["新标记协议", "按三个标题切分并清理列表符号", "三段式卡片"],
            ["标准 JSON", "读取 feedback next_question answer_guidance", "三段式卡片"],
            ["畸形旧 JSON", "正则提取可恢复字段", "尽量保留有效内容"],
            ["普通文本", "直接展示", "不因解析失败而空白"],
        ],
        widths=[3.5, 6.8, 4.6],
    )

    add_heading(doc, "用户体验变化", 2)
    add_bullets(
        doc,
        [
            "反馈区明确复述本轮新增事实和当前缺口。",
            "下一问区突出唯一问题，减少用户认知负担。",
            "回答思路完整呈现二至四条回忆入口，不替用户编答案。",
            "流式返回让用户更早看到内容，结构化渲染在结束后完成。",
            "服务端代理继续隐藏密钥，并转发必要的 Dify SSE 事件。",
        ],
    )

    add_heading(doc, "六 验证结果", 1)
    add_body(
        doc,
        "我使用相同输入验证优化前后差异：我在实习时负责过一个智能问答项目，知识库召回率一直不理想。优化后的 Dify 预览输出完整包含一段反馈、一个追问和四条回答思路；本地应用进一步确认三个区块均被正确渲染。",
    )

    add_heading(doc, "节点级耗时", 2)
    add_table(
        doc,
        ["节点", "模型或类型", "本轮耗时", "本轮 token"],
        [
            ["意图识别", "Qwen2.5 7B", "2.497 秒", "321"],
            ["Story 与缺口分析", "Gemini 2.5 Flash", "4.617 秒", "约 1,164"],
            ["知识检索", "9 个知识库 Top K 3", "20.9 毫秒", "不适用"],
            ["问题生成", "Gemini 2.5 Flash", "3.972 秒", "约 1,128"],
            ["代码与变量节点", "Dify 内置", "约 1.1 秒合计", "不适用"],
            ["工作流合计", "节点日志求和", "约 12.22 秒", "约 2,613"],
        ],
        widths=[4.2, 4.3, 3.2, 3.0],
    )

    add_heading(doc, "结果解释", 2)
    add_body(
        doc,
        "代表性单次测试由 31.55 秒降至约 12.22 秒，下降约 61.3%；总 token 由 5,906 降至约 2,613，下降约 55.8%。这说明本轮收益主要来自减少提示词输入和更换两个关键生成节点，而不是调整检索参数。",
    )
    add_body(
        doc,
        "这些数字是调试环境中的单次测量。模型供应商队列、冷启动和网络会造成波动，因此下一阶段需要至少采集三十到五十条样本，观察首 token、端到端耗时的 P50 和 P95，以及结构化成功率。",
    )

    add_heading(doc, "验收清单", 2)
    add_bullets(
        doc,
        [
            "Dify 工作流运行成功并完成发布。",
            "输出只包含一个下一问，不跨越多个信息层级。",
            "反馈、下一问和四条回答思路均被前端保留。",
            "前端生产构建通过，解析器独立样例通过。",
            "项目旧快照测试仍有两项失败，原因是缺失 _sites-preview/SkeletonPreview.tsx 和 codex-preview 元标签，与本轮业务代码无关。",
        ],
    )

    add_heading(doc, "七 面试中的 STAR 讲法", 1)
    add_heading(doc, "Situation", 2)
    add_body(
        doc,
        "我在做一款面向 AI 产品经理求职者的 STAR 面试教练。用户输入真实项目经历后，系统会持续追问并生成总结。初版的核心问题不是功能缺失，而是可用性不稳定：项目类回答通常需要二十秒以上，调试中还出现过数分钟等待；模型返回的 JSON 一旦畸形，前端就可能只展示 feedback 或直接暴露 {reply: ...}。",
    )

    add_heading(doc, "Task", 2)
    add_body(
        doc,
        "我的任务是同时改善响应速度和输出可靠性，又不能牺牲产品最重要的真实性原则。我需要找出真正的耗时节点，建立更适合模型的输出契约，并让前端在新旧返回格式下都不丢内容。",
    )

    add_heading(doc, "Action", 2)
    add_body(
        doc,
        "我先用 Dify 节点日志做基线和拆解，确认知识检索只有毫秒级，主要瓶颈是串行 LLM。随后把三个核心提示词从 8,919 字符压缩到 2,060 字符，并测试多个 Qwen 体量和结构化输出。小模型虽然更快，但会产生畸形 JSON；32B 更稳定，却出现 30.812 秒的单节点耗时。最终我将 Story 和问题生成切到 Gemini 2.5 Flash，把面向用户的 JSON 改成三段文本标记。前端则增加标记协议、旧 JSON 和纯文本三层解析，并在消息结束后渲染为三个独立区块。",
    )

    add_heading(doc, "Result", 2)
    add_body(
        doc,
        "在同一代表性输入上，工作流从 31.55 秒降到约 12.22 秒，下降约 61.3%；token 从 5,906 降到约 2,613。Dify 和本地应用的端到端测试都完整展示了反馈、下一问和四条回答思路。我还保留了旧格式兼容，避免工作流版本切换再次造成前端空白。",
    )

    add_heading(doc, "这段故事体现的能力", 2)
    add_bullets(
        doc,
        [
            "用节点数据而不是体感定位性能瓶颈。",
            "在速度、模型质量、格式稳定性和成本之间做取舍。",
            "把模型不确定性当作产品和工程契约问题处理。",
            "用端到端验证确认工作流修改真正改善了用户界面。",
        ],
    )

    add_heading(doc, "八 可直接使用的面试讲述稿", 1)
    add_heading(doc, "九十秒版本", 2)
    add_body(
        doc,
        "我做过一款基于 Dify 的 AI 产品经理面试教练，它不会直接替用户写答案，而是维护 Story State，每轮只追问一个最有价值的信息缺口。初版上线演示时有两个问题：项目类回答一次要三十秒左右，另外模型输出依赖 JSON，只要少一个引号，前端就可能只显示反馈，漏掉下一问和回答思路。",
    )
    add_body(
        doc,
        "我先看节点日志，发现知识检索只有约二十毫秒，真正的瓶颈是串行模型。我把三个核心提示词从 8,919 字符压到 2,060 字符，又测试了 4B、7B、9B、32B 和结构化输出。小模型快但 JSON 不稳定，32B 稳定但单节点最高达到 30.812 秒。最后我把 Story 和问题生成切到 Gemini 2.5 Flash，并把面向用户的 JSON 换成三个文本标记。前端同时支持新标记、旧 JSON 和纯文本回退。",
    )
    add_body(
        doc,
        "在同一条测试输入上，端到端节点耗时从 31.55 秒降到约 12.22 秒，下降约 61%；token 下降约 56%。最终页面能完整展示反馈、下一问和四条回答提示。这次优化让我验证了一点：做 LLM 产品不能只调 prompt，还要把模型选择、状态契约、前端容错和可观测性一起设计。",
    )

    add_heading(doc, "三分钟版本", 2)
    add_body(
        doc,
        "项目的目标用户是有真实项目经历、但不擅长把经历讲成 STAR 的 AI 产品经理求职者。我没有把它做成一个简历润色器，而是设计了一个多轮挖掘闭环：先把用户输入增量写入 Story State，再分析最高优先级缺口，按需检索 AIPM 能力知识，然后只追问一个问题。这样可以提高信息密度，也减少模型替用户编故事的风险。",
    )
    add_body(
        doc,
        "初版工作流能跑通，但面试展示时体验不好。一次项目输入需要 31.55 秒和 5,906 tokens；更糟的是，最终回复使用手写 JSON，模型偶尔会返回 answer_guidanceance 之类的错字段，甚至漏引号。前端解析成功时只拿 feedback，解析失败时又可能把 {reply: ...} 原样显示。用户会同时感受到慢和不可靠。",
    )
    add_body(
        doc,
        "我没有先去改 RAG，而是用节点日志拆开每一步。知识检索只占约二十毫秒，主要时间来自 Story State 和最终问题生成。第一步我压缩提示词，删除重复角色描述和大量解释，把总字符数降低 76.9%。第二步我做模型分层实验。4B 和 9B 有挂起，7B 的 Story JSON 不稳定，32B 虽然可解析但单节点曾达到 30.812 秒。最后采用 Gemini 2.5 Flash 处理两个复杂生成节点，意图识别保留 7B。第三步我重新设计输出契约：内部状态继续用 JSON，面向用户的回复改为本轮反馈、下一问、回答思路三个标记。前端按新标记、旧 JSON、纯文本三层解析。",
    )
    add_body(
        doc,
        "最终同一条输入的节点耗时约 12.22 秒，下降 61.3%；token 下降 55.8%。Dify 预览和本地生产构建的端到端测试都完整显示三段内容。这个结果还是单次调试数据，下一步我会做三十到五十条回归集，观察 P50、P95、结构化成功率和追问重复率，并为模型供应商增加超时和回退策略。",
    )

    add_heading(doc, "九 面试官追问准备", 1)
    add_table(
        doc,
        ["可能追问", "回答要点"],
        [
            ["为什么不直接用一个大模型完成所有步骤", "状态更新 缺口选择和展示生成承担不同职责。拆分便于观察和替换，但串行节点过多会增加时延，所以后续可合并只在满足可观测性和回归测试后进行。"],
            ["为什么最终不用严格 JSON", "内部状态仍需要 JSON。面向用户的自然语言不需要深层序列化，用浅标记更符合模型能力，前端仍能稳定切分。"],
            ["如何证明回答质量没有下降", "当前证据是同一用例的事实承接 单一追问和完整 guidance。生产级证明还需要人工评分集和重复率 虚构率等指标。"],
            ["RAG 为什么不是瓶颈", "节点日志显示检索约 20.9 毫秒，远低于两个生成节点。它仍需做召回质量评估，但不是本轮时延优先项。"],
            ["如何防止 AI 编造用户经历", "Story State 只增量记录明确事实；不确定内容进入 uncertain_facts；问题生成只能提供回忆入口；最终总结对缺失内容标记待补充。"],
            ["如果 Gemini 服务波动怎么办", "设置节点超时和失败分支，准备可替换的快速模型，记录供应商错误率，并在前端区分网络 模型和解析错误。"],
            ["下一步最优先做什么", "先轮换已暴露的 API Key，再建立三十到五十条回归集和端到端埋点，得到 P50 P95 和结构化成功率。"],
        ],
        widths=[4.2, 10.6],
        font_size=8.9,
    )

    add_heading(doc, "十 后续路线", 1)
    add_numbered(
        doc,
        [
            "轮换 Dify API Key，并确认生产和本地环境均只在服务端读取。",
            "建立三十到五十条覆盖不同项目类型的回归集，记录事实准确率、追问重复率和虚构率。",
            "采集首 token、端到端耗时、P50、P95、模型错误率和解析回退率。",
            "为关键模型节点增加超时、失败分支和供应商回退，避免单节点无限等待。",
            "根据首轮意图和缺口决定是否检索，减少不必要的上下文输入。",
            "评估将 Story 更新和追问生成合并为一次调用，但必须保留结构化状态和可回归性。",
            "修复项目旧快照测试的缺失文件和元标签，让 CI 同时覆盖页面骨架和业务解析。",
        ],
    )

    add_heading(doc, "结论", 1)
    add_body(
        doc,
        "这次优化没有把问题简单归结为模型太慢。我通过节点日志定位瓶颈，用提示词压缩和模型重选降低时延，再用更适合自然语言模型的输出协议和前端多层容错解决内容丢失。最终版本已经发布并通过端到端展示验证，也留下了明确的安全动作和量化评测计划。",
    )

    core = doc.core_properties
    core.title = "AI 面试教练产品优化故事"
    core.subject = "Dify 工作流性能与结构化输出优化复盘"
    core.author = "AI 面试教练项目"
    core.keywords = "AI 产品经理, Dify, STAR, RAG, 产品优化, 面试"

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build_document()
