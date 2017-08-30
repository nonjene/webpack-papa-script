# ok-papa-cli

基于 webpack 的前端多页面解决方案。在此cli的帮助下快速部署前端页面：可多个输出或每个页面独立输出，并且包含多个环境切换、适合多个环境的最佳配置输出、其他路径代理等功能。


# Feature

* 支持ie8, webpack采用1.x

# Config

papa.config.json：
```js
{
    "ftp": {
      "host": "192.168.1.1",
      "port": "",
      "user": "user",
      "password": "ps"
    },
    "remoteBasePath": "", //ftp的基目录，用于打印地址时方便排除。m.okpapa.com
    "remotePath": "/activity/{$target}",
    "localAssetPath": "build/activity/{$target}",
    "domainName": "http://m.okpapa.com",
    "cdnDomain": "https://images.okpapa.com",
    "proxyPort": 80,
    "servePort": 3005,
    "staticFileConcatOrder":[]
  }
```


# Todo

1. write test
