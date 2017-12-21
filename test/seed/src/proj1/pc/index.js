// 为了监听修改
if (process.env.NODE_ENV !== "production") {
  require("./index.html");
}

require("./index.scss");

const path = document
  .getElementById("triangles_logo")
  .querySelectorAll("[fill-opacity]");

const length = path.length;
const show = i => {
  requestAnimationFrame(() => {
    path[i].setAttribute("fill-opacity", path[i].dataset.fillOpacity);
    if (++i < length) {
      return show(i);
    }
  });
};
show(0);
