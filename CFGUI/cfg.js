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

function initialize() {
    message.innerHTML = "NULL";
    state.innerHTML = "Ready";
    owner.innerHTML = "Anonymous";
    stamp.innerHTML = "9527";
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