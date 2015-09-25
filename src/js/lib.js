var Component = new Brick.Component();
Component.requires = {
    ext: [
        {
            name: 'raphael',
            fullpath: '/gzip.php?base=vendor&v=2.14&file=raphael/raphael-min.js,g.raphael/g.raphael-min.js,g.raphael/g.pie-min.js',
            type: 'js'
        }
    ],
    mod: [
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){
    var COMPONENT = this,
        SYS = Brick.mod.sys;

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            this.initCallbackFire();
        }
    }, [], {
        ATTRS: {
            PieItem: {value: NS.PieItem},
            PieItemList: {value: NS.PieItemList}
        },
        REQS: {},
        URLS: {}
    });
};
