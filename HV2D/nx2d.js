// https://github.com/nagexiucai/howtojs

var environments = function () {
    var width = document.body.clientWidth;
    var height = document.body.clientHeight;
    var cvetts = document.getElementById("canvas-entities");
    var cvblts = document.getElementById("canvas-bullets");
    cvetts.width=cvblts.width=width,cvetts.height=cvblts.height=height;
    var sndemit = document.getElementById("audio-emit");
    var sndburst = document.getElementById("audio-burst");

    return {
        width: width,
        height: height,
        ctxetts: cvetts.getContext("2d"),
        ctxblts: cvblts.getContext("2d"),
        sndemit: sndemit,
        sndburst: sndburst
    };
};
var cfg = undefined;
var entities = [];
var ticks = 0;

// 判定内点
function pointin(p, plg) {
    for (var c = false, i = -1, l = plg.length, j = l - 1; ++i < l; j = i) {
        ((plg[i].y <= p.y && p.y < plg[j].y) || (plg[j].y <= p.y && p.y < plg[i].y)) && (p.x < (plg[j].x - plg[i].x) * (p.y - plg[i].y) / (plg[j].y - plg[i].y) + plg[i].x) && (c = !c);
    }
    return c;
}

// 计算平面上已知顶点和所过另外一点坐标二次解析参数
// TODO: 由于计算精度损失导致起止点水平或垂直接近时失效
function quadratic(vertex, another) {
    /* ax^2 + bx + c = y
    ** vertex == P(x1,y1)
    ** another == P(x2,y2)
    ** 必过another的抛物线轴对称点 ? = P(2*x1-x2,y2)
    ** 其实是平面上已知不重复三点可确定一条抛物线的通用法则
    */

    var a = ((another.y - vertex.y) * vertex.x) / Math.pow(vertex.x - another.x, 3);
    var b = ((vertex.y - another.y) / (vertex.x - another.x)) - (a * (vertex.x + another.x));
    var c = vertex.y - (a * Math.pow(vertex.x, 2)) - (b * vertex.x);

    return function (x) {
        return a*Math.pow(x,2) + b*x + c;
    }
}

// 点距
function distance(p, pp) {
    return Math.pow(Math.pow(p.x-pp.x,2) + Math.pow(p.y-pp.y,2), 0.5);
}

// 贴图
function chartlet(ctx, x, y, imgsrc) {
    var img = new Image();
    img.ictx = ctx;
    img.ix = x;
    img.iy = y;
    img.onload = function () { // XXX: JS中的this实在太灵活
        this.ictx.drawImage(img, this.ix-this.width/2, this.iy/*-this.height/2*/, this.width, this.height);
    },
    img.src = imgsrc;
}

// 打点
function dot(ctx,x,y,r,c) {
    ctx.fillStyle = c || "red";
    ctx.beginPath();
    ctx.arc(this.bx, this.by, r, 0, 2*Math.PI, true);
    ctx.fill();
}

// 写字
function text(ctx,x,y,w,c,f,a) {
    ctx.fillStyle = c || "white";
    ctx.font = f || "xx-large Cursive";
    ctx.textAlign = a || "center";
    ctx.fillText(w, x, y);
}

// 战场布局
var layout = function (w, h, bltsctx, ctx, data) {
    // 按矩形周长均匀分布
    // 按椭圆周长均匀分布
    // 按边缘距离泊松分布

    // 按中心角度均匀分布

    var scale = Math.sqrt(2) / 2
    var n = data.length;
    var step = Math.PI*2 / n;
    var centerX = w/2;
    var centerY = h/2;
    var radius = Math.min(w, h);
    for (var i=0;i<n;i++) {
        var ett = entity(data[i].id, data[i].name, data[i].logo, data[i].score, data[i].color, bltsctx, ctx);
        ett.x = centerX + Math.cos(step*i)*radius*scale/2;
        ett.y = centerY + Math.sin(step*i)*radius*scale/2;
        entities[ett.id] = ett;
        ett.show();
    }
};

