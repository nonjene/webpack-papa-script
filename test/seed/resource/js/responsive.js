/**
 * Created by Nonjene on 2017/2/13.
 */
// 设置页面rem大小
(function(doc, win) {
    if (win.okPapa.page.isPC) return;

    var maxWidth = 750;
    var baseWidth = 750;
    var baseFontSize = 100;
    var docEle = doc.documentElement,
        dpr = Math.min(win.devicePixelRatio, 3),
        scale = 1 / dpr,
        resizeEvent = "orientationchange" in win ? "orientationchange" : "resize";

    docEle.dataset.dpr = dpr;
    /*var metaEle = doc.createElement('meta');
    metaEle.name = 'viewport';
    metaEle.content = 'width=device-width,initial-scale=' + scale + ',maximum-scale=' + scale;
    docEle.firstElementChild.appendChild(metaEle);*/
    var recalCulate = function() {
        var width = docEle.clientWidth;
        if (width > maxWidth) {
            width = maxWidth;
        }
        //if (width / dpr > maxWidth) {
        //    width = maxWidth * dpr;
        //}
        docEle.style.fontSize = baseFontSize * width / baseWidth + "px";
    };
    recalCulate();
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvent, recalCulate);
})(document, window);
