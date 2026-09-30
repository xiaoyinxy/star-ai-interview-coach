# 基于STAR法则的AI产品经理面试官——调试步骤

1.2026.6.10第一次调试，等待时长为5分钟；添加了过多agent，大模型没有都选择简单的



2.rag分块问题以及召回问题，通过添加metadata以及意图识别来更好的匹配到rag



8.19日

响应过慢，平均需要20秒；state_parser单个模型要2min？？？

答非所问：问题是我认为最棘手的问题是在构建知识库的过程中召回率始终过低；回答却是你们当时为什么会想做这个智能健身问答助手？最初是发现了健身用户的什么问题？ 原因是prompt



大模型的回答需要120秒；1.修改prompt压缩 2.模型分层 3.减少think 4.合并思维链



8.21日

构建评测集，自动化回归测试

![image-20260821160910935](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20260821160910935.png)





![image-20260824150552093](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20260824150552093.png)

8.26

切换意图识别prompt，换模型，微调方案（舍弃），改变模型的输出结果换为1-2-3等，调整temperature；

合并story_parser和gap_analyser以及irreval_question，用思维链的模式安排大模型，使之速度更快

![image-20260826124728029](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20260826124728029.png)
