/* https://github.com/nagexiucai/howtojs */
/* 总结JS编程行之有效的套路 */

// 类似Python/Java的类变量和实例变量

function Class() {
    this.counter = 0;
}

Class.prototype.__counter__ = 0;
Class.prototype.INC = function() {
    Class.prototype.__counter__ += 1;
    this.counter += 1;
}
Class.prototype.DEC = function() {
    Class.prototype.__counter__ -= 1;
    this.counter -= 1;
}
Class.prototype.echo = function(msg) {
    console.log("=====" + msg + "=====");
    console.log("CLASS __counter__ is " + Class.prototype.__counter__);
    console.log("Instance counter is " + this.counter);
    console.log("--------------------");
}

c = new Class();
cc = new Class();

c.INC();
cc.INC();

c.echo("c");
cc.echo("cc");

c.DEC();
cc.DEC();

c.echo("c");
cc.echo("cc");
