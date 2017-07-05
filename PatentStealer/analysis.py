#/usr/bin/env python
#coding=utf-8

import jieba
import wordcloud as WC
import numpy as MATH
import re as NORM
from scipy.misc import imread as IMGR
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
counter = Counter()
eraser = NORM.compile("(\w\w+)")
suberaser = NORM.compile("^[^a-zA-Z0-9]+$")
for piece in data:
    pcounter = Counter()
    for p in jieba.cut(piece.get("name")):
        if eraser.findall(p):
            pcounter[p] += 1
    for p in jieba.cut(piece.get("abstract")):
        if eraser.findall(p) and suberaser.match(p):
            pcounter[p] += 1
    words[piece.get("number")] = pcounter
    counter.update(pcounter)
numbers = list(words.keys())
numbers.sort()
for number in numbers:
    print(number)
print(counter.most_common(int(round(len(number)*0.8))))

wccfg = {
    "width": 640,
    "height": 480,
    "background_color": "white",
    # "mode": "RGBA", # use this with background color is None
    "mask": IMGR("./bg-award.jpg"), # 塑形图模
    "stopwords": WC.STOPWORDS, # 忽略词集
    "font_path": "./msyh.ttf",
    "max_font_size": 72,
    "min_font_size": 12,
    "max_words": 1024
}
wc = WC.WordCloud(**wccfg) # TODO: how to make some image overlay with words
wc.generate_from_frequencies(dict(counter))
wc.to_file("./wc-patent.png")

SHOW.figure() # TODO: obsessive-compulsive disorder(ocd) can not tolerate figure's default title of window
SHOW.title("wc-patent")
SHOW.imshow(wc)
SHOW.axis("off")
SHOW.show() # 进入绘图窗口

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

# SCC = [
#     "加",
#     "减",
#     "乘",
#     "除",
#     "与",
#     "或",
#     "非",
#     "是",
#     "否",
#     "好",
#     "坏",
#     "有",
#     "没",
#     "大",
#     "小",
#     "多",
#     "少",
#     "黑",
#     "白",
#     "美",
#     "丑",
#     "简",
#     "繁",
#     "的",
#     "地",
#     "得",
#     "法",
#         "法律",
#         "法规"
# ]