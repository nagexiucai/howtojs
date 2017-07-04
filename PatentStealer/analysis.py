#/usr/bin/env python
#coding=utf-8

import jieba
import PIL
import wordcloud as WC
import numpy as MATH
from matplotlib import pyplot as SHOW
from collections import Counter


state = "begin"
count = 0
data = []
with open("./AVsearch.data", encoding="UTF-8") as df:
    item = []
    for line in df:
        line = line.strip()
        if line.startswith("#"):continue
        if line:
            state = "do"
        else:
            state = "parse"
        if state == "do":
            item.append(line)
        if state == "parse" and item:
            data.append(dict(zip(("name", "number", "proposer", "abstract"), item)))
            item[:] = []
# print(data)
# print("there are",len(data), "pieces in total")

words = {}
for piece in data:
    t = list(jieba.cut(piece.get("name")))
    t.extend(list(jieba.cut(piece.get("abstract"))))
    words[piece.get("number")] = t
numbers = list(words.keys())
numbers.sort()
counter = Counter()
for number in numbers:
    print(number)
    counter[number] += 1

wc = WC.WordCloud()
wc.generate_from_frequencies(dict(counter))

SHOW.figure()
SHOW.imshow(wc)
SHOW.axis("off")
SHOW.show()


# 热点
# 常用
# 生僻

# 拼音
# 声调：I II III IIII V（轻）
# 语气：陈述 强调 疑问 反问

# 拟声
# 形声
# 象形

# 组合：单词 双词 三词 四词 多词 专用

# TODO: 思考孩子从上幼儿园到小学毕业积累字词句的过程

SCC = [
    "加",
    "减",
    "乘",
    "除",
    "与",
    "或",
    "非", "没",
    "的",
    "好",
    "有",
    "法",
        "法律",
        "法规",
    "大",
    "小",
    "多",
    "少",
    "黑",
    "白",
    "美",
    "丑",
    "简",
    "繁"
]
