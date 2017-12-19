# ok-papa-cli

基于 webpack 的纯前端多页面应用、多个项目集成的解决方案。在此cli的帮助下快速部署前端页面。

项目开发中。

# 特点

* 每个项目互相独立，但可以共用组件；
* 每个项目已预置了可区分桌面端与移动端两个页面；
* 可多个项目编译或每个项目独立编译；
* 预置3个环境切换；
* 本地开发的其他路径代理。比如项目里需要转跳到本地另外一个端口开启的服务，可以通过这个代理实现同端口访问；
* 支持ie8（webpack采用1.x）；

# Config

okpapa.config.json：
```js
{
    "ftp": {
      "host": "192.168.1.1",
      "port": "",
      "user": "user",
      "password": "ps"
    },
    //ftp的基目录，用于打印地址时方便排除。如访问是/activity/，实际nginx是代理到：ftp://base_path/activity/。
    "remoteBasePath": "base_path",
    // url访问的路径, $target变量在编译时会变为指定的项目文件夹名
    "remotePath": "/activity/{$target}",
    // 本底开发及测试环境代码的输出位置
    "localAssetPath": "build/activity/{$target}",
    // 测试环境ftp上传后，能自动打开该链接
    "domainName": "http://m.okpapa.com",
    // 生产环境的所有静态资源引用的host
    "cdnDomain": "https://images.okpapa.com",
    // 需要代理的端口，所有非/activity/路径的请求都走代理
    "proxyPort": 80,
    // 本地测试的http端口
    "servePort": 3005,
    // 合并为 common.js
    "staticFileConcatOrder":[]
  }
```

# 命令介绍

## 一个开发流程的例子：
1. 新建一整个方案, 命名为 project1：
    * `okpapa init project1`
    * `cd project1`
    * `npm install`
1. 新建一个项目,包含pc和移动端，叫 huodong_abc: 
    * `okpapa C huodong_abc`
    * 或可以指定模版：`okpapa C huodong_abc -t react`
1. 本地环境开发过程：
    * `okpapa w huodong_abc`
    * 如果要指定pc端：
        * `okpapa w huodong_abc --duan pc`，移动端是`m`。
    * 测试时涉及登录、平台页面跳转，请把平台的本地服务打开，如果服务端口是8080，请加一个参数，如：
        * `okpapa w huodong_abc P 8080`
1. 开发完成，并发到测试环境（`u` 后面不在需要加路径了）：
    * `okpapa r huodong_abc --test u`
    * 同上，指定端加：`--duan xx`
1. 测试通过，发到预发：
    * `okpapa r huodong_abc --pre`
    * 同理要指定端，加`--duan xx`
    * 代码会输出到dist/pre文件夹
1. 发布上线：
    * `okpapa r huodong_abc`
    * 代码会输出到dist/pro文件夹
1. 假如有不需要webpack打包的文件，比如需要在html引入，可放入`./resource/bundle`里，然后执行：
    * `okpapa --copy-static`
    * 文件会输出到`dist/pre/static/`和pro。
 . 假如修改了`./resource/js/`里的文件，请跑上面这个例子的命令，将会自动更新 common.js

## 命令介绍
* 查看功能，执行 `okpapa --help`
* `okpapa s`     单独开启http服务

* `okpapa w xxx` 监听xxx项目代码，发布到build文件夹，实时更新，并开启http服务
* `okpapa w xxx --mode pre` 把测试代码的后端接口改为预发的接口
* `okpapa u xxx` 把开发目录（build的）的xxx代码上传到测试服务器

* `okpapa r xxx` 发布生产环境的xxx代码，可多个一起：xxx,yyy,zzz
* `okpapa r xxx --pre` 发布预发环境。
* `okpapa r xxx --test` 发布只包含少量debug代码的测试环境代码（此外与`okpapa w xxx`的产出效果完全一样）。

* `okpapa wa`    监听整个activity（未完成）
* `okpapa ra`              发布整个activity（也可以加--pre 或 --test）
* `okpapa ra --scope xxx`  发布文件夹`src/xxx`里的所有项目
* `okpapa C <项目名>` 新建一个项目
* `okpapa -t <项目文件模版>` 新建一个项目时，指定模版
* `okpapa P <端口>` 本地平台服务的端口，默认80
* `okpapa --copy-static` 把bin/resource/static的文件复制到3个环境
* `okpapa init <名称>` 新建一整个方案
* `okpapa set-source <git url>` 指定 init 创建目录的git源

参数：

* `--duan`    选择构建pc端代码或微信端代码。m|pc|m,pc，不选默认两端
* `--open`    上传代码后，自动打开链接
* `-p`        非开发模式。
* `-d`        代码转为开发模式（包含inline-source-map）


# 文件夹命名规则

为了方便写构建功能，对项目文件夹的命名做了限制。参考例子`huodong1`。


例如一个项目叫xxx：

* 移动端：`/src/xxx/m/`
* pc端：`/src/xxx/pc/`


# 开发规则

* pc页面转跳微信页面：
    默认在移动设备自动转跳。假如该项目没有微信端，为防止自动转跳，必须在pc页面加参数:`?p=pc_only`,如:`xxx/pc/index.html?p=pc_only`
* 复杂度高的图片如照片，切图请用jpg作为图片格式，否则如果用png上线压缩后会失真，甚至导致编译出错。

# 特点

1. `/resource/js/`里的js文件可以合并为 common.js，并自动插入到 html 引用。具体的文件选择及排序可在`okpapa.config.json`的`staticFileConcatOrder`配置。
1. 每个项目的html文件只需包含业务代码，参考模版`_template_def`。
1. 每个项目里新增 config.json, 主要用来配置项目的标题，或`外层模版`的其他变量。可参考模版的示例。
1. `外层模版` 存放在`/resource/html/`里。
1. 每个项目里会自动新增 config_v.js, 无需理会此文件。 
1. 如果项目目录不包含 config.json, 将不会使用外层模版，而会把目录顶层的`index.html`视为完整的 html 文件（webpack 编译出来的 bundle 引用依旧不需要自己添加）

* 可以使用 ES6，react。
* 可用 handlebar 模版。
* sass、及 autoprofixer 的添加

## 注意的地方

* 假如pc端页面react，ie8将不兼容
* 关于js里本地图片的引用，不能直接自己写地址字符串，要用require。（参考例子）
* 不要在handlebars模版里直接引用图片，只能在js或css里引用

## 其他特点

* 预发及生产环境的编译，图片会自动压缩。测试环境不执行压缩。



# 常见问题
    Module build failed: Error: dyld: Library not loaded: /usr/local/opt/libpng/lib/libpng16.16.dylib
    解决：https://github.com/tcoopman/image-webpack-loader
    

# Todo

1. write test
1. 


