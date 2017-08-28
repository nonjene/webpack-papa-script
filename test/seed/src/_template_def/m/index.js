if (process.env.NODE_ENV !== "production") {
    require("./index.html");
}

require("./index.scss");

//活动常用功能包
const tools = require("modules/tools");

//例子
const tpl = require("../mod.handlebars");
const tplData = {
    img: {
        example: require("modules/img/example.jpg")
    }
};

$("#container").append(tpl(tplData));
