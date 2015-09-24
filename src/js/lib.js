var Component = new Brick.Component();
Component.requires = {
    ext: [{
        name: 'raphael',
        fullpath: [
            '/vendor/raphael/raphael-min.js',
            '/vendor/g.raphael/g.raphael-min.js'
        ],
        type: 'js'
    }]
};
Component.entryPoint = function(NS){
    var COMPONENT = this,
        SYS = Brick.mod.sys;

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            this.initCallbackFire();
        }
    }, [], {
        ATTRS: {},
        REQS: {},
        URLS: {}
    });
};
