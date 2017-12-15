/* https://github.com/nagexiucai/howtojs */
/* 探究JS的OOP特性 */

/* 首先是ES-5版本
** 函数是一等公民
** 函数都是引用型
*/

/* 基本约定 */

function Root() {
    // 私有属性
    var id = Math.random(); // 简单型
    var fangs = []; // 引用型
    // 私有方法
    function breathe() {
        return "zzz...";
    }

    // 实例属性
    this.id = Math.random();
    this.fangs = [];
    // 实例方法
    this.breathe = function() {
        return "ooo...";
    }
}

// 原型属性
Root.prototype.id = Math.random();
Root.prototype.fangs = [];
// 原型方法
Root.prototype.breathe = function() {
    return "mmm...";
};

/* 显式原型链 */
function Parent() {
    this.name = "parent";
    this.asset = ["house"];
}
function Kid() {}
Kid.prototype = new Parent(); // TODO: 思考这里为何用Parent实例

var parent = new Parent();
console.log("parent's name is", parent.name);
console.log("parent's asset is", parent.asset);

var aKid = new Kid();
var bKid = new Kid();

console.log(">>> set kid a's name as a");
console.log(">>> set kid b's name as b");
aKid.name = "a";
bKid.name = "b";
console.log(">>> push car into kid b's asset");
bKid.asset.push("car");

console.log("kid a's name is", aKid.name);
console.log("kid a's asset is", aKid.asset);
console.log("kid b's name is", bKid.name);
console.log("kid b;s asset is", bKid.asset);

/* 要点：用父类实例做子类的显式原型
** 简单实现
** 子类实例共享父类（子类的显式原型）的引用型实例属性
**** 只是修改了bKid的asset却导致aKid的asset同时改变
**** 不能说好坏、实践中必须清晰了解这一点
** 不能给父类传递构造参数
*/

/* 巧用构造函数
**** 不同于别的OOP语言，任何普通函数通过new关键字创建对象时都算
**** 规范化的构造函数需要满足以下条件：
****** 在函数体中通过this设置属性
****** 可以返回this或别的“非类型”的对象（不推荐）
**** 采用new关键字操作一个构造函数（OC）时发生：
****** var o = {};
******** 创建空对象
****** o.__proto__ = OC.prototype;
******** 正是ECMA所定义的“__proto__ point to the value of its constructor’s "prototype"”
******** 特别指出__proto__这个名字并不是JS标准的一部分、各解释器实现有差异、却一定存在相同功用的指针、不建议修改
****** OC.call(o);
******** 将构造函数的作用域赐该对象（OC中的this就指向o）、接着调用OC
****** return o;
******** 返回新对象
********** 当构造函数本身包含return时（上述的“不推荐”）比较特殊
************ 可能造成原型链的混乱（解释器不会错、给人带来理解门槛）
**** 最后提一下constructor这个属性——是构造函数的引用、不建议修改
*/

function Bird(name) {
    this.name = name;
    this.wow = ["chirp"];
    this.attack = function() {
        return "peck";
    };
}
function Sparrow(name) {
    Bird.call(this, name); // TODO: 第一个this是子类实例、name做父类构造参数
}

var aSparrow = new Sparrow("irony");
var bSparrow = new Sparrow("simon");

console.log(">>> push bark into sparrow b's wow");
bSparrow.wow.push("bark");

console.log("sparrow a's name is", aSparrow.name);
console.log("sparrow a's wow is", aSparrow.wow);
console.log("sparrow b's name is", bSparrow.name);
console.log("sparrow b's wow is", bSparrow.wow);

console.log("attacks in both sparrow a/b are the same", aSparrow.attack === bSparrow.attack);

/* 要点：用父类构造函数增强子类实例（把父类实例属性给子类实例复制一份）
** 可以给父类传递构造参数
** 子类实例不共享父类的引用型实例属性
** 子类不共享父类的实例方法就有悖类的继承（派生）性质、造成内存浪费
*/

/* 组合 */
function Vehicle(name) {
    // 仅在此定义实例属性
    this.name = name;
    this.feature = [];
}
// 定义原型方法
Vehicle.prototype.whistle = function() {
    return "voom";
};

