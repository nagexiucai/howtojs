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
    return {"HTTP": [], "HTTPS": []}


class Proxy(object):
    ProxySources = [("http://www.xicidaili.com/nn/", XiCi)] # configure proxy sources url
    ConnectTimeout = 4.5
    ReadTimeout = 9.5
    MaxTries = 3
    ProxyPool = {"HTTP": ["http://ip:port"], "HTTPS": ["http://ip:port"]}

    @staticmethod
    def Update():
        for source, method in Proxy.ProxySources:
            try:
                proxies = method(requests.get(source).text)
                Proxy.ProxyPool["HTTP"].extend(proxies["HTTP"])
                Proxy.ProxyPool["HTTPS"].extend(proxies["HTTPS"])
            except:
                print("source expired: " + source)

    def __init__(self):
        self.TestThread = MThread(MThread.Lock, "TestProxyPool") # test existing proxy for filtering
        self.UpdateThread = UThread(Proxy.Update, "", "UpdateProxyPool") # update proxy pool

    def ProxiesGenerator(self):
        return Proxy.ProxyPool["HTTP"][0], Proxy.ProxyPool["HTTPS"][0]

    def Wait(self):
        while not (Proxy.ProxyPool["HTTP"] and Proxy.ProxyPool["HTTPS"]):
            print("wait ...")
            Ellipsis
