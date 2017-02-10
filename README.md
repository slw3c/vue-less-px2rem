# vue-less-px2rem

----
用于样式表中px/rem相互转换

```
npm install vue-less-px2rem -g
```

```
fis.config.merge({
    modules: {
        parser:{
            less: ['less-px2rem']
        }       
    },

    settings: {
        parser: {
            // 插件配置
            'less-px2rem': { 
                constant: 100,
                convertTo: 'rem',
                rounding: 'round', //floor ceil round none
                am2px: true, //可选
                border: true, //可选convertTo: 'rem'才起作用, 除了border 1px, 其他的都将px转化为rem
                border1px: true //可选convertTo: 'rem'才起作用, 所有的px转换为rem
            } 
        }
    }
})
```