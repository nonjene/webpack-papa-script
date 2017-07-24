/**
 * Created by chenzhian on 8/1/2016.
 */
module.exports = function () {
    return (new Date())
        .toISOString()
        .replace(/-/g, '')
        .replace(/[:|.]/g, '_')
        .replace(/(\d\d)T(\d\d)/, (match, date, hour)=> {
            //转换为东八区
            hour = +hour + 8;
            date = +date;
            if (hour > 23) {
                date += 1;
                hour = hour - 24;
            }
            if (hour < 10) {
                hour = '0' + hour.toString();
            }
            if(date<10){
                date = '0' + date.toString();
            }
            return date + 'T' + hour;
        });

}