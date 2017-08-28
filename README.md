#ok-papa-cli
基于 webpack 的前端多页面解决方案。在此cli的帮助下快速部署前端页面：可多个输出或每个页面独立输出，并且包含多个环境切换、适合多个环境的最佳配置输出、其他路径代理等功能。


#Feature
* webpack使用1.x，支持ie8

#Config
papa.config.json：
```json
    {
      static:{
          ftp: {
          host: "192.168.1.1",
          port: "",
          user: "user",
          password: "ps"
        },
        remoteBasePath: "", //ftp的基目录，用于打印地址时方便排除。m.okpapa.com
        remotePath: "/activity/{$target}",
        localAssetPath: "build/activity/{$target}",
        domainName: "http://m.okpapa.com",
        cdnDomain: "https://images.okpapa.com"
        proxyPort: 80,
        servePort: 3005
      }
    }
```


#Todo
万事开头难，然后中间难，最后结尾难
1. 跑通webpack complie
    1. 把 npm run 的命令改为 run_webpack.js
1. cli: create a Project Solution
1. write test
1. 解耦resource的合并文件顺序
1. 拆解各种配置：
    1. webpack.config
    1. 
1. 




<!-- script
`
"watch": "webpack --progress --colors --watch --config ./bin/webpack.config.js",
"build": "webpack --progress --colors --config ./bin/webpack.config.js",
"start": "serve -p 3005"
` -->