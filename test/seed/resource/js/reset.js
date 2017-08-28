(function(win, doc) {
  win.okPapa = win.okPapa || {};
  win.okPapa.browser = {};
  // 辨别是否为移动端的规则，2中1即可：
  // 1.路径必须包含/m/或是/m$
  // 2.参数是p=m
  win.okPapa.page =
    /\/m(\/|$)/.test(location.pathname) || /p=m/.test(location.search)
      ? { isMob: true, isPC: false }
      : { isMob: false, isPC: true };

  // 移动设备的pc页面 转跳到移动端页面
  if (
    win.okPapa.browser.versions.mobile &&
    win.okPapa.page.isPC &&
    !/p=pc_only/.test(location.search)
  ) {
    location.href = location.href
      .replace(/(https*:\/\/)www/, '$1m')
      .replace(/\/pc(\/|$)/, '/m$1');
  }

  // 设置body的最小高度为可视区的高度
  if (win.okPapa.page.isMob) {
    win.addEventListener('load', function() {
      var docHeight = doc.documentElement.clientHeight;
      var bodyHeight = doc.body.offsetHeight;
      if (bodyHeight < docHeight) {
        doc.body.style.height = docHeight + 'px';
      }
    });
  }
})(window, document);
