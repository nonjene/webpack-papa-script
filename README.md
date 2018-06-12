# webpack-papa-script

[![Build Status](https://travis-ci.org/nonjene/webpack-papa-script.svg?branch=master)](https://travis-ci.org/nonjene/webpack-papa-script)
[![Coverage Status](https://coveralls.io/repos/github/nonjene/webpack-papa-script/badge.svg?branch=master)](https://coveralls.io/github/nonjene/webpack-papa-script?branch=master)
[![npm](https://img.shields.io/npm/v/webpack-papa-script.svg)](https://www.npmjs.com/package/webpack-papa-script)

webpack-papa-script 是一个帮助前端开发更轻易地执行从开发到部署的工程化工具。它是一个前端多页面应用、多个项目集成的解决方案，适用于部署大量短期性的页面，方便集成共用组件，快速部署，免去频繁地执行依赖包的安装。比如应用在大量的活动推广专题。



# 特点

- **基于webpack**

    贴紧webpack的生态，目前采用 v3 版本。

- **快速部署** 

    1. 无需编译整个 webpack 项目。可将单页面或某个范围的多个页面视为单个小项目，通过命令进行分开编译，特别适合部署大量的、短期的内容，节省部署时间。而且可同时编译多个小项目或每个小项目独立编译。
    2. 集成了自动上传ftp服务器。
    3. 可通过模版创建一个小项目。

- **共用组件**

    每个小项目互相独立，但可以共用模块。两种实现方式：
    1. **共用组件**。所有小项目都可以 require 共用组件，但因为是独立编译，项目之间不会互相影响，组件更新后，各个项目需重新编译才会生效。这可避免在更新组件后，因项目数量庞大，意外地应用在不应生效的其他项目而导致意外的错误，从而降低更新代码的负担。
    2. **公共代码包**。所有小项目都会引用共代码包，此包有修改，所有已在线上的项目都能获取到更新的公共包，无需重新编译。[部署介绍](#todo:addLink)

- **自动识别页面入口**

    避开了 webpack 的单项目的特性，只需按照简单的约定规则新建一个页面目录, 即自动识别为一个 webpack 编译的入口。并且可保证入口之间的文件目录关系与部署代码的入口之间关系一致，避免混乱。

- **提供便捷的环境切换**

    可在编译时在项目的业务代码里设置、切换不同的内容，让开发过程更为灵活。比如可应用于部署环境的切换及fetch数据的环境切换；
    
- **灵活的开发环境**

    内置了代理功能，便于本地开发打通其他项目环境，比如可共用cookie等缓存。代理的定义比 webpack 的`devServer`更灵活，可以正则匹配路径。

- **灵活的项目部署配置**

    通过`papa.config.js`配置文件，可自定义各项部署功能，比如可定义部署的环境，输出路径，让生产代码是否兼容ie8，或改写webpack配置。[功能文档](#todo:link)


# 如何使用

### 创建一个项目

1. 安装一个工具包

    `npm i create-webpack-papa -g`

1. 创建一个命名为 "proj-hive" 的站点项目

    `create-webpack-papa create proj-hive`

1. 等待依赖文件自动安装完成后，进入项目，即可使用 webpack-papa-script 的各种功能。

    `cd proj-hive`

### 开发一个小项目

- 创建一个命名为 "my-proj1" 单页初始小项目

    `npm run create my-proj1`

- 对 my-proj1 进行本地开发

    `npm run watch my-proj1`

- 部署上线代码, 假如在`papa.config.js`定义线上为`pro`

    `npm run build my-proj1 pro`

- 其他功能参考详细的[命令介绍](#命令介绍)


# 功能介绍

## cli命令

通用地，命令采用`npm run xx`模式，xx代表具体的命令名称, 后面可接其他参数。一些参数内容是与`papa.config.js`的配置对应的。

功能 | 命令 | 例子 | 说明
-----|-----|---- | ---
创建新文件夹/小项目 | create | `npm run create xx` | 创建一个xx小项目。支持层级的目录：假如是`src/2018/abc`，则把`xx`换为`2018/abc`
创建小项目时，选用特定的模版 | t | `npm run create xx t min` | 指定模版为`src/`目录下的`_template_min` (默认模版是`_template_def`)
开启本地开发 | watch | `npm run watch path/to/xx` | `path/to/xx` 代表`src/`下的文件夹，文件夹`xx`需确保[可被识别为一个项目的入口](#如何把一个文件夹被识别为一个项目)
生成部署代码 | build | `npm run build path/to/xx` | 编译目录`path/to/xx`的代码; 可以指定多个位置, 以`,`间隔，如`npm run build path/to/xx,path/to/yy`。默认是部署`config.productEnvType`指定的模式编译; 具体的编译效果请看[具体介绍](#build的介绍)。
批量生成部署代码   | build-all | `npm run build-all` | 自动查找`src/`下的所有的项目，依次自动编译所有。
设置批量生成的范围 | scope | `npm run build-all scope path/to/xx` | 自动查找`src/path/to/xx`下的所有的项目，依次自动编译所有；同`build`命令，`scope`的值也可以包含多个，以`,`间隔。
选择部署方式 | key值 | `npm run build xx test` | `pro`是`config.deployEnvType`中定义的key值, 默认是`test|pre|pro`.
上传代码到ftp | u | `npm run build xx test u`或`npm start u xx` | `xx`在test模式编译后，立即上传; 或指定上传的项目。(上传目录在`config.localAssetPath`设定。)
生成公共资源 | deploy-static | `npm run deploy-static` | 把`./resource/js`打包📦，生成脱离webpack的公共代码包到`./resource/bundle`，并把`./resource/bundle`的所有资源分发到`config.deployEnvType`配置的目录上(watch命令也会自动执行资源分发)
设置前端代码的模式 | mode | `npm run watch xx mode pro` | 把本地开发的代码的环境切换为pro的环境。为了避免误操作，只有在`config.developEnvType`设置的环境下才能使用`mode`(`watch`就是该环境)。假如确实需要在其他环境切换，可以把`mode`换为`hard-mode`
强制编译环境为production | p | `npm run watch xx p` | 一般不需要使用，某些情况为了调试或测试可用。此例子可把本地开发的编译效果改为像build那样
强制编译环境为development | d | `npm run build xx d` | 一般不需要使用，某些情况为了调试或测试可用。效果与`p`相反。

## build的介绍

webpack-papa-script 有非常灵活的编译功能，build的操作可以针对一个或多个或一个范围内的所有项目，详见[使用build命令](#使用build命令)。

此外我们可以在项目下的`papa.config.js`自定义build的各项配置，如: 
- [各种编译模式的定义](#编译模式的定义)
- [编译代码的输出目录](#编译输出)
- [定义如何识别项目](#定义如何识别项目)(约定优先，不再需要手工配置入口，只要目录按照这一个参考系数的规则创建，即自动识别为一个项目)

### 使用build命令

先假设一个papa项目上有以下这样的目录结构，它含有三个小项目`foo`,`bar/baz`,`bar/qux`：
```shell
  |-build
  |-dist
  |-node_modules
  |-resource
  |-src
  |---foo
  |-----index.js
  |-----index.html
  |---bar
  |-----baz
  |-------index.js
  |-------index.html
  |-----qux
  |-------index.js
  |-------index.html
```

`npm run build` 后面接需要build的目标即可，目标是一个基于项目目录`src`下的子目录，如：

  - `npm run build foo` 代表编译`src/foo`这个项目，

  - `npm run build bar/baz` 代表`src/bar/baz`这个项目。

目标可以设置为多个，一个命令build多个项目。用`,`隔开：
 
  -  `npm run build foo,bar/baz` 同上面两条命令分别执行的效果。

目标可以设置为一个范围内的所有小项目，如：

  - `npm run build-all` 代表编译`src`下的所有项目。
  - `npm run build-all scope bar` 代表编译`src/bar`下的所有项目，按照以上的例子，则是`bar/baz`和`bar/qux`。

同样，指定的范围也可以包含多个，用`,`隔开。(注意例子中的`foo`本身是一个项目，用`scope`是不能识别的)


### 编译模式的定义

编译模式分了两个概念，一个是**前端环境**，一个是**编译模式**。我们可以通过`papa.config.js`定义这些配置，然后在命令行可以使用配置里所定义的名称。

#### 前端环境
我们上线一个项目前通常需要经过几个过程，如本地开发环境，测试环境，预发布环境等。我们通过`papa.config.js`定义这些前端环境，并且将这些环境变量注入到前端代码里。相关的属性例子如下：

`deployEnvType` key值定义有哪些环境，值为编译的输出目录。如以下定义了 `test|pre|pro` 3个。
```js
  deployEnvType:{
      test: 'build/activity',
      pre: 'dist/pre',
      pro: 'dist/pro'
  }
```
`deployEnvMapFetch` 可以定义环境对应的前端环境变量，该值会注入编译后的代码里。
```js
  deployEnvMapFetch: {
      test: 'test',
      pre: 'pre',
      pro: 'produce'
  },
```
`frontendConfCode` 就是注入的js代码模版，它接收两个变量，其中一个是`mode`即为前端环境变量。详细例子参考[使用方法](#如何使用)生成的`papa.config.js` 例子。

有了这些配置后，我们就可以在命令中指定我们要使用哪一个环境：

`npm run build foo [test|pre|pro]`

假如我们不指定环境的话，它会自动选取 papa.config.js 的`productEnvType`定义的环境。


#### 编译模式
固定了两种：开发模式和发布模式
我们可以用`developEnvType`定义上文中`deployEnvType`里的哪个前端环境为开发模式，其它则自动作为发布模式：
```js
  developEnvType:{
      deploy: 'test',
      fetch: 'test'
  }
```
`deploy` 是环境的命名，需要是`deployEnvType`中的一个key值；
`fetch` 是前端环境变量，跑`watch`命令时会使用这个值，一般上与`deployEnvMapFetch`对应的一致即可。

运行`watch`时，webpack的`devtool`是`#inline-source-map`。 
运行`build`时，假如前端环境等于`developEnvType`的定义，则`devtool`为`eval`。其他情况则不声明 devtool。
当然可以通过`papa.config.js`的`webpackConfig`强制改写webpack配置属性。


### 编译代码的输出目录

编译输出位置即上文的[前端环境](#前端环境)提到的`deployEnvType`中定义。


### 定义如何识别项目

项目识别的参考值定义在 `papa.config.js`，当目录中含有`projContainsOneOf`的值，就识别为项目，其中，假如该目录拥有`proj.json`, 则识别为一个多页项目，其它情况就是单页项目。

具体介绍如下：

参数名 | 值例子 | 描述
----  | --- |----
projContainsOneOf | `['m', 'pc', 'proj.json', 'config.json']` | 辨别一个项目时，只要一个文件夹里面包含此属性定义的文件或文件夹名，则认定它为一个项目。（无论单独页面还是多页面）
projScanExclude | `['modules','components', 'img', 'js']` | 获取所有项目时，排除以下这些文件夹里面的内容
entryInclude | `['index.js', 'index.html']` | 入口文件夹必须包含这些文件。一般不要更改这个值，其中包含 index.js, webpack才能正常编译
commSingleProjSubPage | `['m', 'pc']` | 可以定义通用的，每个小项目可以默认包含这些子页面，它们共享`config.json`，无需每个这种页面都添加 多页项目识别文件`proj.json`。 比如一个单页项目，不适合做响应式，需要包含电脑端和移动端两个页面。可以定义为空，则忽略掉这个情况。具体请看默认的初始化项目中的模版项目。


## 部署非webpack的公共静态资源

公共静态资源存放在`resource/bundle`文件夹中，js资源放在`resource/js`。

运行`npm run deploy-static`部署后，会按照`config.staticFileConcatOrder`, 在`js`文件夹内查找到，合并压缩至`resource/bundle`，并把所有bundle资源分发到`config.deployEnvType`定义的所有文件夹。 
运行`npm run watch` 时，会自动把bundle复制到`config.developEnvType`对应的文件夹，无需手动运行`npm run deploy-static`。

合并的 js 资源将会在所有编译后的页面的html中插入引用。

## 项目风格

### 小项目的识别

如上文[定义如何识别项目](#定义如何识别项目)所介绍，一个目录含有`proj.json`就识别为一个多页项目，否则假如符合`projContainsOneOf`的范围的话，则识别为一个单页项目。

多页项目里，程序将寻找所有符合`entryInclude`的识别为页面；单页项目假如含有`commSingleProjSubPage`定义的子页面的话，则自动识别为拥有子页面, 参考下文的[html风格](#html风格)

### html风格
  每个页面的html文件只需包含业务代码，编译后会将内容传入html模版。
  每个页面都包含一个`config.json`文件，用于定义html模版的变量，如：
  ```shell
    |-foo
    |---config.json
    |---index.js
    |---index.html
  ```
  假如定义了`commSingleProjSubPage`, 而且项目中含有这些子页面，则json文件放在子页面文件夹的同级, 假如该值是 `['m','pc']`, 则如下：
  ```shell
    |-foo
    |---config.json
    |---m
    |-----index.js
    |-----index.html
    |---pc
    |-----index.js
    |-----index.html
  ```
  默认的，用`npm run create`命令创建的模版项目是以上第二个的目录结构。

  `config.json`有如下示例：

  属性 | 默认值 | 描述
  --|--|--
  title| `标题` | html的`<title/>`
  htmlFile | `index.html` | 指定html文件的名字
  templateName_xx |  `index_xx.handlebars` | 指定html模版文件。xx 是假如此页面包含 `commSingleProjSubPage`定义的子页面，xx就是该子页面名字。
  templateName_comm | `index_comm.handlebars` | 假如该页面不包含`commSingleProjSubPage`的子页面, 则使用这个来指定模版
  bodyProp | `""` | `<body/>`的属性 比如`"class=\"top\" data-version=\"3.0.0\""`
  moreMeta | `""` | `<head/>`内添加内容。如`"<link rel=\"dns-prefetch\" href=\"https://www.github.com\">"`

  模版文件位于`resource/html`。

  如果项目目录不包含 config.json, 将不会使用`html模版`，而会把目录顶层的`index.html`视为完整的 html 文件（webpack 编译出来的资源会自动填入）

### 本地开发

本地开发采用 webpack-dev-server，开启了自带的热更新功能，并且整合了比较灵活的代理功能。

在一些场景中，比如我们这个项目并非一个完全独立的站点，它还需要与其他项目联动，那么代理功能就非常实用了。我们可以通过`papa.config.js` 的 `proxy` 设置代理，可以通过正则匹配路径实现代理, 并可以设置多个匹配规则。
如以下配置, 代理了路径以非 "activity" 开头的所有请求 到本地的80端口：
```js
proxy:[
      {
        filterPathname: /^\/(?!activity\/)/, 
        target: 'http://localhost:80',
      },
    ],
```

## 集成功能

webpack-papa-script 基于webpack，已集成所有常见资源的处理，以下是集成功能的列表：
* **ES6 -> es5**
* **React**
* 集成**babel-runtime**，Promise随便用
* 可开启ie8兼容，把代码转为es3

    在`resource/html/index_pc.handlebars`模版里，加了ie8以下 es5-slim和 sham 文件的引用，我们可以按照实际场景把该引用链接更换。
    该文件在`resource/bundle/`中已预置，执行  
    ```shell
    npm run deploy-static
    ```
    即可把es5-slim-sham文件复制到部署目录中。

* **handlebar**
* **sass-postcss-autoprofixer**
* **webpack-dev-server**    本地开发集成热更新及代理
* **extract-text-webpack-plugin**   build时独立出css文件

## 编译支持的文件格式：

* js[x]
* [s]css
* png|jpg|gif|svg
* handlebars|tmpl
* woff|woff2|eot|ttf
* pdf

## 编译支持的特殊文件：

* sw.js

  使用 file-loader 编译，require后就会把该文件独立释出到输出目录；输出文件名带hash值，可确保sw更新被触发。

* manifest.json

  同样使用 file-loader 编译，但不带hash值，便于固定写在html模版。

* \*.iso.(png|gif)
  
  绝对不合并到css文件。其他的小于 4KB 的图片将转为 base64 合并入css文件


以下内容因有不理想的效果，所以没有支持：

* 图片压缩功能

  转换png时，现有的图片压缩插件是把png24转为png8，会导致图片低质量，所以在找到更好的压缩功能后再添加该功能。

* `.html`文件内的资源引用

  如index.html假如有`<img src="foo.jpg"/>`，foo.jpg无法解析。这类功能请转移到css、React 或 handlebars实现。

## eject

假如 webpack-papa-script 满足不了项目的需要，随时可运行 `create-webpack-papa eject`，把 webpack-papa-script 的代码转移到项目目录上，对构建代码自行修改。不过需要注意的是，该操作无法逆转，操作前请确认清楚。

## 项目配置
  以下是默认配置，我们可以在项目的 papa.config.js 修改这些属性：

```js
{
    // 自动上传ftp需要的配置信息
    ftp: {
      host: '192.168.1.1',
      port: '',
      user: 'user',
      password: 'ps'
    },

    // ftp的根目录
    remoteBasePath: '',
    
    // ftp的目录
    remotePath: '/activity/{$target}/',

    // 需要上传到ftp的根目录
    localAssetPath: 'build/activity',

    // 部署上线时的host
    domainName: 'http://m.okpapa.com',

    // js,css,image 等资源的host
    cdnDomain: 'https://images.okpapa.com',
    
    // 代理信息, 数据类型: object array 
    proxy:[
      {
        filterPathname: /^\/(?!activity\/)/,  // 代理 pathname 以非 activity开头的所有请求
        target: 'http://localhost:80',
      },
    ],
    
    //本地开发环境的服务端口
    servePort: 3005,
    
    // 本地开发环境的静态资源基目录（同 devServer.contentBase）
    serveContentBase:'./build/',
    
    // `resource/js` 中的js文件的合并顺序，合并生成脱离webpack的公共代码包 
    staticFileConcatOrder: [],

    // 合并js的命名
    staticFileName:'common.js',

    // 脱离webpack的公共文件的输出子路径
    staticFileSubPath:'static',

    // 覆盖预置的webpack配置
    webpackConfig: {},

    // 是否支持ie8
    kiss_ie8: true,

    // 定义一个页面下面还分哪些版本页面。
    // 比如一个单页项目，不适合做响应式，需要包含电脑端和移动端两个页面。可以定义为空，则忽略掉这个情况
    commSingleProjSubPage:['m', 'pc'],

    // 辨别一个项目时，只要一个文件夹里面包含以下文件或文件夹，则认定它为一个项目。（无论单独页面还是多页面）
    projContainsOneOf: ['m', 'pc', 'proj.json', 'config.json'],

    // 获取所有项目时，排除以下这些文件夹里面的内容（不会在已识别为proj的文件夹里再查找）
    projScanExclude:['modules', 'module', 'static', 'components', 'component', 'img', 'js'],

    // 验证 webpack 入口必须包含这个值的所有文件。
    entryInclude: ['index.js', 'index.html'],

    //本地开发环境的命名和前端代码注入的环境变量名。
    developEnvType: {
      deploy: 'test', //命名
      fetch: 'test'   //环境变量名
    },
    
    //正式上线的环境
    productEnvType: {
      deploy: 'pro',
      fetch: 'produce'
    },

    //环境名称对应的输出路径
    deployEnvType: {
      pre: 'dist/pre',
      pro: 'dist/pro',
      test: 'build/activity'
    },

    //环境名称对应的前端环境变量名
    deployEnvMapFetch: {
      pre: 'pre',
      pro: 'produce',
      test: 'test'
    },

    // 环境名称的中文名，用于命令行的显示
    releaseEnvDesc: {
      pre: '预发环境😛',
      pro: '生产环境😝',
      test: '开发环境🤔'
    },

    // 前端环境的中文名
    fetchEnvDesc: {
      pre: '预发环境🥑',
      test: '测试环境🥝',
      produce: '生产环境🍓'
    },
    // 前端代码注入内容
    // mode: 前端环境变量
    // debug: 环境与productEnvType一致时，则为false，否则true
    frontendConfCode:`try{
      Object.assign(window.publicConfig, {
        mode:"{$mode}",
        debug:{$debug}
      });
    }catch(e){}`,
  },
```

## 常见问题

