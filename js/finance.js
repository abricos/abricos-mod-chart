/*
@version $Id: api.js 132 2009-11-02 09:05:07Z roosit $
@package Abricos
@copyright Copyright (C) 2010 Abricos. All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[{name: 'chart', files: ['raphael.js', 'lib.js']}]
};
Component.entryPoint = function(){
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;

	var NS = this.namespace,
		API = NS.API,
		TMG = this.template;

	var N = NS.lib.Number, NF = NS.lib.NumberFormat;
	
	var buildTemplate = function(w, templates){
		var TM = TMG.build(templates), T = TM.data, TId = TM.idManager;
		w._TM = TM; w._T = T; w._TId = TId;
	};
	
	var FinanceLineChart = function(el, lines, config){
		var config = L.merge({
			title: '',
			nostroke: false, 
			axis: "0 0 1 0",
			symbol: "o",
			smooth: false,
			shade: false
		}, config || {});
		this.init(el, lines, config);
	};
	FinanceLineChart.prototype = {
		init: function(el, lines, config){
			lines = lines || [];
			
			buildTemplate(this, 'error0');

			var rel = Dom.getRegion(el);
			if (lines.length == 0 || lines[0].data.length == 0){
				el.innerHTML = this._T['error0'];
				return;
			}
			el.innerHTML = "";
			var data = lines[0].data, x = [], y = [];

			for (var i=0;i<data.length;i++){
				x[x.length] = i;
				y[y.length] = data[i][1];
			}
			
			var cfg = config;
			cfg['axisxstep'] = x.length-1;
			
			var r = Raphael(el);
			var chart = r.g.linechart(
				5, 5, rel.width-10, rel.height-15, 
				[x], [y], cfg
			);
			chart.symbols.attr({r: 3});
			
			if (cfg.title && cfg.title.length > 0){
				r.set().push(r.text(100, 15, cfg.title).attr({
					font: '16px Helvetica, Arial', 
					stroke: "#999999",
					"stroke-width": .3
				}));
			}
			
			for(var i in chart.axis[0].text.items){
				chart.axis[0].text.items[i].attr({'text': ''});
			}

			var txt = {font: '12px Helvetica, Arial', fill: "#fff"},
				txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
				colorhue = .6 || Math.random(),
		        color = "hsb(" + [colorhue, .5, 1] + ")";

			chart.hoverColumn(function() {
				var price = data[this.axis][1], date = data[this.axis][0]; 
				var sPrice =  N.format(price, NF),
					sDate = NS.lib.dayToString(NS.lib.dateServerToClient(date));

				this.tags = r.set();
				
				var label = r.set();
				
				var x = this.x, y = this.y[0];
				
				label.push(r.text(x, y+12, sDate).attr(txt));
			    label.push(r.text(x, y+27, sPrice).attr(txt1).attr({fill: "#fff"}));
			    
			    var side = "right";
			    if (x + 80 > r.width) {
                    side = "left";
                }
			    var frame = r.popup(x, y, label, side).attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7});

			    this.tags.push(frame);
			    this.tags.push(label);
			    
			}, function() {
				this.tags && this.tags.remove();
			});			
			
			
		}
	};
	NS.FinanceLineChart = FinanceLineChart; 
	

	var tokenRegex = /\{([^\}]+)\}/g,
	    objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches .xxxxx or ["xxxxx"] to run over object properties
	var replacer = function (all, key, obj) {
	        var res = obj;
	        key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
	            name = name || quotedName;
	            if (res) {
	                if (name in res) {
	                    res = res[name];
	                }
	                typeof res == "function" && isFunc && (res = res());
	            }
	        });
	        res = (res == null || res == obj ? all : res) + "";
	        return res;
	    };
	var fill = function (str, obj) {
        return String(str).replace(tokenRegex, function (all, key) {
            return replacer(all, key, obj);
        });
    };
	  
    Raphael.fn.popup = function (X, Y, set, pos, ret) {
        pos = String(pos || "top-middle").split("-");
        pos[1] = pos[1] || "middle";
        var r = 5,
            bb = set.getBBox(),
            w = Math.round(bb.width),
            h = Math.round(bb.height),
            x = Math.round(bb.x) - r,
            y = Math.round(bb.y) - r,
            gap = Math.min(h / 2, w / 2, 10),
            shapes = {
                top: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                bottom: "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                right: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
                left: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
            },
            offset = {
                hx0: X - (x + r + w - gap * 2),
                hx1: X - (x + r + w / 2 - gap),
                hx2: X - (x + r + gap),
                vhy: Y - (y + r + h + r + gap),
                "^hy": Y - (y - gap)
                
            },
            mask = [{
                x: x + r, y: y,
                w: w, w4: w / 4,
                h4: h / 4,
                right: 0, left: w - gap * 2,
                bottom: 0, top: h - gap * 2,
                r: r, h: h,
                gap: gap
            }, {
                x: x + r, y: y,
                w: w, w4: w / 4,
                h4: h / 4,
                left: w / 2 - gap, right: w / 2 - gap,
                top: h / 2 - gap, bottom: h / 2 - gap,
                r: r, h: h,
                gap: gap
            }, {
                x: x + r, y: y,
                w: w, w4: w / 4,
                h4: h / 4,
                left: 0, right: w - gap * 2,
                top: 0, bottom: h - gap * 2,
                r: r, h: h,
                gap: gap
            }][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
            var dx = 0,
                dy = 0,
                out = this.path(fill(shapes[pos[0]], mask)).insertBefore(set);
            switch (pos[0]) {
                case "top":
                    dx = X - (x + r + mask.left + gap);
                    dy = Y - (y + r + h + r + gap);
                break;
                case "bottom":
                    dx = X - (x + r + mask.left + gap);
                    dy = Y - (y - gap);
                break;
                case "left":
                    dx = X - (x + r + w + r + gap);
                    dy = Y - (y + r + mask.top + gap);
                break;
                case "right":
                    dx = X - (x - gap);
                    dy = Y - (y + r + mask.top + gap);
                break;
            }
            out.translate(dx, dy);
            if (ret) {
                ret = out.attr("path");
                out.remove();
                return {
                    path: ret,
                    dx: dx,
                    dy: dy
                };
            }
            set.translate(dx, dy);
            return out;
    };
	/*
	var DateLineChart = function(container, x, y, width, height, lines, config){
		container = Dom.get(container);
		this._x = x || 0;
		this._y = y || 0;
		this._width = width || 0;
		this._height = height || 0;
		this._lines = lines || [];
		
		config = L.merge({
			'hScaleVisible': true
		}, config || {});
		this.init(container, config);
	};
	DateLineChart.prototype = {
		init: function(container, config){
			this._raphael = new Raphael(container, this._width, this._height);
			this.render();
		},
		getY: function(val){
			var tbout = 20;
			var height = this._height - tbout * 2;
			var tmpval = this._maxval - this._minval;
			var calcul = 0;
			if (tmpval != 0){
				calcul = height / tmpval;
			}

			return Math.round(calcul * (this._maxval - val) + tbout);
		},
		_calculateScale: function(){
			
			var lines = this._lines,
				minval = 999999999, maxval = -999999999;
			
			for (var i=0; i<lines.length; i++){
				var line = lines[i];
				var d = line.data || [];
				for (var ii=0;ii<d.length;ii++){
					var v = d[ii][0];
					minval = Math.min(minval, v);
					maxval = Math.max(maxval, v);
				}
			}
			this._minval = minval;
			this._maxval = maxval;
		},
		_renderVerticalScale: function(){
			var minval = this._minval, maxval = this._maxval;
			var minstep = Math.max(this._height / 60, 1);
			var oneval = maxval - minval;
			var minvalstep = oneval / Math.min(oneval, minstep);

			var r = this._raphael;
			
			var colors = Raphael.fn.g.colors;
			
			var colorhue = .6 || Math.random(),
	        	color = "hsb(" + [colorhue, .5, 1] + ")";
			
			var path = [];
			for (var ival = minval; ival <= maxval; ival += minvalstep) {
				var y = this.getY(ival);
				path = path.concat(["M", 0, Math.round(y), "H", 10]);
			}
			r.path(path.join(",")).attr({stroke: color});
		},
		render: function(){
			this._calculateScale();
			this._renderVerticalScale();
		}
	};
	NS.DateLineChart = DateLineChart;
	/**/
	
};
