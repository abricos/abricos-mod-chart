var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']},
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        SYS = Brick.mod.sys;

    NS.COLORS = [
        '#5DA5DA',
        '#FAA43A',
        '#60BD68',
        '#F17CB0',
        '#B2912F',
        '#B276B2',
        '#DECF3F',
        '#4D4D4D',
        '#F15854',
    ];


    NS.PieItem = Y.Base.create('pieItem', SYS.AppItem, [], {}, {
        ATTRS: {
            id: {value: 0},
            title: {
                validator: Y.Lang.isString,
                value: ''
            },
            value: {
                validator: Y.Lang.isNumber,
                value: 0
            }
        }
    });

    NS.PieItemList = Y.Base.create('pieItemList', SYS.AppItemList, [], {
        appItem: NS.PieItem,
        comparator: function(item){
            return 0 - item.get('value');
        },
        toReport: function(){
            var maxCount = this.get('maxPartCount'),
                titles = [],
                mains = [],
                percents = [],
                colors = [],
                other = 0,
                otherPercent,
                sum = 0,
                i = 0;

            this.each(function(item){
                var value = item.get('value'),
                    title = item.get('title');
                sum += value;
                if (i < maxCount){
                    mains[mains.length] = value;
                    titles[titles.length] = title;
                } else {
                    other += value;
                }
                i++;
            }, this);

            for (i = 0; i < mains.length; i++){
                colors[i] = NS.COLORS[i];
                percents[i] = Math.round((mains[i] / sum) * 100);
            }

            otherPercent = Math.round((other / sum) * 100);

            return {
                titles: titles,
                values: mains,
                percents: percents,
                other: other,
                otherPercent: otherPercent,
                colors: colors,
                sum: sum
            };
        }

    }, {
        ATTRS: {
            maxPartCount: {value: 8}
        }
    });
};