#!/usr/bin/env python
#coding=utf-8

import requests
import re
import pprint
import time
import gzip
import sys
from collections import Counter

reload(sys)
sys.setdefaultencoding("utf-8")


entry = re.compile("<A href=['\"](.+?author.html)['\"]>")
name = re.compile("<I>(.+?)</I>", re.S)

URL = "http://lists.openstack.org/pipermail/openstack-dev/"

headers = {
    "User-Agent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36"
}

r = requests.get(URL, headers=headers)
entries = entry.findall(r.text)
pprint.pprint(entries)

names = Counter()
for _ in entries:
    time.sleep(3)
    url = URL + _
    # print url
    __ = requests.get(url, headers=headers)
    html = __.text.encode(__.encoding) # TODO: 还原以猜测的encoding解码的文本
    # print html
    ___ = [nm.strip() for nm in name.findall(html)]
    # pprint.pprint(___)
    names.update(Counter(___))
    break

pprint.pprint(names)
for each in names.keys():
    try:
        print each.decode("ISO8859-1")
    except:
        print each