// 实体模型
var entity = function (id, name, logo, score, color, bltsctx, ctx) {
    return {
        id: id,
        name: name,
        logo: logo || "./campsite.png",
        color: color || "red",
        bltsctx: bltsctx,
        memebers: [],
        vertexes: [], // reserved for 3d
        enemies: [],
        friends: [],
        x: 0,
        y: 0,
        z: 0,
        ctx: ctx,
        score: score,
        state: "active", // active/attacked/dead/robust/weak
        bullets: [],
        show: function () {
            // 报上名来
            text(ctx,this.x,this.y,this.name);
            // 树立旗来
            chartlet(this.ctx, this.x, this.y, this.logo);
            // 闪亮起来
            this.spark();
            // 行动起来
            this.fight();
        },
        spark: function () {
            // 根据状态切换自身光环
            if (this.id == "xiucai") {
                text(this.bltsctx,this.x-100,this.y+25,"加油干",this.color); // TODO: 喊口号
            }
        },
        fight: function () {
            var bullet = function () {
                return {
                    texture: "./missile.png", // 二进制弹道导弹
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0,
                    speed: 5, // pixels
                    delta: 0,
                    bx: 0,
                    by: 0,
                    status: "ready", // cruise/destruct/ready
                    bctx: undefined,
                    orbit: undefined,
                    fly: function () {
                        // 按N次贝塞尔曲线攻击（避开友军）

                        // 按二阶抛物线攻击（若目标为顶点，则简化为“求平面上已知顶点和所过一点坐标二次解析”）
                        
                        // 保存当前坐标
                        var x = this.bx;
                        var y = this.by;

                        // 计算水平位移
                        if (this.endX >= this.startX) {
                            this.delta += this.speed;;
                        }
                        else {
                            this.delta -= this.speed;
                        }
                        this.bx += this.delta;

                        // 计算垂直坐标
                        this.by = this.orbit(this.bx);

                        // if x|y near target then burst and reset delta
                        if (distance({x:this.startX,y:this.startY},{x:this.bx,y:this.by}) >= distance({x:this.endX,y:this.endY},{x:this.startX,y:this.startY})) {
                            this.bx = this.startX;
                            this.by = this.startY;
                            this.delta = 0;
                            this.status = "destruct";
                            chartlet(this.bctx, this.endX, this.endY, "./burst.png");
                            this.burst();
                            this.emit(); // TODO: 连珠炮式
                            return;
                        }

                        this.status = "cruise";
                        chartlet(this.bctx, this.bx, this.by, this.texture);
                    },
                    emit: function () {
                        cfg.sndemit.currentTime = 0;
                        cfg.sndemit.play();
                    },
                    burst: function () {
                        this.status = "destruct";
                        cfg.sndburst.currentTime = 0;
                        cfg.sndburst.play();
                    }
                };
            };
            for (var i=0; i<this.enemies.length; i++) { // TODO: 已经挂了的目标就不必继续打击
                var warhead = bullet();
                this.bullets[this.enemies[i]] = warhead;
                var ett = entities[this.enemies[i]];
                warhead.startX = warhead.bx = this.x;
                warhead.startY = warhead.by = this.y;
                warhead.endX = ett.x;
                warhead.endY = ett.y;
                warhead.bctx = this.bltsctx;
                warhead.orbit = quadratic({x:ett.x,y:ett.y},{x:this.x,y:this.y});
                warhead.emit();
            }
        }
    };
};

function initialize() {
    var data = [ // by ajax
        {id:"sunjian",name:"孙坚",memebers:[],logo:"",score:20},
        {id:"liubiao",name:"刘表",memebers:[],logo:"",score:15},
        {id:"caocao",name:"曹操",memebers:[],logo:"",score:10},
        {id:"yuanshu",name:"袁术",memebers:[],logo:"",score:30},
        {id:"zhangchao",name:"张超",memebers:[],logo:"",score:25},
        {id:"kongyou",name:"孔伷",memebers:[],logo:"",score:35},
        {id:"liuyan",name:"刘焉",memebers:[],logo:"",score:40},
        {id:"taoqian",name:"陶谦",memebers:[],logo:"",score:50},
        {id:"zhangmiao",name:"张邈",memebers:[],logo:"",score:75},
        {id:"qiaomao",name:"乔瑁",memebers:[],logo:"",score:90},
        {id:"yuanyi",name:"袁遗",memebers:[],logo:"",score:60},
        {id:"liudai",name:"刘岱",memebers:[],logo:"",score:35},
        {id:"dongzhuo",name:"董卓",memebers:[],logo:"",score:25},
        {id:"kongrong",name:"孔融",memebers:[],logo:"",score:85},
        {id:"wangkuang",name:"王匡",memebers:[],logo:"",score:50},
        {id:"baoxin",name:"鲍信",memebers:[],logo:"",score:65},
        {id:"zhangyang",name:"张杨",memebers:[],logo:"",score:95},
        {id:"hanfu",name:"韩馥",memebers:[],logo:"",score:15},
        {id:"yuanshao",name:"袁绍",memebers:[],logo:"",score:25},
        {id:"gongsunzan",name:"公孙瓒",memebers:[],logo:"",score:45},
        {id:"mateng",name:"马腾",memebers:[],logo:"",score:55},
        {id:"gongsundu",name:"公孙度",memebers:[],logo:"",score:75},
        {id:"xiucai",name:"秀才",memebers:[],logo:"./xiucai.png",score:65}
    ];
    cfg = environments();
    layout(cfg.width, cfg.height, cfg.ctxblts, cfg.ctxetts, data);
}

function animate() {
    // 擦除子弹图层
    cfg.ctxblts.clearRect(0,0,cfg.width,cfg.height);

    for (var ett in entities) {
        if (ticks%2 == 0) {
            entities[ett].spark();
        }
        for (var blt in entities[ett].bullets) {
            entities[ett].bullets[blt].fly();
        }
    }
}

function update() {
    if (ticks%5 == 0) {
        // by ajax
        // modify entities & enemies
        ticks = 0;
    }

    animate();

    ticks++;

    setTimeout(update, 500);
}

function test() {
    entities["xiucai"].enemies.push("dongzhuo");
    entities["mateng"].enemies.push("dongzhuo");
    entities["baoxin"].enemies.push("dongzhuo");
    for (var name in entities) {
        entities[name].fight();
    }
}

console.log("!!!war broke out!!!");
initialize();
test();
update();