// https://github.com/nagexiucai/howtojs/utils


function chainMaker (c) {
  // todo: make websocket
  if (typeof c == "string" && c.startsWith("ws://")) {

  }
  else {
    return c;
  }
}

!function (object, name, version, chain){
  var o = object;
  var name = name;
  var version = version;
  var chain = chain;

  var onCopy = function (evt) {

  };
  var onPaste = function (evt) {

  };
  var onDrag = function (evt) {};
  var onDrop = function (evt) {};

  o.addEventListener("copy", onCopy);
  o.addEventListener("paste", onPaste);
}(document, "clipboard", "0.0.1", rbf);

/**
 * Coding:UTF-8
 * Clipboard upon noVNC.
 * Bob·NX
 *
 * usage:
 * <script type="text/javascript" src="path-contains-me/clipboard.js"></script>
 * <textarea id="clipboard" placeholder="请将要传送到后台的代码文本粘贴于此" maxlength="1024" style="fix-me"></textarea>
 */

function _clipboard_(d) {
    var me = d.getElementById("clipboard");
    me.addEventListener("paste", function (evt) {
        var text = evt.clipboardData.getData("text/plain");
        // TODO: 传送两次降低失败概率
        d.rfb.clipboardPasteFrom(text);
        d.rfb.clipboardPasteFrom(text);
    });
    d.rfb._onClipboard = function (__, text) {
        me.value = text;
    };
}(document);