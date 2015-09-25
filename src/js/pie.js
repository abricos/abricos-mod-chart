var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.PieChartWidget = Y.Base.create('pieChartWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var pieItemList = this.get('pieItemList');
            if (!pieItemList){
                return;
            }
            var tp = this.template,
                chartNode = tp.one('chart'),
                width = chartNode.get('offsetWidth'),
                maxRadius = this.get('maxRadius'),
                x = width / 2,
                radius = width / 2;

            if (maxRadius > 0 && radius > maxRadius){
                radius = maxRadius;
            }

            var height = Math.min(radius * 2, width);

            chartNode.set('offsetHeight', height);

            var report = pieItemList.toReport();

            var r = Raphael(tp.gelid('chart'));

            r.piechart(x, height / 2, radius, report.values);
        },
        destructor: function(){
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            pieItemList: {},
            maxRadius: {value: 0}
        },
        CLICKS: {}
    });

};