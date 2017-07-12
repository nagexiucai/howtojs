#!/usr/bin/env python
#coding=UTF-8

import requests
import threading
import time
import re

gLock = threading.Lock()


class MThread(threading.Thread):

    def __init__(self, lock, name):
        super(MThread, self).__init__(name=name)
        self.lock = lock

    def run(self):
        while True:
            self.lock.acquire()
            pass # let cpu core do something solely
            self.lock.release()

def UThread(target, params, name):
    return threading.Thread(target=target, args=params, name=name) # call start to work

class ProxyEntry(object):
    def __init__(self, ip, p, t, trans, conn, vrfd):
        self.ip = ip
        self.port = p
        self.type = t
        self.transport = trans
        self.connection = conn
        self.vrfd = vrfd
    def __cmp__(self, other):
        return min((self.vrfd,self.connection,self.transport),(other.vrfd,other.connection,other.transport))
    def __str__(self):
        print("-----")
        print(self.ip)
        print(self.port)
        print(self.type)
        print(self.transport)
        print(self.connection)
        print(self.vrfd)
    __unicode__ = __str__
    def __repr__(self):
        print(id(self),self.ip,self.port,self.type,self.transport,self.connection,self.vrfd)

reXiCiTr = re.compile("<tr class=.*?>(.*?)</tr>", re.S)
reXiCiPages = re.compile('\.{3}</span>.*>(\d+)</a> <a class="next.*?>下一页')
reXiCiIP = re.compile("<td>(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})</td>")
reXiCiPort = re.compile("<td>(\d+)</td>")
reXiCiType = re.compile("<td>(HTTP.*?|socks.*?)</td>", re.I)
reXiCiSpeed = re.compile('title="(.*?)秒"')
reXiCiVerified = re.compile("\d{2}\-\d{2}\-\d{2} \d{2}:\d{2}")
def countXiCi(text):
    n, = reXiCiPages.findall(text)
    return int(n)
def parseXiCi(text):
    trs = reXiCiTr.findall(text)
    data = []
    for tr in trs:
        ip, = reXiCiIP.findall(tr)
        p, = reXiCiPort.findall(tr)
        t, = reXiCiType.findall(tr)
        transport, connection = reXiCiSpeed.findall(tr)
        transport = float(transport)
        connection = float(connection)
        vrfd, = reXiCiVerified.findall(tr)
        vrfd = time.strptime(vrfd, "%y-%m-%d %H:%M")
        pe = ProxyEntry(ip,p,t,transport,connection,vrfd)
        data.append(pe)
    return data
def XiCi(url, **kwargs):
    print("=========")
    text = requests.get(url, **kwargs).text
    print(text)
    n = countXiCi(text)
    i = 1
    data = []
    while i <= n:
        data.extend(parseXiCi(requests.get(url+i, **kwargs).text))
        i += 1
    return data
def testXiCi():
    with open("./proxy-xicidaili-nn.txt", encoding="UTF-8") as txt:
        texts = txt.readlines()
        text = "".join(texts)
        parseXiCi(text)


class Proxy(object):
    ProxySources = [("http://www.xicidaili.com/nn/", XiCi, {"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8","User-Agent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"})] # configure proxy sources url
    ConnectTimeout = 4.5
    ReadTimeout = 9.5
    MaxTries = 3
    ProxyPool = []
    Interval = 30

    @staticmethod
    def Update():
        while True:
            time.sleep(Proxy.Interval)
            for source, method, headers in Proxy.ProxySources:
                try:
                    proxies = method(source, headers=headers)
                    Proxy.ProxyPool.extend(proxies)
                except requests.ConnectionError:
                    print("source expired: " + source)
                except requests.Timeout:
                    print("source is too slowly: " + source)
            gLock.acquire()
            Proxy.ProxyPool.sort()
            gLock.release()

    def __init__(self):
        self.TestThread = MThread(gLock, "TestProxyPool") # test existing proxy for filtering
        self.UpdateThread = UThread(Proxy.Update, "", "UpdateProxyPool") # update proxy pool

    def ProxiesGenerator(self):
        return Proxy.ProxyPool

    def IsReady(self):
        return False

    def Wait(self):
        self.TestThread.start()
        self.UpdateThread.start()
        while not self.IsReady():
            print("wait ...")
            Ellipsis

if __name__ == "__main__":
    testXiCi()
    # Proxy().Wait()
