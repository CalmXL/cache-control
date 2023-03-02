const http = require('http');
const url = require('url');
const path = require('path');
const { stat, readFile } = require('fs/promises');
const crypto = require('crypto');

// stat 读取路径  返回一个statObj
http.createServer(async (req, res) => {
  let { pathname } = url.parse(req.url);

  // 获取路径文件
  let fileName = pathname === '/' 
               ? path.join(__dirname, '../', 'static/index.html')
               : path.join(__dirname, '../', pathname);

  // 设置 Expires 设置明确过期时间, 旧版本
  res.setHeader('Expires', new Date(new Date().getTime() + 1000 * 10).toGMTString());

  // 设置 Cache-Control max-age=10 10s之后过期
  res.setHeader('Cache-Control', 'max-age=10');

  try {
    /**
     Stats {
      dev: 16777231,
      mode: 33188,
      nlink: 1,
      uid: 501,
      gid: 20,
      rdev: 0,
      blksize: 4096,
      ino: 58103795,
      size: 348,
      blocks: 8,
      atimeMs: 1677745782158.172,
      mtimeMs: 1677745782124.0828,
      ctimeMs: 1677745782124.0828,
      birthtimeMs: 1677745338466.5996,
      atime: 2023-03-02T08:29:42.158Z, // 指示最后一次访问此文件的时间戳
      mtime: 2023-03-02T08:29:42.124Z, // 指示最后一次修改此文件的时间戳
      ctime: 2023-03-02T08:29:42.124Z, // 指示最后一次更改文件状态的时间戳
      birthtime: 2023-03-02T08:22:18.467Z
    }
     */
    const statObj = await stat(fileName);
    // console.log(statObj);
    const cTime = statObj.ctime.toGMTString();
    
    // 设置 Last-Modified 响应首部，其中包含源头服务器认定资源做出修改的日期和时间。
    res.setHeader('Last-Modified', cTime);

    // console.log(req.headers['if-modified-since'], cTime);
    if (req.headers['if-modified-since'] === cTime) {
      return (res.statusCode = 304) && (res.end('Not Modified'));
    }

    if (statObj.isFile()) {
      let result = await readFile(fileName);

      // hash 算法 设置一个值
      let hash = crypto.createHash('md5').update(result).digest('base64');
      res.setHeader('Etag', hash);

      if (req.headers['if-none-match'] === hash) {
        return (res.statusCode = 304) && (res.end());
      }

      console.log(fileName);

   
      res.end(result);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }

  } catch (e) {
    res.statusCode = 404;
    res.end('Not Found');
  }



}).listen(3000);


// Cache-Control: max-age=10
// Connection: keep-alive
// Content-Length: 364
// Date: Thu, 02 Mar 2023 11:56:42 GMT
// Etag: pNQdEfsx+PNlkBdqNKj5gg==
// Expires: Thu, 02 Mar 2023 11:56:52 GMT
// Keep-Alive: timeout=5
// Last-Modified: Thu, 02 Mar 2023 09:07:17 GMT