function Car(name) {
    Vehicle.call(this, name); // TODO: 巧用构造函数
}
Car.prototype = new Vehicle(); // TODO: 显式原型链

var aCar = new Car("KIA");
var bCar = new Car("HYUNDAI");

console.log(">>> push kia into car a's feature");
console.log(">>> push hyundai into car b's feature");
aCar.feature.push("kia");
bCar.feature.push("hyundai");

console.log("car a's name is", aCar.name);
console.log("car a's feature is", aCar.feature);
console.log("car b's name is", bCar.name);
console.log("car b's feature is", bCar.feature);

console.log("whistles in both car a/b are the same", aCar.whistle === bCar.whistle);

/* 要点：将实例方法全部升阶到原型方法、引用型实例属性通过父类构造函数注入
** 子类实例不共享父类的引用型实例属性
** 子类实例共享父类的原型方法
** 可以给父类传递构造参数
** 由于父类构造函数被调用了两次（“巧用构造函数”和“显式原型链”）
**** 父类实例属性冗余（多一份）
****** 只是子类实例屏蔽了子类原型
*/

/* 寄生组合（最佳实践） */
function beget(o) {
    var F = function() {};
    F.prototype = o;
    return new F();
}
function Tree(age) {
    // 仅在此定义实例属性
    this.age = age;
    this.story = [];
}
// 定义原型方法
Tree.prototype.bloom = function() {};

function Paulownia(age) {
    Tree.call(this, age); // TODO:
}
var proto = beget(Tree.prototype); // TODO:
proto.constructor = Paulownia; // TODO:
Paulownia.prototype = proto; // TODO:

var aPaulownia = new Paulownia(300);
var bPaulownia = new Paulownia(500);

console.log(">>> push yongle into paulownia a's story");
console.log(">>> push yongzheng into paulownia b's story")
aPaulownia.story.push("yongle");
bPaulownia.story.push("yongzheng");

console.log("paulownia a's age is", aPaulownia.age);
console.log("paulownia a's story is", aPaulownia.story);
console.log("paulownia b's age is", bPaulownia.age);
console.log("paulownia b's story is", bPaulownia.story);

console.log("blooms in both paulownia a/b are the same", aPaulownia.bloom === bPaulownia.bloom);

/* 要点：通过beget函数把子类实例的prototype上多余的那份父类实例属性擦除
**** 具体原理继续看原型继承、寄生继承
*/

/* 原型继承 */
// 任然定义beget函数
function Flower(color) {
    this.color = color;
    this.seed = [];
}
var flower = new Flower("pink");
// TODO: 获取没有实例属性的新对象
var aFlower = beget(flower);
var bFlower = beget(flower);

console.log(">>> push o into flower's seed");
flower.seed.push("o");

console.log("flower's color is", flower.color);
console.log("flower's seed is", flower.seed);

console.log(">>> enhance flower a");
aFlower.name = "jasmine";
aFlower.source = "China"

console.log("? in flower", Object.getOwnPropertyNames(flower));
console.log("? in flower a", Object.getOwnPropertyNames(aFlower));
console.log("? in flower b", Object.getOwnPropertyNames(bFlower));

console.log(">>> enhance flower b");
bFlower.smell = "fragrant";
bFlower.petal = "tenuous";

console.log("? in flower", Object.getOwnPropertyNames(flower));
console.log("? in flower a", Object.getOwnPropertyNames(aFlower));
console.log("? in flower b", Object.getOwnPropertyNames(bFlower));

console.log(">>> push oo into flower's seed");
flower.seed.push("oo");

console.log("flower's seed is", flower.seed);
console.log("seed of flower a's __proto__ is", aFlower.__proto__.seed);
console.log("seed of flower b's __proto__ is", bFlower.__proto__.seed);

console.log(">>> push undefined into seed of flower a's __proto__");
aFlower.__proto__.seed.push(undefined);

console.log("flower's seed is", flower.seed);
console.log("seed of flower a's __proto__ is", aFlower.__proto__.seed);
console.log("seed of flower b's __proto__ is", bFlower.__proto__.seed);

console.log(">>> push null into seed of flower b's __proto__");
bFlower.__proto__.seed.push(null);

