# 混合应用协议桥



# demo

### web读取native信息

```js
HybridBridge.wait('/getUserInfo', {userid:1}, function(user){
  // do something
});
```

### web侦听native事件

```js
HybridBridge.listen('/topRightButton',{}, function(){
  // do something
});
```

## ios
```oc
webView stringByEvaluatingJavaScriptFromString:@"HybridBridge.dispatchWait('/getUserInfo', {})"
```

## android

```java
webView.loadUrl("HybridBridge.dispatchWait('/getUserInfo',{user})");
```


### API
```js
/* 执行客户端方法，并需要返回数据
args     type      description           example
url      string    与客户端协定的协议url    '/getUserinfo'
options  object    与客户端协定的协议参数    {userid:'1'}
callback function  客户端返回数据时的处理程序 function(url, data){}
*/
HybridBridge.wait(url, options, callback);
```
```js

/* 监听客户端某种事件，并需要返回数据
args     type      description           example
url      string    与客户端协定的协议url    '/getUserinfo'
options  object    与客户端协定的协议参数    {userid:'1'}
callback function  客户端返回数据时的处理程序 function(url, data){}
*/
HybridBridge.listen(url, options, handler);
```
```js

/* 执行客户端方法，不需要返回数据
args     type      description           example
url      string    与客户端协定的协议url    '/login'
options  object    与客户端协定的协议参数    {}
*/
HybridBridge.invoke(url, options);
```
```js

/* 客户端返回数据
args     type      description           example
url      string    与客户端协定的协议url    '/getUserinfo'
options  object    与客户端协定的协议参数    {userid:'1'}
callback function  客户端返回数据时的处理程序 function(url, data){}
*/
HybridBridge.dispatchWait(url, data);
```
```js

/* 客户端派发事件
args     type      description           example
url      string    与客户端协定的协议url    '/getUserinfo'
options  object    与客户端协定的协议参数    {userid:'1'}
callback function  客户端返回数据时的处理程序 function(url, data){}
*/
HybridBridge.dispatchListener(url,data);
```

### 依赖库
- base64
