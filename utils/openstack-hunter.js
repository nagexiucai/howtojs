/**
 * 某司花大价钱挖了个OpenStack方面的专家担任CTO
 * 简历显示：IBM（云平台项目经理）、苏宁（云平台技术总监）、思源（常务副总），基本都是一年就跳槽
 * 自称曾带六个新手三个月拿下IBM云平台项目并在某次峰会大放异彩
 * 那个秀才好事，打算写个脚本摸底
 * 
 * 数据来源——
 * OpenStack女队：http://lists.openstack.org/pipermail/women-of-openstack/
 * OpenStack开发者：http://lists.openstack.org/pipermail/openstack-dev/
 * OpenStack普通用户：http://lists.openstack.org/pipermail/openstack/
 * OpenStack文档贡献组：http://lists.openstack.org/pipermail/openstack-docs/
 * OpenStack特殊兴趣团队：http://lists.openstack.org/pipermail/openstack-sigs/
 */

var http = require("http");
var entry = /<A href=['"](.+?author\.html)['"]>/g;
var entry_ = /<A href=['"](.+?author\.html)['"]>/;
var name = /<I>(.+)/g;
var name_ = /<I>(.+)/;

var root = "http://lists.openstack.org/pipermail/";
var entries = ["openstack/", "openstack-dev/", "openstack-docs/", "openstack-sigs/", "women-of-openstack/"];
for (var m=0; m<entries.length; m++) {
    var url = root + entries[m];
    console.log("=====", url , "=====");
    http.get(url, function(req, res){
        var html = "";
        req.on("data", function(data){
            html += data;
        });
        req.on("end", function(){
            var _ = html.match(entry);
            for (var n=0; n<_.length; n++) {
                var url = root + entries[m] + _[n].match(entry_)[1];
                console.log("-----", url, "-----");
                http.get(url, function(req, res){
                    var html = "";
                    req.on("data", function(data){
                        html += data;
                    });
                    req.on("end", function(){
                        console.log(html);
                        var __ = html.match(name);
                        __.forEach(element => {
                            console.log(element.match(name_)[1]);
                        });
                    });
                });
                break;
            }
        });
    });
    break;
}

/*
var options = {
    hostname: "lists.openstack.org",
    path: "/pipermail/openstack-dev/",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36"
    }
};

var req = http.request(options, function(res){
    var html = "";
    res.on("data", function(data){
        html += data;
    });
    res.on("end", function(){
        console.log(html);
    });
});

req.on("error", function(error){
    console.log(error);
});

req.end();
*/
