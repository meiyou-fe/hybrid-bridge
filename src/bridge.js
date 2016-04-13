if (!window || !document) {
  throw new TypeError('browser required');
}
(function(global) {
  var base64 = require('meiyou-base64');
  var bridge = global.HybridBridge || {};
  var scheme = 'hybrid-bridge://';
  var _readyList = [];
  var _waitList = {};
  var _listenList = {};
  var has = Object.prototype.hasOwnProperty;

  bridge.isReady = false;
  bridge.version = require('../package.json').version;
  var defaultConfig = {
    debug: false,
    scheme: scheme
  };

  function log(message) {
    global.console && global.console.log(message);
  }

  /**
   * create elements
   * @param  {[type]}
   * @return {[type]}
   */
  function _createElement(options) {

    var src = scheme + options.method;
    if (options.data) {
      var data = JSON.stringify(options.data);
      var json = base64.urlsafe_b64encode(data);
      src += '?params=' + json;
    }

    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = src;

    iframe.onload = function() {
      setTimeout(function() {
        iframe.remove();
      }, 0);
    };
    document.getElementsByTagName('body')[0].appendChild(iframe);
  }


  /*
   * 执行方法
   * @param  {[type]}
   * @param  {[type]}
   * @return {[type]}
   */
  function _invoke(method, option) {
    var data = {
      method: method,
      data: option
    };
    _createElement(data);
  }

  /*
   * 向native 添加注册事件
   * @param  {[type]}
   * @return {[type]}
   */
  function _listen(listenObject) {
    _createElement(listenObject);
  }

  /*
   * 向native 删除注册事件
   * @param  {[type]}
   * @return {[type]}
   */
  function _unlisten(method) {
    var data = {
      method: '_unlisten',
      data: {
        method: method
      }
    };
    _createElement(data);
  }

  // function _report() {}


  function _merge(to, from) {
    for (var key in from) {
      if (has.call(from, key)) {
        to[key] = from[key];
      }
    }
    return to;
  }

  function noop() {}

  /*
   * 配置信息
   * @param  {[object]}
   * @return {[bridge]}
   */
  bridge.init = function(config) {

    config = config || {};
    if (this.isReady) {
      log('init fn shuold call once');
      return;
    }
    var conf = _merge(defaultConfig, config);
    this.config = conf;
    while (_readyList.length) {
      var item = _readyList[0];
      typeof item === 'function' ? item.apply(this, arguments) : noop.apply(this, arguments);
      _readyList.shift(_readyList[0]);
    }

    this.isReady = true;

    //dispatch init events
    var _initEvent = document.createEvent('Events');
    _initEvent.initEvent('onHybridBridgeInit');
    _initEvent.bridge = this;
    document.dispatchEvent(_initEvent);
    return this;
  };

  /*
   * 注册ready事件
   * @param  callback 	{Function}
   * @return {[type]}
   */
  bridge.ready = function(callback) {
    _readyList.push(callback);
    return this;
  };

  /*
   * 注册错误事件
   * @return {[type]}
   */
  bridge.error = function() {

  };


  /*
   * 取消侦听
   * @param  {[type]}
   * @return {[type]}
   */
  bridge.unlisten = function(method) {
    _unlisten(method);
    delete _listenList[method];
  };

  /*
   * 执行方法
   * 不可等待
   * @param  method {[string]}
   * @param  option {[object]}
   * @return {[type]}
   */
  bridge.invoke = function(method, option) {
    _invoke(method, option);
  };

  /*
   * 注册等待消息回执的方法
   * 暂不支持队列消息
   * @param  method 	{[string]}
   * @param  option 	{[object]}
   * @param  callback {Function}
   * @return {[bridge]}
   */
  bridge.wait = function(method, option, callback) {

    var now = (new Date()).getTime();
    var callbackId = method + '-' + now;

    var waitObject = {
      callbackId: callbackId,
      callback: callback,
      inputData: option,
      outputData: null,
      start: now,
      finish: null,
      _complete: function() {},
      timeout: 1000
    };
    _waitList[method] = waitObject;
    _invoke(method, option);
    return this;
  };

  /*
   * 执行回调消息
   * 禁止在页面调用
   * @param  method {[string]}
   * @param  data {[string of json]}
   * @return {[bridge]}
   */
  bridge.dispatchWait = function(method) {
    var waitObject = _waitList[method];
    if (waitObject && waitObject.callback) {
      waitObject.callback.apply(this, arguments);
      delete _waitList[method];
    }
    return this;
  };

  /*
   * 侦听	 *
   * topbar/rightbutton?params=
   * @param  method 		{[string]}
   * @param  callback 	{Function}
   * @return {[type]}
   */
  bridge.listen = function(method, data, callback) {
    var listenObject = _listenList[method];
    if (!listenObject) {
      listenObject = {
        method: method,
        data: data,
        listenList: []
      };
    }
    listenObject.listenList.push(data);
    listenObject['callback'] = callback;
    _listenList[method] = listenObject;
    _listen(listenObject);
    return this;
  };

  /*
   * 派发侦听消息
   * 禁止在页面调用
   * @param  method {[string]}
   * @param  data {[string of json]}
   * @return {[type]}
   */
  bridge.dispatchListener = function(method) {
    var listenObject = _listenList[method];
    if (listenObject) {
      var callback = listenObject['callback'];
      if (callback) {
        callback.apply(this, arguments);
      }
    }
  };

  /*
   * dispatch ready Event;
   */
  var readyEvent = document.createEvent('Events');
  readyEvent.initEvent('onHybridBridgeReady');
  readyEvent.bridge = bridge;
  document.dispatchEvent(readyEvent);

  global.HybridBridge = bridge;
  
  /* eslint no-undef:0 */
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = bridge;
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() {
      return bridge;
    });
  } else {
    this.HybridBridge = bridge;
  }

})(window, document);
