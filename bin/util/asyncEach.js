/**
 * Created by Nonjene on 2017/3/1.
 */
/**
 * 异步解构数组arr（相当于异步的forEach），done返回filter函数返回的值得集合。filter函数的calllback不返回值的话，则可看作是forEach逻辑
 * @param arr       被筛选的源数组
 * @param filter    筛选逻辑, 或者作为forEach逻辑。
 *                  @filter回调函数定义: (list:array, next:function)
 *
 * @param done      回调
 */
function asyncEach(arr, filter, done) {
    let filterResult = [];
    let run = function (i) {
        if (i > arr.length - 1) {
            return done(filterResult);
        }
        filter(arr[i], function (items) {
            if (items) {
                if (!(items instanceof Array)) items = [items];

                filterResult = [...filterResult, ...items];
            }
            return run(i + 1);
        });
    };

    run(0);
}

module.exports = { asyncEach };
