/*
@version $Id$
@package Abricos
@copyright Copyright (C) 2008 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: 'chart', files: ['raphael.js']}
	]
};
Component.entryPoint = function(){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;
	
	var NS = this.namespace, 
		TMG = this.template;
	
	var initCSS = false;
	var buildTemplate = function(w, ts){
		if (!initCSS){
			var CSS = Brick.util.CSS;
			CSS.update(CSS['chart']['lib']);
			delete CSS['chart']['lib'];
			initCSS = true;
		}
		w._TM = TMG.build(ts); w._T = w._TM.data; w._TId = w._TM.idManager;
	};
		
	// точка
	var Point = function(p1, p2){
		var x = 0, y = 0;
		if (L.isArray(p1)){
			x = p1[0] || 0;
			y = p1[1] || 0;
		}else{
			x = p1;
			y = p2;
		}
		this.x = x*1;
		this.y = y*1;
	};
	NS.Point = Point;

	// Коллекция точек
	var PointList = function(points){
		points = points || [];
		this.init(points);
	};
	PointList.prototype = {
		init: function(points){ 
			this._list = []; 
			for (var i=0;i<points.length;i++){
				this.add(new Point(points[i]));
			}
		},
		add: function(point){ this._list[this._list.length] = point;},
		clear: function(){ this._list = []; },
		count: function(){ return this._list.length; },
		index: function(i){ return this._list[i]; },
		foreach: function(f){
			if (!L.isFunction(f)){ return null; }
			var ls = this._list;
			for (var i=0;i<ls.length;i++){
				if (f(ls[i], i, ls.length)){ return ls[i]; }
			}
			return null;
		},
		split: function(){
			var xvs = [], yvs = [];
			this.foreach(function(p){
				xvs[xvs.length] = p.x;
				yvs[yvs.length] = p.y;
			});
			return {
				'xvs': xvs,
				'yvs': yvs
			};
		},
		join: function(xvs, yvs){
			this.clear();
			for (var i=0; i<Math.min(xvs.length, yvs.length);i++){
				this.add(new Point(xvs[i], yvs[i]));
			}
		}
	};
	NS.PointList = PointList;
	
	var Rectangle = function(x, y, w, h, cfg){
		this.init(x, y, w, h, cfg);
	};
	Rectangle.prototype = {
		init: function(x, y, w, h, cfg){
			this.set(x, y, w, h);
			this.cfg = cfg || {};
		},
		set: function(x, y, w, h){
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
			this._update;
		},
		_update: function(){
			this.left = this.x;
			this.top = this.y;
			this.right = this.x+this.w;
			this.bottom = this.y+this.h;
		},
		checkOver: function(x, y, wp){ // проверка вхождения точки в заданную область
			wp = wp || 0;
			
			this._update();
			
			var x1 = this.x - wp, y1 = this.y - wp,
				x2 = this.right + wp, y2 = this.bottom+wp;
			
			return (x >= x1 && x <= x2 && y >= y1 && y <= y2);
		}
	};
	NS.Rectangle = Rectangle;
	
	// Коллекция точек
	var RectangleList = function(){
		this.init();
	};
	RectangleList.prototype = {
		init: function(){ 
			this._list = []; 
		},
		add: function(rect){ this._list[this._list.length] = rect;},
		clear: function(){ this._list = []; },
		count: function(){ return this._list.length; },
		index: function(i){ return this._list[i]; },
		foreach: function(f){
			if (!L.isFunction(f)){ return null; }
			var ls = this._list;
			for (var i=0;i<ls.length;i++){
				if (f(ls[i], i, ls.length)){ return ls[i]; }
			}
			return null;
		},
		checkOver: function(x, y, wp){
			var rects = [];
			this.foreach(function(rect){
				if (rect.checkOver(x, y, wp)){
					rects[rects.length] = rect;
				}
			});
			return rects;
		}
	};
	NS.RectangleList = RectangleList;

	
	// Линия сетки
	var ScaleLine = function(pxval, relval, title){
		this.pxval = Math.round(pxval*1);
		this.relval = relval*1;
		this.title = title || "";
	};
	NS.ScaleLine = ScaleLine;

	var round = function(val, dec){
		if (dec == 0){ return Math.round(val); }
		var del = Math.pow(10,dec);
		return Math.round(val * del)/del;
	};
	
	// Коллекция линий сетки
	var Scale = function(cfg){
		
		cfg = cfg || {};
		if (L.isNumber(cfg['min'])){
			cfg['vmin'] = cfg['min'];
		}
		if (L.isNumber(cfg['max'])){
			cfg['vmax'] = cfg['max'];
		}
		
		cfg = L.merge({
			'min': 0, 'max': 0, 'step': 0, 'decimal': 0,
			'dmax': 0, 'dmin': 0,
			'vmin': null, 'vmax': null
		}, cfg || {});
		
		this.init(cfg);
	};
	Scale.prototype = {
		init: function(cfg){
			this.cfg = cfg;
			this.offset = 0;
			this._calcKoef = 0;
			this._list = [];
			this.isVertical = false;
			this.set(cfg['min'], cfg['max'], cfg['step']);
		},
		
		clear: function(){ this._list = []; },
		count: function(){ return this._list.length; },
		add: function(scaleLine){ this._list[this._list.length] = scaleLine; },
		index: function(i){ return this._list[i]; },
		foreach: function(f){
			if (!L.isFunction(f)){ return null; }
			var ls = this._list;
			for (var i=0;i<ls.length;i++){
				if (f(ls[i], i, ls.length)){ return ls[i]; }
			}
			return null;
		},
		isError: function(){
			var cfg = this.cfg;
			return (cfg['max'] == cfg['min']) || cfg['step'] == 0;
		},
		set: function(min, max, step){
			var cfg = this.cfg;
			cfg['min'] = min;
			cfg['max'] = max;
			// cfg['step'] = round(step, this.cfg['decimal']);
			cfg['step'] = step;
		},
		fillScale: function(from, to, step){ // заполнить шкалу значениями
	        if (step == 0 || from > to){ return; }
	        var index = 0, ival;
	        for (ival = from; ival <= to; ival += step) {
	        	var scline = new ScaleLine(this.transform(ival), ival, this.valueToString(ival));
	        	
	        	this.add(scline);
	        }
		},
		valueToString: function(value){
			value = value*1;
			return value.toFixed(this.cfg['decimal']);
		},
		transformMethod: function(val, min, max, size, mirror){
			// Brick.console([min, max]); 218 203.45
			if (max == min){ return; }
			
			var cfg = this.cfg, del = (max - min);
			
			max += del*(cfg['dmax']*0.01); min -= del*(cfg['dmin']*0.01);
			
	        var calcKoef = size / (max - min);
			
			if (mirror){
				return Math.round((max-val)*calcKoef)+this.offset; // зеркально
			}
			return Math.round((val-min)*calcKoef)+this.offset;
		},
		transform: function(val, mirror){
			var cfg = this.cfg;
			
			var min = cfg['min'],
				max = cfg['max'];
			
			if (min == max){
				min -= cfg['step']; 
				max += cfg['step']; 
			}
				
			return this.transformMethod(val, min, max, cfg['size'], mirror || this.isVertical);
		},
		build: function(size){
			this.cfg['size'] = size;
			
			var cfg = this.cfg;
			if (cfg['max'] == cfg['min']){ return; }
			
	        if (cfg['step'] != 0 && cfg['min'] < cfg['max']){ 
		        this.clear();
		        this.fillScale(cfg['min'], cfg['max'], cfg['step']);
	        }
		},
		checkValueBefore: function(){}, // выполнить функцию перед началом проверки значений
		checkValue: function(val){
			return true;
		},
		checkValueAfter: function(){}, // выполнить функцию после проверки значений
		buildByValues: function(height, values){
			var minval = 0, maxval = 0, val, cfg = this.cfg;
			for (var i=0;i<values.length;i++){
				val = values[i];
				if (i==0){
					minval = maxval = val;
				}else{
					minval = Math.min(minval, val);
					maxval = Math.max(maxval, val);
				}
			}
			
			var minstep = Math.max(height / 80, 1),
				oneval = Math.max(maxval - minval, 1),
				step = oneval / Math.min(oneval, minstep);
			this.set(minval, maxval, step);
			this.build(height);
		},
		// произвести компиляцию точек по шкале.
		compile: function(refValues, secValues){
			return null;
		}
	};
	
	var VerticalScale = function(cfg){
		cfg = L.merge({
			'dmin': 5,
			'dmax': 5
		}, cfg || {});
		VerticalScale.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(VerticalScale, Scale, {
		transform: function(val){ // зеркальный расчет
			return VerticalScale.superclass.transform.call(this, val, true);
		}
	});
	NS.VerticalScale = VerticalScale;

	var HorizontalScale = function(cfg){
		HorizontalScale.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(HorizontalScale, Scale, { });
	NS.HorizontalScale = HorizontalScale;
	
	// Валютная шкала
	var CurrencyScale = function(cfg){
		cfg = L.merge({'decimal': 2}, cfg || {});
		cfg['dicimal'] = 2;
		CurrencyScale.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(CurrencyScale, VerticalScale, {
		valueToString: function(value){
			return YAHOO.util.Number.format(value, {decimalPlaces: 2, thousandsSeparator: ' ', suffix: ' '});
		}
	});
	NS.CurrencyScale = CurrencyScale;
	
	
	// Временная шкала (часы:минуты). Значения в секундах с 00 часов 00 минут.
	var TimeScale = function(cfg){
		cfg = L.merge({
			'fullday': false, // показывать шкалу полного дня (т.е. все 24 часа)
			'min': 0, // >= 0
			'max': 1440, // <= 1440,
			'step': 60*3 // 3 часа минут
		}, cfg || {});
		TimeScale.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(TimeScale, Scale, {
		
		buildByValues: function(height, values){
			if (this.cfg['fullday']){
				this.set(0, 1440, 60);
				this.build(height);
			}else{
				TimeScale.superclass.buildByValues.call(this, height, values);
			}
		},
		
		set: function(from, to, step){
			var mn = 0, mx = 24*60;
			
			from = Math.min(Math.max(Math.floor(from/60)*60, mn), mx);
			to = Math.max(Math.min(Math.ceil(to/60)*60, mx), mn);
			step = Math.min(Math.max(Math.floor(step), 60), 3*60);

			TimeScale.superclass.set.call(this, from, to, step);
		},
		
		fillScale: function(from, to, step){ // заполнить шкалу значениями

	        var begin = 0, end = 24, istep = Math.max(Math.floor(step/60), 1);
	        
	        if (!this.cfg['fullday']){
	        	begin = from/(60);
	        	end = to/(60);
	        }

	        for (var ival = begin; ival <= end; ival++) {
	        	var pxval = this.transform(ival*60);
	        	
	        	if (Math.floor(ival/istep)*istep == ival && ival > 0){
		        	var sval = (ival<10?'0':'')+ ival+':00';
		        	if (ival == 24){ sval = ''; }
		        	
		        	this.add(new ScaleLine(pxval, ival, sval));
	        	}
	        }
		},
		transform: function(minute, mirror){
			var del = 60*24;
			minute = Math.min(Math.max(minute, 0), 1440-1);
			minute = minute-Math.floor(minute/del)*del;
			return TimeScale.superclass.transform.call(this, minute, mirror);
		}
	});
	NS.TimeScale = TimeScale;
	
	
	var DateScale = function(cfg){
		cfg = L.merge({ 
			'unix':		false,	// числовой ряд даты в unix формате?
			'period':	'week',	// day || week || month || year || custom?
			'round':	true,	// корректировать дату, округляя ее до выбранного периода
			'method':	'sum',	// метод объединения значений в период: sum - суммирование, average - среднеарифметическое,
								// max - максимальное  
			'dateFrom':	null,	// период начало
			'dateTo':	null	// период конец
		}, cfg || {});
		
		DateScale.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(DateScale, Scale, {
		oneDay: function(){
			return 60*60*24 * (this.cfg['unix'] ? 1 : 1000);
		},
		valueToDate: function(val){
			return new Date(val * (this.cfg['unix'] ? 1000 : 1));
		},
		dateToValue: function(dt){
			return dt.getTime() / (this.cfg['unix'] ? 1000 : 1);
		},
		roundDay: function(val){ // округлить значение до целого дня
			var oneday = this.oneDay();
			return Math.ceil(val/oneday)*oneday;
		},
		getWeekId: function(val) {
			return this.getWeek(this.valueToDate(val));
		},
		getWeek: function(dt) {
		    var dd = new Date();
		    dd.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate());
		    var D = dd.getDay();
		    if(D == 0) D = 7;
		    dd.setDate(dd.getDate() + (4 - D));
		    var YN = dd.getFullYear();
		    var ZBDoCY = Math.floor((dd.getTime() - new Date(YN, 0, 1, -6)) / 86400000);
		    // var WN = 1 + Math.floor(ZBDoCY / 7); // первый день воскресенье
		    var WN = Math.floor(ZBDoCY / 7); // первый день понедельник
		    return WN;
		},

		getMonday: function(val) { // округлить до понедельника
			val = this.roundDay(val);
        	var d = this.valueToDate(val),
	        	D = d.getDay();
		    if(D == 0) D = 7;
        	return this.dateToValue(new Date(d.getTime()+ (1-D)*86400000));
		},
		
		getSunday: function(val){ // округлить до воскресенья
			val = this.roundDay(val);
        	var d = this.valueToDate(val),
	        	D = d.getDay();
		    if(D == 0) D = 7;
        	return this.dateToValue(new Date(d.getTime()+ (7-D)*86400000));
		},

		checkValueBefore: function(){
			this.firstDateTime = null;
			this.endDateTime = null;
		},

		checkValue: function(val){
			val = val*1;
			var cfg = this.cfg;
			
			if (!L.isNull(cfg['dateFrom']) && val < cfg['dateFrom'] || 
				!L.isNull(cfg['dateTo']) && val > cfg['dateTo']){ 
				return false;
			}
			return true;
		},
		
		transformMethod: function(val, min, max, size, mirror){
			return DateScale.superclass.transformMethod.call(this, val, min, max, size-20, mirror);
		},
		
		fillScale: function(from, to, step){ // заполнить шкалу значениями
	        if (step == 0 || from > to){ return; }
	        
			from = this.roundDay(from);
			to = this.roundDay(to);

			switch (this.cfg['period']){
			case 'week': 
				from = this.getSunday(from);
				step = this.oneDay()*7; // шаг один день
				break;
			case 'day':
				step = this.oneDay(); // шаг один день
				break;
			}
			
			var vFrom = from-step, vTo = to+step;
			
			this.set(vFrom, vTo, step);
			
			var steppx = this.transform(from+step)-this.transform(from);
			
	        var flagpx = 0;
	        for (var ival = from; ival <= to+step; ival += step) {
	        	
	        	ival = this.roundDay(ival);
	        	var sval = "",
	        		pxval = this.transform(ival);
	        	
	        	if (flagpx > 70){ flagpx = 0; }
	        	if (flagpx == 0){
		        	sval = this.valueToString(ival);
	        	} 
	        	flagpx += steppx;
	        	this.add(new ScaleLine(pxval, ival, sval));
	        }
		},
		valueToString: function(value){
			return Brick.dateExt.convert(value, 2);
		},
		roundByPeriod: function(val){
			switch (this.cfg['period']){
			case 'week': return this.getSunday(val);
			case 'day': return this.roundDay(val);
			}
			return val;
		},
		compile: function(rvs, mvs){
			if (rvs.length == 0){ return null; }
			
			var cfg = this.cfg, nrvs = [], nmvs = [];
			if (!cfg['round']){ return null; }
			
			var first = true, notfirst = false; //this.roundByPeriod(rvs[0])*1 < rvs[0]*1;
			
			// TODO: возможно при округлении могут быть траблы (начало дня или конец дня?)
			
			var isMethod = false;
			switch(cfg['method']){
			case 'average':
			case 'sum':
			case 'max':
				isMethod = true;
				break;
			}
			
			var add = function(dt, af){
				if (L.isNull(af)){ return; }
				if (first){
					first = false;
					if (notfirst){ return; }
				}
				nrvs[nrvs.length] = dt;
				var v = 0;
				
				switch(cfg['method']){
				case 'average':
					v = af['s'] / af['c'];
				case 'sum':
				case 'max':
					v = af['s'];
					break;
				}
				nmvs[nmvs.length] = v;
			};
			
			var current = null, arif = null; // {'s': 0,'c': 0};
			for (var i=0;i<rvs.length;i++){
				var vdt = this.roundByPeriod(rvs[i]);
				if (isMethod){
					if (vdt != current){
						add(current, arif);
						arif = {'s': mvs[i]*1,'c': 1};
						current = vdt;
					}else{
						if (cfg['method'] == 'max'){
							arif['s'] = Math.max(mvs[i]*1, arif['s']);
						}else{
							arif['s'] += mvs[i]*1;
						}
						arif['c']++;
					}
				}else{
					nrvs[nrvs.length] = vdt;
					nmvs[nmvs.length] = mvs[i];
				}
			}
			if (isMethod){
				add(current, arif);
			}
			return [nrvs, nmvs];
		}
	});
	NS.DateScale = DateScale;
	
	
	
	// Абстрактный график сетка
	var GridChart = function(container, cfg){
		cfg = L.merge({'scale': {}, 'grid': {}, 'offset': {}, 'features': []}, cfg || {});

		cfg['offset'] = L.merge({
			'top': GridChart.MTP,
			'right': GridChart.MRT,
			'bottom': GridChart.MBT,
			'left': GridChart.MLT
		}, cfg['offset'] || {});

		cfg['scale'] = L.merge({
			'color': '#999999',
			'x': {}, 'y': {}
		}, cfg['scale'] || {});

		cfg['scale']['x'] = L.merge({'min': 0, 'max': 0, 'step': 0, 'decimal': 0, 'manager': null}, cfg['scale']['x'] || {});
		cfg['scale']['y'] = L.merge({'min': 0, 'max': 0, 'step': 0, 'decimal': 0, 'manager': null}, cfg['scale']['y'] || {});
		
		this.init(container, cfg);
	};
	// offset
	GridChart.MLT = 50; // left
	GridChart.MTP = 20; // top
	GridChart.MRT = 50; // right
	GridChart.MBT = 30; // bottom
	
	GridChart.prototype = {
		init: function(container, cfg){
		
			buildTemplate(this, 'chart');
			container.innerHTML = this._TM.replace('chart');
			
			this.element = this._TM.getEl('chart.pane');
			this.element.innerHTMl = "";
			
			this.cfg = cfg;
			
			this.vScale = this.initVerticalScale();
			this.vScale.isVertical = true;
			this.hScale = this.initHorizontalScale();
			
			this.features = new FeatureList(cfg['features']);
			
			this.chartElements =
				[
				 this.vScale,
				 this.hScale,
				 this.features
			    ];
			
			var g = this.graphics = Raphael(this.element);
		},
		_mergeScaleCfg: function(cfg){
			return {
				'min': cfg['min'],
				'max': cfg['max'],
				'step': cfg['step'],
				'decimal': cfg['decimal']
			};
		},
		initVerticalScale: function(){
			var cfg = this.cfg['scale']['y'], scale = cfg['manager'];
			if (!scale){ scale = new VerticalScale(this._mergeScaleCfg(cfg)); }
			scale.offset = this.cfg['offset']['top'];
			return scale;
		},
		initHorizontalScale: function(){
			var cfg = this.cfg['scale']['x'], scale = cfg['manager'];
			if (!scale){ scale = new HorizontalScale(this._mergeScaleCfg(cfg)); }
			scale.offset = this.cfg['offset']['left'];
			return scale;
		},
		getTooltipContainer: function(){
			return this._TM.getEl('chart.tooltip');
		},
		getWidth: function(){
			var offset = this.cfg['offset'];
			return Dom.getRegion(this.element).width-offset['left']-offset['right'];
		},
		getHeight: function(){
			var offset = this.cfg['offset'];
			return Dom.getRegion(this.element).height-offset['top']-offset['bottom'];
		},
		getXOffset: function(){
			return this.cfg['offset']['left'];
		},
		getYOffset: function(){
			return this.cfg['offset']['top'];
		},
		draw: function(){
			var g = this.graphics,
				cfg = this.cfg,
				offset = cfg['offset'],
				rg = Dom.getRegion(this.element), 
				mLt = offset['left'], mTp = offset['top'], mRt = offset['right'], mBt = offset['bottom'],
				w = rg.width-mLt-mRt,
				h = rg.height-mTp-mBt,
				xLt = mLt, xRt = w+mLt,
				yTp = mTp, yBt = h+mTp;

			if (w < 20 || h < 20){ return; }
			
			var cfgSc = cfg['scale'];
			
			var ph = [];
			// вертикальная линия
			ph = ph.concat(["M", mLt, yTp, "V", yBt]);
			// горизонтальная линия
			ph = ph.concat(["M", mLt, yBt, "H", xRt]);
			
			g.path(ph.join(",")).attr({'stroke': cfgSc['color']});
			
			var path = [], pathb = [];
			
			var label = g.set(),
				fontH = {font: '12px Helvetica, Arial', fill: cfgSc['color'], "text-anchor": "middle"},
				fontV = {font: '12px Helvetica, Arial', fill: cfgSc['color'], "text-anchor": "end"};
			
			this.vScale.foreach(function(sc, index, length){
				var y = sc.pxval,
					wSc = cfg['grid']['x'] ? xRt : mLt;
				
				if (sc.title.length > 0){
					pathb = pathb.concat(["M", mLt-5, y, "H", wSc]);
					label.push(g.text(mLt-10, y, sc.title).attr(fontV));
				}else{
					path = path.concat(["M", mLt, y, "H", wSc]);
				}
			});

			this.hScale.foreach(function(sc, index, length){
				var hSc = cfg['grid']['y'] ? mTp : mTp+h;
				
				if (sc.title.length > 0){
					pathb = pathb.concat(["M", sc.pxval, mTp+h+5, "V", hSc]);
					label.push(g.text(sc.pxval, mTp+h+12, sc.title).attr(fontH));
				}else{
					path = path.concat(["M", sc.pxval, mTp+h, "V", hSc]);
				}
			});
			g.path(path.join(",")).attr({'stroke': cfgSc['color'], 'stroke-width': .3});
			g.path(pathb.join(",")).attr({'stroke': cfgSc['color'], 'stroke-width': .5});
			
			return g;
		},
		transform: function(p){
			return new Point(
				this.hScale.transform(p.x), 
				this.vScale.transform(p.y) 
			);
		}
	};
	NS.GridChart = GridChart;
	
	var Tooltip = function(){
		this.init();
	};
	Tooltip.prototype = {
		init: function(){
			buildTemplate(this, 'tooltip');
		},
		
		getText: function(prm){
			var chart = prm['chart'], p = prm['pr'];
			var vh = chart.hScale.valueToString(p.x),
				vv = chart.vScale.valueToString(p.y);

			return vh+', '+vv;
		},
		
		show: function(prm, x, y){
			var el = prm['chart'].getTooltipContainer();
			this.move(prm, x, y);
			if (this._isShow){ return; }
			
			el.innerHTML = this._TM.replace('tooltip');
			this._TM.getEl('tooltip.id').innerHTML = this.getText(prm);
			Dom.setStyle(el, 'display', '');
		},
		move: function(prm, x, y){
			var el = prm['chart'].getTooltipContainer();

			Dom.setStyle(el, 'left', x+'px');
			Dom.setStyle(el, 'top', y+'px');
		},
		hide: function(prm){
			var el = prm['chart'].getTooltipContainer();
			
			this._isShow = false;
			Dom.setStyle(el, 'display', 'none');
		}
	};
	NS.Tooltip = Tooltip;

	// элемент на графике
	var Feature = function(cfg){
		cfg = L.merge({
			'points': []
		}, cfg || {});
		this.init(cfg);
	};
	Feature.prototype = {
		init: function(cfg){
			this.cfg = cfg;
			
			this.points = new PointList(cfg['points']);
			cfg['points'] = [];

			// LineChart instance
			this.chart = null;
			
			// Рабочая коллекция - точки для отрисовки. 
			// Иногда бывают случаи, когда шкала 
			// может не пропустить точку для отрисовки. Например, шкала даты, в 
			// которой установили период. Поэтому, необходимо
			// завести отдельную коллекцию.
			this._pointsForDraw = null;
		},
		
		// график вызывает эту функцию, когда начинает просчитывать шкалу по X и Y
		checkPointsByScale: function(hScale, vScale){
			var psdw = this._pointsForDraw = new PointList();
			
			this.points.foreach(function(p){
				// если checkValue возвращает false значит шкала будет игнорировать эту точку
				if (hScale.checkValue(p.x) && vScale.checkValue(p.y)){
					psdw.add(p);
				}
			});
			return psdw;
		},
		draw: function(g, points){ },
		mouseHandle: function(evt, p){
			var rect = p.rect;
			
			var cfg = this.cfg,
				tooltip = cfg['tooltip'],
				x = evt.layerX, y = evt.layerY+22;
			
			var fname = "";
			switch(evt.type){
			case 'click': 
				fname = 'onClick'; 
				break;
			case 'mouseover':
				if (tooltip){ tooltip.show(p, x, y); }
				fname = 'onMouseOver'; 
				break;
			case 'mouseout':  
				if (tooltip){ tooltip.hide(p); }
				fname = 'onMouseOut'; 
				break;
			case 'mousemove':
				if (tooltip){ tooltip.move(p, x, y);}
				fname = 'onMouseMove'; 
				break;
			default: return;
			}
			if (L.isFunction(this[fname])){ 
				this[fname](evt, p);
			}
		}
	};
	NS.Feature = Feature;
	
	// Коллекция элементов на графике
	var FeatureList = function(features){
		features = features || [];
		this.init(features);
	};
	FeatureList.prototype = {
		init: function(features){ 
			this._list = [];
			for (var i=0;i<features.length;i++){
				this.add(features[i]);
			}
		},
		add: function(feature){ this._list[this._list.length] = feature;},
		clear: function(){ this._list = []; },
		count: function(){ return this._list.length; },
		index: function(i){ return this._list[i]; },
		foreach: function(f){
			if (!L.isFunction(f)){ return null; }
			var ls = this._list;
			for (var i=0;i<ls.length;i++){
				if (f(ls[i], i, ls.length)){ return ls[i]; }
			}
			return null;
		}
	};
	NS.FeatureList = FeatureList;

	// линия на графике
	var PointFeature = function(cfg){
		cfg = L.merge({
			'color': '#3f72bf',
			'symbol': 'o' // или '+', '.'
		}, cfg || {});
		
		PointFeature.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(PointFeature, Feature, {
		draw: function(chart, points){
			var g = chart.graphics, __self = this, cfg = this.cfg;
			
			var glines = g.set(), gline;
			glines.push(gline = g.path().attr({
	            "stroke": this.cfg.color,
	            "stroke-width": 2,
	            "stroke-linejoin": "round",
	            "stroke-linecap": "round",
	            "stroke-dasharray": ""
	        }));
			points.foreach(function(preal, index){
				var p = chart.transform(preal);
				g.circle(p.x, p.y, 4).attr({stroke: cfg.color, "stroke-width": 1});
			});
		}
	});
	NS.PointFeature = PointFeature;
	
	// линия на графике
	var LineFeature = function(cfg){
		cfg = L.merge({
			'color': '#3f72bf',
			'symbol': 'o' // или '+', '.'
		}, cfg || {});
		
		LineFeature.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(LineFeature, PointFeature, {
		draw: function(chart, points){
			var g = chart.graphics, __self = this, cfg = this.cfg;
			
			var glines = g.set(), gline, path = [];

			glines.push(gline = g.path().attr({
                'stroke': this.cfg.color,
                "stroke-width": 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": ""
            }));
			points.foreach(function(preal, index){
				var p = chart.transform(preal);
				path = path.concat([index>0 ? "L" : "M", p.x, p.y]);
				g.circle(p.x, p.y, 4).attr({stroke: cfg.color, "stroke-width": 1});
			});
			
			gline.attr({path: path.join(",")});
		}
	});
	NS.LineFeature = LineFeature;
	
	// линия на графике
	var BarFeature = function(cfg){
		cfg = L.merge({
			'color': '#3f72bf'
		}, cfg || {});
		cfg['background'] = cfg['background'] || cfg['color'];
		
		BarFeature.superclass.constructor.call(this, cfg);
	};
	YAHOO.extend(BarFeature, Feature, {
		draw: function(chart, points){
			var g = chart.graphics, __self = this, cfg = this.cfg;
			
			var offset = chart.cfg.offset,
				hScale = chart.hScale,
				w = chart.getWidth(),
				h = chart.getHeight(),
				y = h+offset.top-1;
			
			var wbar = Math.floor(hScale.transform(hScale.cfg['min'] + hScale.cfg['step']) - hScale.transform(hScale.cfg['min']));
			wbar = wbar-wbar*.2;

			var barList = g.set(), __self = this;

			points.foreach(function(preal, index){
				
				var p = chart.transform(preal);
				barList.push(g.rect(p.x-wbar/2, p.y, wbar, Math.max(y-p.y,1)).attr({
					stroke: cfg.color, "stroke-width": 1,
					fill: cfg.background
				}));
				var rect = barList[barList.length-1];
				
				var prv = {'rect': rect, 'chart': chart, 'index': index, 'pr': preal};
				
				rect.click(function(evt){__self.mouseHandle(evt, prv);});
				rect.mouseover(function(evt){__self.mouseHandle(evt, prv);});
				rect.mouseout(function(evt){__self.mouseHandle(evt, prv);});
				rect.mousemove(function(evt){__self.mouseHandle(evt, prv);});
			});
			barList.toFront();
		}
	});
	NS.BarFeature = BarFeature;

	
	// линейный график
	var LineChart = function(container, cfg){
		LineChart.superclass.constructor.call(this, container, cfg);
	};
	YAHOO.extend(LineChart, GridChart, {
		init: function(container, cfg){
			LineChart.superclass.init.call(this, container, cfg);
			this.lines = new FeatureList();
			
			this.draw();
		},
		
		draw: function(){
			var cfg = this.cfg,
				w = this.getWidth(),
				h = this.getHeight();

			if (w < 50 || h < 50){ return; }

			var vScale = this.vScale, hScale = this.hScale,
				__self = this, lines = this.lines, p, fline, points;
			
			hScale.checkValueBefore();
			vScale.checkValueBefore();
			
			var compiler = [];
			this.features.foreach(function(feature){
				var psdw = feature.checkPointsByScale(hScale, vScale);
				compiler[compiler.length] = {
					'feature': feature,
					'points': psdw
				};
			});
			
			hScale.checkValueAfter();
			vScale.checkValueAfter();
			
			var sfgSX = cfg['scale']['x'], sfgSY = cfg['scale']['y'],
			calcX = hScale.isError(), calcY = vScale.isError();
			
			var xvs = [], yvs = [];
			for (var i=0;i<compiler.length;i++){
				var comp = compiler[i];
				var lxvs = [], lyvs = [];
				comp['points'].foreach(function(p){
					xvs[xvs.length] = p.x;
					yvs[yvs.length] = p.y;
					
					lxvs[lxvs.length] = p.x;
					lyvs[lyvs.length] = p.y;
				});
				comp['xvs'] = lxvs;
				comp['yvs'] = lyvs;
			}
			// явно заданная шкала отсутствует, необходимо выполнить автоматический рассчет шкалы
			if (calcX){
				hScale.buildByValues(w, xvs);
			}else{
				hScale.build(w);
			}
			if (calcY){
				vScale.buildByValues(h, yvs);
			}else{
				vScale.build(h);
			}
			
			// компиляция точек
			for (var i=0;i<compiler.length;i++){
				var comp = compiler[i];
				
				var hPoints = hScale.compile(comp['xvs'], comp['yvs']) || null;
				if (!L.isNull(hPoints)){
					comp['xvs'] = hPoints[0];
					comp['yvs'] = hPoints[1];
				}
				var vPoints = vScale.compile(comp['yvs'], comp['xvs']) || null;
				if (!L.isNull(vPoints)){
					comp['xvs'] = vPoints[1];
					comp['yvs'] = vPoints[0];
				}
				
				comp['points'] = new PointList();
				comp['points'].join(comp['xvs'], comp['yvs']);
				
			}

			LineChart.superclass.draw.call(this);
			
			for (var i=0;i<compiler.length;i++){
				var comp = compiler[i];
				comp['feature'].draw(this, comp['points']);
			}
		}
	});
	NS.LineChart = LineChart;
	
    NS.popup = function (g, X, Y, set, pos, ret) {
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
            mask = [{x: x+r, y: y, w: w, w4: w/4, h4:h/4, right: 0, left: w-gap*2, bottom: 0, top: h - gap * 2, r: r, h: h, gap: gap}, 
                    {x: x+r, y: y, w: w, w4: w/4, h4:h/4, left: w/2-gap, right: w/2-gap, top: h / 2 - gap, bottom: h / 2 - gap, r: r, h: h, gap: gap }, 
                    {x: x + r, y: y, w: w, w4: w / 4, h4: h / 4, left: 0, right: w - gap * 2, top: 0, bottom: h - gap * 2, r: r, h: h, gap: gap }]
        		[pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
        
	    	var fill = function (str, obj) {
	            return String(str).replace(tokenRegex, function (all, key) {
	                return replacer(all, key, obj);
	            });
	        };
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
            var dx = 0,
                dy = 0,
                out = g.path(fill(shapes[pos[0]], mask)).insertBefore(set);
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

    
    
     YAHOO.util.Number = {
     
         /**
         * Takes a native JavaScript Number and formats to string for display to user.
         *
         * @method format
         * @param nData {Number} Number.
         * @param oConfig {Object} (Optional) Optional configuration values:
         *  <dl>
         *   <dt>prefix {String}</dd>
         *   <dd>String prepended before each number, like a currency designator "$"</dd>
         *   <dt>decimalPlaces {Number}</dd>
         *   <dd>Number of decimal places to round.</dd>
         *   <dt>decimalSeparator {String}</dd>
         *   <dd>Decimal separator</dd>
         *   <dt>thousandsSeparator {String}</dd>
         *   <dd>Thousands separator</dd>
         *   <dt>suffix {String}</dd>
         *   <dd>String appended after each number, like " items" (note the space)</dd>
         *   <dt>negativeFormat</dt>
         *   <dd>String used as a guide for how to indicate negative numbers.  The first '#' character in the string will be replaced by the number.  Default '-#'.</dd>
         *  </dl>
         * @return {String} Formatted number for display. Note, the following values
         * return as "": null, undefined, NaN, "".
         */
        format : function(n, cfg) {
            if (!isFinite(+n)) {
                return '';
            }

            n   = !isFinite(+n) ? 0 : +n;
            cfg = YAHOO.lang.merge(YAHOO.util.Number.format.defaults, (cfg || {}));

            var neg    = n < 0,        absN   = Math.abs(n),
                places = cfg.decimalPlaces,
                sep    = cfg.thousandsSeparator,
                s, bits, i;

            if (places < 0) {
                // Get rid of the decimal info
                s = absN - (absN % 1) + '';
                i = s.length + places;

                // avoid 123 vs decimalPlaces -4 (should return "0")
                if (i > 0) {
                        // leverage toFixed by making 123 => 0.123 for the rounding
                        // operation, then add the appropriate number of zeros back on
                    s = Number('.' + s).toFixed(i).slice(2) +
                        new Array(s.length - i + 1).join('0');
                } else {
                    s = "0";
                }
            } else {        // There is a bug in IE's toFixed implementation:
                // for n in {(-0.94, -0.5], [0.5, 0.94)} n.toFixed() returns 0
                // instead of -1 and 1. Manually handle that case.
                s = absN < 1 && absN >= 0.5 && !places ? '1' : absN.toFixed(places);
            }

            if (absN > 1000) {
                bits  = s.split(/\D/);
                i  = bits[0].length % 3 || 3;

                bits[0] = bits[0].slice(0,i) +
                          bits[0].slice(i).replace(/(\d{3})/g, sep + '$1');

                s = bits.join(cfg.decimalSeparator);
            }

            s = cfg.prefix + s + cfg.suffix;

            return neg ? cfg.negativeFormat.replace(/#/,s) : s;
        }
    };
    YAHOO.util.Number.format.defaults = {
        decimalSeparator : '.',
        decimalPlaces    : null,
        thousandsSeparator : '',
        prefix : '',
        suffix : '',
        negativeFormat : '-#'
    };
    
    
};
