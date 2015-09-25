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
                radius = width / 2;

            if (maxRadius > 0 && radius > maxRadius){
                radius = maxRadius;
            }

            var height = Math.min(radius * 2, width);

            chartNode.setStyle('min-height', height + 10);

            var report = pieItemList.toReport();

            var r = Raphael(tp.gelid('chart'));

            var pie = r.piechart(radius + 5, height / 2 + 5, radius, report.values, {
                legend: report.titles
            });
            pie.hover(function(){
                this.sector.stop();
                this.sector.scale(1.02, 1.02, this.cx, this.cy);
            }, function(){
                this.sector.animate({transform: 's1 1 ' + this.cx + ' ' + this.cy}, 500, "bounce");
            });
        },
        destructor: function(){
        },
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            pieItemList: {},
            maxRadius: {value: 0},
            legendpos: {// east, north, south, west
                value: 'none'
            }
        },
        CLICKS: {}
    });

};