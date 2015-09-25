var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']},
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        SYS = Brick.mod.sys;

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
                other = 0,
                otherPercent = 0,
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
                percents[i] = (sum / 100) * mains[i];
            }

            otherPercent = (sum / 100) * other;

            return {
                titles: titles,
                values: mains,
                percents: percents,
                other: other,
                otherPercent: otherPercent,
                sum: sum
            };
        }

    }, {
        ATTRS: {
            maxPartCount: {value: 8}
        }
    });

};