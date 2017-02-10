var config = {};
var extend = require('aimee-extend');
var lib = require('linco.lab').lib;
var map = {};

var cvert = {

    // PX => REM
    px2rem: function(s1, s2, s5, val){
        return s1 ?
            [s1 + s2 + val, 'rem' + s5].join(''):
            [s2 + val, 'rem' + s5].join('');
    },

    // AM => PX
    am2px: function(){
        var arr = [].slice.call(arguments, 0);
        var s1 = arr.shift();
        return s1 ?
            s1 + arr.join('') : arr.join('');
    },

    // REM => PX
    rem2px: function(s1, s2, s5, val){
        return s1 ?
            [s1 + s2 + val, 'px' + s5].join(''):
            [s2 + val, 'px' + s5].join('');
    },

    // PX => REM四舍五入的处理
    roundingPX: function(num){
        // 非法值默认处理为none
        if(config.rounding !== 'none' && !Math[config.rounding]){
            config.rounding = 'none'
        }

        return config.rounding === 'none' ?
            // 如果为true，不进行四舍五入，默认浏览器去处理
            (num/config.constant *100)/100 :
            // 如果为false，调用Math方法
            Math[config.rounding](num/config.constant *100)/100;
    },

    // REM => PX四舍五入的处理
    roundingREM: function(num){
        // 非法值默认处理为none
        if(config.rounding !== 'none' && !Math[config.rounding]){
            config.rounding = 'none'
        }

        return config.rounding === 'none' ?         
            parseInt((num*config.constant *100)/100) :
            (Math[config.rounding](num*config.constant *100)/100).toString().indexOf('.0') > -1 ? 
                // 如果结果后边有小数'.0'，直接取整，否则调用Math方法
                parseInt(Math[config.rounding](num*config.constant *100)/100):
                Math[config.rounding](num*config.constant *100)/100;
    }

}

module.exports = function(content, file, conf) {

    //匹配所有数字(包括小数 整数)+px/rem/am
    var regx = /(border[^:]*)?(:?\s?)((?:[\d]+)?\.?[\d]+)(rem|px|am)([\s;]+)/ig;

    var ct = {

         /**
         * PX/REM/AM相互转换
         * @param  {String}   content    整个样式文件内容
         * @param  {number}   constant   转换的常量值默认100, 1rem=100px, 可以是整数/小数
         * @param  {String}   convertTo  默认px, 将rem转换为px
         * @param  {String}   rounding   默认round四舍五入; ceil向下取整; floor向上取整; none不做任何处理
         * @param  {Boolean}  am2px      默认false, 为true时样式表中所有的am转换为px
         * @param  {Boolean}  border     默认false, border：true且border1px：false, 除了border 1px, 其他的都将px转化为rem
         * @param  {Boolean}  border1px  默认false, border：true且border1px：true, 所有的px转换为rem
         */

        //PX => REM
        _px2rem: function(content){
            return content.replace(regx,function(s, $1, $2, $3, $4, $5){

                // PX => REM
                if(/px/.test($4)){
                    // 检查border如果为true, 除border为1px, 返回其他PX=>REM的处理结果
                    if(config.border){
                        // 检查border1px如果为true，返回所有PX=>REM的处理结果
                        return config.border1px ?
                            cvert.px2rem($1, $2, $5, cvert.roundingPX($3)):
                            // 如果为false，检查 $3 === 1返回原字符串，否则返回PX=>REM的处理结果
                            Number($3) === 1 ? s : cvert.px2rem($1, $2, $5, cvert.roundingPX($3));
                    }
                    // 检查border如果为false，除border，返回其他PX=>REM的处理结果
                    else{
                        // 检查匹配到的$1为undefined，返回除border之外的其他结果，如果$1不为undefined不做任何处理返回原字符串
                        return $1 ? s :
                            cvert.px2rem($1, $2, $5, cvert.roundingPX($3));
                    }
                }

                // AM => PX
                return config.am2px && /am/.test($4) ?
                    // 检查am2px如果为true，直接返回AM=>PX的处理结果，否则返回原字符串
                    cvert.am2px($1, $2, $3, $4.replace('am', 'px'), $5) : s;

            });

        },

        // REM => PX
        _rem2px: function(content){
            return content.replace(regx,function(s, $1, $2, $3, $4, $5){

                // REM => PX
                if(/rem/.test($4)){
                    // 检查border如果为true, 除border为1px, 返回其他REM=>PX的处理结果                   
                    if(config.border){
                        return config.border1px ?
                            cvert.rem2px($1, $2, $5, cvert.roundingREM($3)):
                            // 如果为false，检查 $3 === 1返回原字符串，否则返回REM=>PX的处理结果
                            Number($3) === 1 ? s : cvert.rem2px($1, $2, $5, cvert.roundingREM($3));

                    }
                    // 检查border如果为false, 除border, 返回其他REM=>PX的处理结果
                    else{
                        // 检查匹配到的$1为undefined，返回除border之外的其他结果，如果$1不为undefined不做任何处理返回原字符串
                        return $1 ? s :
                            cvert.rem2px($1, $2, $5, cvert.roundingREM($3));
                    }
                }

                // AM => PX
                return config.am2px && /am/.test($4) ?
                    // 检查am2px如果为true，直接返回AM=>PX的处理结果，否则返回原字符串
                    cvert.am2px($1, $2, $3, $4.replace('am', 'px'), $5) : s;

            });

        },

        // AM => PX
        _am2px: function(content){            
            return content.replace(regx, function(s, $1, $2, $3, $4, $5){
                // AM => PX
                return /am/.test($4) ?
                    // 检查am2px如果为true，直接返回AM=>PX的处理结果，否则返回原字符串
                    cvert.am2px($1, $2, $3, $4.replace('am', 'px'), $5) : s;
            });           
        }

    };

    //如果没有配置, 直接将页面中的am单位替换为px
    if(lib.isEmptyObject(conf)){
        file._content = ct._am2px(file._content);
    }    

    var defaults = {
        constant: 100,
        convertTo: 'rem',
        rounding: 'round',
        am2px: false,
        border: false,
        border1px: false
    }       

    //参数合并
    config = extend({}, defaults, conf);

    //如果有配置, 找到所有less文件, 根据配置参数进行单位转换并重新写入文件    
    config.convertTo == 'rem' ?
        file._content = ct._px2rem(file._content):
        file._content = ct._rem2px(file._content);

    return file._content;
    
};