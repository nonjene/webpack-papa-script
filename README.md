# ok-papa-script

基于 webpack 的纯前端多页面应用、多个项目集成的解决方案。此方案适用于部署大量短期性、互相独立无关联的页面，比如活动推广页。
发布单个页面时，不需要整个项目进行编译，在利用webpack部署方案便捷性的同时，避开了它的单项目的特性，帮助我们快速部署前端页面。

项目开发中。

# 特点

* 每个项目互相独立，但可以共用组件；
* 每个项目已预置了可区分桌面端与移动端两个页面；
* 可多个项目编译或每个项目独立编译；
* 2维的多环境切换：部署环境的切换及fetch数据的环境切换；
* 内置代理功能，本地开发可以打通与其他项目的共用cookie等缓存环境。比如项目里需要转跳到本地另外一个端口开启的服务，可以通过这个代理实现同端口访问；
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
    "staticFileConcatOrder":[],
    // 自定义 webpack config，将会覆盖默认的。
    "webpackConfig":{}
  }
```

# 命令介绍

## 一个开发流程的例子：
1. 新建一整个方案：
    * `git clone https://github.com/nonjene/ok-papa-seed.git`
    * `cd ok-papa-seed`
    * `npm install`
1. 新建一个项目,包含pc和移动端，叫 huodong_abc: 
    * `npm start C huodong_abc`
    * 或可以指定模版：`npm run C huodong_abc -t react`
1. 本地环境开发过程：
    * `npm start w huodong_abc`
    * 如果要指定pc端：
        * `npm start w huodong_abc`
    * 测试时假如需要转跳到其他同域名的项目页面（如跳登录页），此项目可以把其他服务端口代理过来。（todo：需要更具体描述）请把该项目的本地服务打开，代理目标的端口默认是80，如果服务端口是其他，请加一个参数，如：
        * `npm start w huodong_abc P 8080`
1. 开发完成，并发到测试环境（`u` 后面不在需要加路径了）：
    * `npm start r huodong_abc test u`
1. 测试通过，发到预发：
    * `npm start r huodong_abc pre`
    * 代码会输出到dist/pre文件夹
1. 发布上线：
    * `npm start r huodong_abc`
    * 代码会输出到dist/pro文件夹
1. 假如有不需要webpack打包的文件，比如需要在html引入，可放入`./resource/bundle`里，然后执行：
    * `npm start deploy-static`
    * 文件会输出到`dist/pre/static/`和pro。
 . 假如修改了`./resource/js/`里的文件，请跑上面这个例子的命令，将会自动更新 common.js

## 命令介绍
* 查看功能，执行 `npm start --help`
* `npm start s`     单独开启http服务

* `npm start w xxx`或`npm run watch xxx` 监听xxx项目代码，发布到build文件夹，实时更新，并开启http服务
* `npm start w xxx --mode pre`或`npm run watch xxx --mode pre` 把测试代码的后端接口改为预发的接口
* `npm start u xxx` 把开发目录（build的）的xxx代码上传到测试服务器

* `npm start r xxx`或`npm build xxx` 发布生产环境的xxx代码，可多个一起：xxx,yyy,zzz
* `npm start r xxx --pre`或`npm build xxx --pre` 发布预发环境。
* `npm start r xxx --test`或`npm build xxx --test` 发布只包含少量 sourceMap 代码、不包含修改监听的测试环境代码（此外与`npm start w xxx`的产出效果完全一样）。

<!-- * `npm start wa`    监听整个activity（未完成） -->
* `npm start ra`              发布整个activity（也可以加--pre 或 --test）
* `npm start ra --scope xxx`  发布文件夹`src/xxx`里的所有项目
* `npm start c <项目名>` 新建一个项目
* `npm start c <项目名> -t <项目文件模版>` 新建一个项目，并且指定模版
* `npm start P <端口>` 需代理的本地服务的端口，默认80
* `npm start --copy-static` 把bin/resource/static的文件复制到3个环境

参数：

* `--duan`    选择构建pc端代码或微信端代码。m|pc|m,pc，不选默认两端:"m,pc"
* `--open`    上传代码后，自动打开链接
* `-p`        非开发模式。
* `-d`        代码转为开发模式（包含inline-source-map）
* `-t`        创建项目指定模板

# 文件夹命名规则

为了方便写构建功能，对项目文件夹的命名做了限制。参考例子`huodong1`。


例如一个项目叫xxx：

* 移动端：`/src/xxx/m/`
* pc端：`/src/xxx/pc/`


# 开发规则

* pc页面转跳微信页面：
    默认在移动设备自动转跳。假如该项目没有微信端，为防止自动转跳，必须在pc页面加参数:`?p=pc_only`,如:`xxx/pc/index.html?p=pc_only`

# 特点

1. `/resource/js/`里的js文件可以合并为 common.js，并自动插入到 html 引用。具体的文件选择及排序可在`okpapa.config.json`的`staticFileConcatOrder`配置。
1. 每个项目的html文件只需包含业务代码，参考模版`_template_def`。
1. 每个项目里新增 `config.json`, 主要用来配置项目的标题，或`html外层模版`的其他变量。可参考模版(/_template_def/)的示例。
1. `html外层模版` 存放在`/resource/html/`里。
1. 每个项目里会自动新增 config_v.js, 无需理会此文件。
1. 如果项目目录不包含 config.json, 将不会使用`html外层模版`，而会把目录顶层的`index.html`视为完整的 html 文件（webpack 编译出来的资源会自动填入）

* 可以使用 ES6，react。
* 可用 handlebar 模版。
* sass、及 autoprofixer 的添加

## 注意的地方

* 假如 pc 端页面 react，ie8 将不兼容
* 关于js里本地图片的引用，不能直接填写地址字符串，要用require。（参考例子）
* 不要在html里直接引用图片，只能在js 或 css 或 handlebars 里引用

## 其他特点

* 由于已有的图片压缩插件会导致图片过低质量，所以暂时不内置图片压缩功能



# 常见问题
    

# Todo

1. write test
1. common.js引用自动加hash参数
2. webpack.config.js转移到项目目录上


