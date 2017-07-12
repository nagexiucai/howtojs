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
    Interval = 2

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
    # 现行点前十二位yyyyabtvwxyz.m
    # 四位公元+两位年代+一位类型+五位序列+一位机码（点号前八位按位和“23456789”加权和取11的余数10记为X）
    # 兼容点前九位旧码
    PatentNumber = FIND.compile('SQH="(\d{9,12}\.\w{1})"', FIND.S)
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

    def __init__(self, entry, headers={}, params={}, json={}, proxies={}, timeout=(9, 29)):
        self.entry = entry
        self.headers = headers
        self.params = params
        self.json = json
        self.proxies = proxies
        self.timeout = timeout
        self.data = []
        self.log = open("./log.txt", "a")

    def __del__(self):
        self.log.close()

    def creep(self):
        LORD.sleep(Creeper.Interval)
        print("## " + self.entry)
        try:
            responses = Creeper.request(self.entry, "GET", headers=self.headers, params=self.params, json=self.json, proxies=self.proxies, timeout=self.timeout)
            print("$$ " + responses.url)
        except HTTP.Timeout:
            self.creep()
        else:
            print(responses.text.encode(responses.encoding).decode("utf-8"), file=self.log)
            future, data = Creeper.ut(responses.text)
            if not data:
                self.creep()
            else:
                self.data.extend(data)
                for ft in future:
                    self.entry = "http://www.soopat.com" + ft # TODO: adjust other options
                    self.params = {} # Next's URI is intact
                    self.creep()

    @staticmethod
    def request(entry, method, **kwargs):
        if kwargs.get("proxies"):
            httpproxy, httpsproxy = Creeper.PrettyProxy.ProxiesGenerator()
            kwargs.update({"proxies": {"http": httpproxy, "https": httpsproxy}})
        if method == "GET":
            return HTTP.get(entry, **kwargs)
        if method == "POST":
            return  HTTP.post(entry, **kwargs)
        raise ValueError("invalid method %s" % method)

    def export(self):
        with open("./data.txt", "a") as db:
            print(self.data, file=db)

    @staticmethod
    def creepy(entry, test=""):
        data = {"inventors": []}
        for r in (Creeper.PatentAbstractFull, Creeper.PatentInventors, Creeper.PatentInventor):
            s = test or Creeper.request(entry, "GET").text
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
                        item["suburl"] = m.split(".")[0] # patent's details page url
                        item["number"] = m
                        print(m)
                        # if not text:
                        #     Creeper.creepy(None, Creeper.PatentAbstractFullCase)
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
                #     item.update(Creeper.creepy("http://www.soopat.com/Patent/" + item.pop("suburl"))
                data.append(item)
        return future, data

# Creeper.ut()

creeper = Creeper(entry="http://www.soopat.com/Home/Result",
                  params={"SearchWord": "开关", "FMZL": "Y", "SYXX": "Y", "PatentIndex": 160},
                  proxies=True)
try:
    creeper.creep()
finally:
    creeper.export()
