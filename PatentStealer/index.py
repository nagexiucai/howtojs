#!/usr/bin/env python
#coding=UTF-8

import requests as HTTP
import re as FIND
import time as LORD
# import pytesseract
# from PIL import Image
# import sys, os
#
#
# print(os.getcwd())
# image = Image.open("C:/eclipse/workspace/howtojs/PatentStealer/code.gif")
# code = pytesseract.image_to_string(image)
# print(code)
# sys.exit()
from proxy import Proxy


class Creeper(object):
    DeepLimit = 3
    Interval = 1000

    PrettyProxy = Proxy()
    PrettyProxy.Wait()

    NextCase = '<span></span><a href="/Home/Result?SearchWord=***" class="next">下一页</a><div></div>'
    Next = FIND.compile('</span>\s*?<a href="(.*?)" class="next">', FIND.S)
    PatentBlockCase = '''
...</div>
<div class="PatentBlock">
    <div>
        <font><input SQH="200002666666.8" MC='一种视频检索方法'/>[发明]</font>
        <a href='/Patent/200002666666'>一种<font>视频检索</font>方法 - <font>200002666666.8</font></a>
        <span class="PatentAuthorBlock">申请人：<a>北京航天测控技术有限公司</a></span>
        <span class="PatentContentBlock">摘要:本发明提出了一种<font class='rh'>视频检索</font>方法</span>
    </div>
</div>
<div>...
'''
    PatentBlock = FIND.compile('<div class="PatentBlock".*?>(.*?</div>)\s*?</div>', FIND.S)
    PatentName = FIND.compile("MC='(.*?)'", FIND.S)
    PatentNumber = FIND.compile('SQH="(\d{12}\.\w{1})"', FIND.S) # yyyyabtvwxyz.m ~ 四位公元+两位年代+一位类型+五位序列+一位机码（点号前八位按位和“23456789”加权和取11的余数10记为X）
    PatentProposer = FIND.compile('申请人：<a.*?>(.*?)</a>', FIND.S)
    PatentAbstract = FIND.compile('摘要:(.*?)</span>', FIND.S)

    PatentAbstractFullCase = '''
<td class="sum">
<b class="black">摘要：</b>本发明提供了一种……
</td>
<td>
<b class="black">发明(设计)人：</b>
<a>张三</a>
<a>李四</a>
</td>
'''
    PatentAbstractFull = FIND.compile('摘要：</b>(.*?)</td>', FIND.S)
    PatentInventors = FIND.compile('发明\(设计\)人：</b>(.*?)</td>', FIND.S)
    PatentInventor = FIND.compile('<a.*?>(.*?)<', FIND.S)

    TagErase = FIND.compile('<.*?>', FIND.S)

    def __init__(self, entry, headers={}, params={}, json={}, proxies={}):
        self.entry = entry
        self.headers = headers
        self.params = params
        self.json = json
        self.proxies = proxies
        self.data = []
        self.log = open("./log.txt", "a")

    def __del__(self):
        self.log.close()

    def creep(self):
        print(self.entry)
        try:
            responses = HTTP.get(self.entry, headers=self.headers, params=self.params, json=self.json, proxies=self.proxies, timeout=(4, 9))
        except HTTP.Timeout:
            self.proxies = {"http":"http://61.136.163.247:3218",
                            "https": "http://218.29.111.106:9999"}
            self.creep()
        else:
            print(responses.text.encode(responses.encoding).decode("utf-8"), file=self.log)
            future, data = Creeper.ut(responses.text)
            if not data:
                self.proxies = {"http": "http://60.176.149.171:8123",
                                "https": "http://122.245.70.120:808"}
                self.creep()
            else:
                self.data.extend(data)
                for ft in future:
                    self.entry = "http://www.soopat.com" + ft
                    self.creep()
                    LORD.sleep(Creeper.Interval)

    def export(self):
        with open("./data.txt", "a") as db:
            print(self.data, file=db)

    @staticmethod
    def creepy(entry, test=""):
        data = {"inventors": []}
        for r in (Creeper.PatentAbstractFull, Creeper.PatentInventors, Creeper.PatentInventor):
            s = test or HTTP.get(entry).text
            # print(s)
            for m in r.findall(s):
                if r is Creeper.PatentAbstractFull:
                    print("PAF: " + m)
                    data["abstract"] = m
                # if r is Creeper.PatentInventors:
                #     print("PIs: " + m)
                if r is Creeper.PatentInventor:
                    print("PI: " + m)
                    data["inventors"].append(m)
        return data

    @staticmethod
    def ut(text=""):
        future = []
        for n in Creeper.Next.findall(text or Creeper.NextCase):
            # print(n)
            future.append(n)
        data = []
        for p in Creeper.PatentBlock.findall(text or Creeper.PatentBlockCase):
            print("//////////////////////////////")
            item = {}
            for r in (Creeper.PatentName, Creeper.PatentNumber, Creeper.PatentProposer, Creeper.PatentAbstract):
                for m in r.findall(p): # only one matched
                    if r is Creeper.PatentNumber:
                        print(m.split(".")[0]) # patent's details page url
                        item["number"] = m
                        # if not text:
                        #     Creeper.creepy("", Creeper.PatentAbstractFullCase)
                        continue
                    if r is Creeper.PatentAbstract:
                        nm, count = Creeper.TagErase.subn("", m)
                        print(nm)
                        item["abstract"] = nm
                        continue
                    if r is Creeper.PatentName:
                        item["name"] = m
                    if r is Creeper.PatentProposer:
                        item["proposer"] = m
                    print(m)
            if item:
                # if text:
                #     item.update(Creeper.creepy("http://www.soopat.com/Patent/" + item["number"].split(".")[0]))
                data.append(item)
        return future, data

# Creeper.ut()

creeper = Creeper(entry="http://www.soopat.com/Home/Result?SearchWord=%E8%A7%86%E9%A2%91%E6%A3%80%E7%B4%A2&FMZL=Y&SYXX=Y&PatentIndex=160",
                  params={"SearchWord": "视频检索", "FMZL": "Y", "SYXX": "Y"},
                  proxies={
                      "http": "http://220.174.236.211:80",
                      "https": "http://123.207.99.84:3128"})
try:
    creeper.creep()
finally:
    creeper.export()
