# 强缓存与协商缓存

浏览器缓存里还有强缓存、协商缓存的概念，强缓存就是指服务器的缓存控制。

启用强缓存有以下几种情况。
1. 存在 Cache-Control 属性，设置 max-age 属性或者 must-revalidate、public、private 属性值；
2. 无 Cache-Control 属性时，存在 Expires 字段；

当强缓存失效并且服务端返回 Last-Modified 和 ETag 会走协商缓存。


注意：
no-cache：并不是不允许缓存，而是可以缓存，但是在使用之前必须要去服务器验证是否过期，是否有最新的版本，这时如果存在 ETag 或者 Last-Modified 会走协商缓存，如果状态码为 304,则使用本地缓存。