console.log("flower's seed is", flower.seed);
console.log("seed of flower a's __proto__ is", aFlower.__proto__.seed);
console.log("seed of flower b's __proto__ is", bFlower.__proto__.seed);

console.log("flower's seed is", flower.seed); // TODO: 显然这种情况下Flower的引用型实例属性被子类实例的__proto__及本身实例共享

/* 关键：通过beget函数获取新对象、该对象没有实例属性、显式原型是参数实例
** 从已有对象衍生新对象、不需要创建自定义类型
** 实例属性重度共享
** 无法复用（新对象是现做的、实例属性是现添的）
*/

/* 寄生继承
** 寄生是一种模式、不止用于继承
*/
// 任然定义beget函数
function Gas(whose) {
    this.whose = whose;
    this.ingredient = [];
}
function getKid(o) {
    // 创建新对象
    var clone = beget(o); // TODO:
    clone.name = "fart"
    return clone;
}

var aFart = getKid(new Gas("irony"));
var bFart = getKid(new Gas("simon"));

console.log("fart a from", aFart.whose);
console.log("fart b from", bFart.whose);

console.log(">>> push shit into fart a's ingredient");
aFart.ingredient.push("shit");

console.log("ingredient of fart a is", aFart.ingredient);

console.log(">>> push dung into fart b's ingredient");
bFart.ingredient.push("dung");

console.log("ingredient of fart b is", bFart.ingredient);

/* 要点：和原型继承无差别、写法不同、看起来更像继承（后者更像复制）
**** “创建新对象->增强->返回该对象”这种套路称为“寄生继承”
****** 采用何种方式创建不限（beget/new/{}）
** 无法复用
** 实例属性重度共享
** 不需要创建自定义类型
*/

/* 回马枪：再仔细看下“最佳实践” */
function bestPractice() {
    function assShow(o, name) {
        console.log("=====", name, "=====");
        console.log(o.prototype);
        console.log(o.constructor);
        console.log(o.__proto__);
        if (o.prototype != undefined) {
            console.log(o.prototype.prototype);
            console.log(o.prototype.constructor);
            console.log(o.prototype.__proto__);
        }
    }

    function beget(o) {
        var F = function() {};
        F.prototype = o;
        return new F();
    }

    function Tree(age) {
        this.age = age;
        this.story = [];
    }

    assShow(Tree, "Tree");

    Tree.prototype.bloom = function() {};

    assShow(Tree, "Tree.prototype.bloom 设置为空对象");

    function Paulownia(age) {
        Tree.call(this, age);
    }

    assShow(Paulownia, "Paulownia构造函数中调用Tree.call(this, age)");

    var proto = beget(Tree.prototype);

    assShow(proto, "通过beget函数创建proto");

    proto.constructor = Paulownia;

    assShow(proto, "proto.constructor设置为Paulownia");

    Paulownia.prototype = proto;

    assShow(Paulownia, "Paulownia.prototype设置为proto");

    var paulownia = new Paulownia(300);

    assShow(paulownia, "通过构造函数实例化Paulownia");
}

bestPractice();

/*
===== Tree =====
Tree {}
[Function: Function]
[Function]
undefined
[Function: Tree]
{}
===== Tree.prototype.bloom 设置为空对象 =====
Tree { bloom: [Function] }
[Function: Function]
[Function]
undefined
[Function: Tree]
{}
===== Paulownia构造函数中调用Tree.call(this, age) =====
Paulownia {}
[Function: Function]
[Function]
undefined
[Function: Paulownia]
{}
===== 通过beget函数创建proto =====
undefined
[Function: Tree]
Tree { bloom: [Function] }
===== proto.constructor设置为Paulownia =====
undefined
[Function: Paulownia]
Tree { bloom: [Function] }
===== Paulownia.prototype设置为proto =====
Paulownia { constructor: [Function: Paulownia] }
[Function: Function]
[Function]
undefined
[Function: Paulownia]
Tree { bloom: [Function] }
===== 通过构造函数实例化Paulownia =====
undefined
[Function: Paulownia]
Paulownia { constructor: [Function: Paulownia] }
*/
