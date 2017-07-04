#!/usr/bin/env python
#coding=UTF-8

import requests
import threading


class MThread(threading.Thread):
    Lock = threading.Lock()

    def __init__(self, lock, name):
        super(MThread, self).__init__(name=name)
        self.lock = lock

    def run(self):
        self.lock.acquire()
        pass # let cpu core do something solely
        self.lock.release()


def UThread(target, params, name):
    return threading.Thread(target=target, args=params, name=name) # call start to work


def XiCi(text):
    print("=========")
    print(text)
    return {"HTTP": [], "HTTPS": []}


class Proxy(object):
    ProxySources = [("http://www.xicidaili.com", XiCi)] # configure proxy sources url
    ConnectTimeout = 4.5
    ReadTimeout = 9.5
    MaxTries = 3
    ProxyPool = {"HTTP": ["http://121.206.55.223:808"],"HTTPS": ["http://127.0.0.1:8087"]}

    @staticmethod
    def Update():
        for source, method in Proxy.ProxySources:
            try:
                proxies = method(requests.get(source).text)
                Proxy.ProxyPool["HTTP"].extend(proxies["HTTP"])
                Proxy.ProxyPool["HTTPS"].extend(proxies["HTTPS"])
            except requests.ConnectionError:
                print("source expired: " + source)
            except requests.Timeout:
                print("source is too slowly: " + source)

    def __init__(self):
        self.TestThread = MThread(MThread.Lock, "TestProxyPool") # test existing proxy for filtering
        self.UpdateThread = UThread(Proxy.Update, "", "UpdateProxyPool") # update proxy pool

    def ProxiesGenerator(self):
        return Proxy.ProxyPool["HTTP"][0], Proxy.ProxyPool["HTTPS"][0]

    def Wait(self):
        self.TestThread.start()
        self.UpdateThread.start()
        while not (Proxy.ProxyPool["HTTP"] and Proxy.ProxyPool["HTTPS"]):
            print("wait ...")
            Ellipsis
