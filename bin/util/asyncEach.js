/**
 * Created by Nonjene on 2017/3/1.
 */
/**
 * 异步解构数组 arr（相当于异步的 forEach、map、filter）
 * done 返回 filter 函数返回的值得集合, 相当于 array.map 的返回值。
 * 函数 filter 的 next 不返回值(或 undefined)的话，done 的回传值相当于 array.filter 的 item 返回 false, 把此单项过滤。
 * @param arr       被筛选的源数组
 * @param filter    筛选逻辑, 或者作为 forEach 逻辑。
 *                  @filter 回调函数定义: (list:array, next:function)
 *                  @next：map 一个单项。注意不支持复合数组：假如传了数组，将会合并到 map 的结果里。
 *
 * @param done      回调：带回 map 的结果
 */
function asyncEach(arr, filter, done) {
  let filterResult = [];
  let run = function(i) {
    if (i > arr.length - 1) {
      return done(filterResult);
    }
    filter(arr[i], function(items) {
      if (items === undefined) {
        if (!(items instanceof Array)) items = [items];

        filterResult = [...filterResult, ...items];
      }
      return run(i + 1);
    });
  };

  run(0);
}

module.exports = { asyncEach };
