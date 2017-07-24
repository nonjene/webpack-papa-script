/**
 * Created by chenzhian on 8/3/2016.
 */
module.exports = function(t, val) {
    for (let prop in val) {
        t = t.replace(new RegExp('\\{\\$' + prop + '\\}', 'g'), val[prop]);
    }
    return t;
};
