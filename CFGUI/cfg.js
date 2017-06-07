// https://github.com/nagexiucai/howtojs

// TODO: synchronize data by ajax
var cfg = {
    mainboard: {},
    cpu: {},
    gpu: {},
    memory: {},
    disk: {},
    netcard: {},
    router: {},
    switcher: {},
    firewall: {},
    template: [
        {name:"",feature:[]},
        {name:"",feature:[]},
        {name:"",feature:[]},
        {name:"",feature:[]},
        {name:"",feature:[]},
    ],
};

var start = document.getElementById("start");
var message = document.getElementById("message");
var state = document.getElementById("state");
var owner = document.getElementById("owner");
var stamp = document.getElementById("stamp");
var paper = document.getElementById("paper");
var grid = document.getElementById("grid");
var pc = document.getElementById("paper-curosr");

function id2object(_) {
    if (typeof(_) != "object") {
        return document.getElementById(_);
    }
    return _;
}
function shown(x) {
    id2object(x).setAttribute("style", "display:inherit;");
}
function hidden(x) {
    id2object(x).setAttribute("style", "display:none;");
}
function toggle(x) {
    var _ = id2object(x);
    var __ = _.getAttribute("soh");
    if (__ == "shown") {
        hidden(_);
        _.setAttribute("soh", "hidden");
    }
    else {
        shown(_);
        _.setAttribute("soh", "shown");
    }
}
function sign(what, checked, unchecked) {
    var lis = what.parentNode.getElementsByTagName("li");
    for (var n=0; n<lis.length; n++) {
        if (lis[n]!=what) {
            lis[n].setAttribute("state", "unchecked");
        }
        lis[n].setAttribute("style", unchecked || "background-color:white;color:black;");
    }
    if (what.getAttribute("state") == "unchecked") {
        what.setAttribute("state", "checked");
        what.setAttribute("style", checked || "background-color:green;color:white;");
    }
    else {
        what.setAttribute("state", "unchecked");
    }
}
function drawGrid(cv, step) {
    var ctx = cv.getContext("2d");
    cv.k = step || 32;
    var m = Math.floor(cv.width / cv.k);
    var n = Math.floor(cv.height / cv.k);
    console.log(m);
    console.log(n);
    for (var x=1; x<m; x++) {
        for (var y=1; y<n; y++) {
            var p = x * cv.k;
            var q = y * cv.k;
            var d = cv.k / 2;
            ctx.lineWidth = 0.2;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(p-d, q);
            ctx.lineTo(p+d, q);
            ctx.moveTo(p, q-d);
            ctx.lineTo(p, q+d);
            ctx.stroke();
            ctx.closePath();
        }
    }
}
function getLocation(x, y) {
    var bbox = grid.getBoundingClientRect();
    return {
        x: (x - bbox.left) * (grid.width / bbox.width),
        y: (y - bbox.top) * (grid.height / bbox.height)

        /* 此处不用下面两行是为了防止使用CSS和JS改变了canvas的高宽之后是表面积拉大而实际
         * 显示像素不变而造成的坐标获取不准的情况
        x: (x - bbox.left),
        y: (y - bbox.top)
        */  
    };  
}
function um() {
    var userManualLayer = document.createElement("div");
    var userManualPictureWrap = document.createElement("div");
    var userManualPicture = document.createElement("img");
    userManualLayer.setAttribute("id", "um");
    userManualLayer.setAttribute("style", "position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.75);");
    userManualLayer.setAttribute("onclick", "closeUM();");
    userManualPictureWrap.setAttribute("style", "width:800px;margin:auto;overflow-y:auto;");
    userManualPicture.setAttribute("alt", "用户手册");
    userManualPicture.setAttribute("src", "./um-overview.png");
    userManualPictureWrap.appendChild(userManualPicture);;
    userManualLayer.appendChild(userManualPictureWrap);
    document.body.appendChild(userManualLayer);
}
function closeUM() {
    document.body.removeChild(document.getElementById("um"));
}

function initialize() {
    message.innerHTML = "<a href='javascript:um();' style='font-size:15px;color:white;text-decoration-line:none;'>用户手册</a>";
    state.innerHTML = "Ready";
    owner.innerHTML = "NageXiucai";
    stamp.innerHTML = "201706051005";
    drawGrid(grid);
    grid.onmousemove = function(evt) {
        // TODO: optimize the algorithm to accelerate locating
        var lc = getLocation(evt.clientX, evt.clientY);
        var ctx = paper.getContext("2d");
        if (((Math.pow(lc.x%grid.k,2) + Math.pow(lc.y%grid.k,2)) < Math.pow(grid.k/2,2)) && (lc.x > grid.k/2 && lc.y > grid.k/2)) {
            if (grid.dotx && grid.doty) {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(grid.dotx,grid.doty,6,0,2*Math.PI);
                ctx.fill();
                ctx.closePath();
            }
            grid.dotx = Math.floor(lc.x/grid.k)*grid.k;
            grid.doty = Math.floor(lc.y/grid.k)*grid.k;
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(grid.dotx,grid.doty,5,0,2*Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    };
    grid.onmousedown = function(evt) {
        var lc = getLocation(evt.clientX, evt.clientY);
        console.log("set device on " + lc.x + " " + lc.y);
    };
    grid.onmouseleave = function(evt) {
        var ctx = paper.getContext("2d");
        if (grid.dotx && grid.doty) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(grid.dotx,grid.doty,6,0,2*Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    };
}

function dispatch(what) {
    var todo = what.innerHTML;
    sign(what);
}

function select(what) {
    sign(what);
}

function mode(m) {
    // TODO: change class instead of changing style to avoid cursor-*'s repeated loading
    var cursor = "{cursor:move;}";
    switch(m) {
        case "mainboard": {
            cursor = "{cursor:url('./cursor-mainboard.png'),default;}";
            break;
        }
        case "cpu": {
            cursor = "{cursor:url('./cursor-cpu.png'),default;}";
            break;
        }
        case "gpu": {
            cursor = "{cursor:url('./cursor-gpu.png'),default;}";
            break;
        }
        case "memory": {
            cursor = "{cursor:url('./cursor-memory.png'),default;}";
            break;
        }
        case "disk": {
            cursor = "{cursor:url('./cursor-disk.png'),default;}";
            break;
        }
        case "netcard": {
            cursor = "{cursor:url('./cursor-netcard.png'),default;}";
            break;
        }
        case "router": {
            cursor = "{cursor:url('./cursor-router.png'),default;}";
            break;
        }
        case "switcher": {
            cursor = "{cursor:url('./cursor-switcher.png'),default;}";
            break;
        }
        case "firewall": {
            cursor = "{cursor:url('./cursor-firewall.png'),default;}";
            break;
        }
        default: {
            break;
        }
    }
    pc.innerHTML = ".canvas:hover" + cursor;
}

function WhatIsTheNext() {
    alert("That depends on U!");
}

initialize();