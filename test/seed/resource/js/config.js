// 公共配置文件
window._publicConfig = (function(window) {
    let commonParams;

    if (window.okPapa.page.isPC) {
        commonParams = {};
    } else {
        commonParams = {};
    }

    return {
        version: "1.0.0",
        mock: [],
        mockReplace: {},
        commonParams: commonParams,
        // 开发模式( develop:开发环境，test:测试环境，gray:灰度环境，produce:生产环境)
        // 对应不同接口地址，请在 config_v.js 修改，或参考readme.md 使用命令修改
        mode: "produce",
        // 默认开启调试模式
        debug: false,
        //  根目录变量，用于后期可能的子目录
        root: "/",
        absRoot: window.location.protocol + "//" + window.location.host + "/",
        // 默认协议
        protocol: "//",
        // 接口主地址
        host: {}
    };
})(window);
