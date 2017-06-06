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
    switch: {},
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

function id2object(_) {
    if (typeof(_) != "object") {
        return document.getElementById(_);
    }
    return _;
}
function shown(x) {
    id2object(x).setAttribute("style", "display:inherit;");
}
function hiden(x) {
    id2object(x).setAttribute("style", "display:none;");
}
function toggle(x) {
    var _ = id2object(x);
    var __ = _.getAttribute("soh");
    if (__ == "shown") {
        hiden(_);
        _.setAttribute("soh", "hiden");
    }
    else {
        shown(_);
        _.setAttribute("soh", "shown");
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
}

function WhatIsTheNext() {
    alert("That depends on U!");
}

initialize();