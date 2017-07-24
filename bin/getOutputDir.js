/**
 * Created by Nonjene on 2017/3/9.
 */

module.exports = PRO_SPECIFIC => {
    let outputDir;
    // 设置出口地址，有PRO_SPECIFIL代表执行了okpapa r，不是预发就是生产。
    if (PRO_SPECIFIC) {
        switch (PRO_SPECIFIC) {
            case "pre":
                outputDir = "dist/pre";
                break;
            case "pro":
                outputDir = "dist/pro";
                break;
            case "test":
                outputDir = "build/activity";
                break;
            default:
                throw new Error("没有指定是生产环境还是预发环境。");
        }
    } else {
        outputDir = "build/activity"; // activity加多一层文件夹是为了本地服务识别代理
    }
    return outputDir;
};
