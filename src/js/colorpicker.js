/*
@version $Id$
@copyright Copyright (C) 2011 Brickos Ltd. All rights reserved.
*/

var Component = new Brick.Component();
Component.requires = {
	yahoo: ['colorpicker'],
	mod:[
		{name: 'sys', files: ['container.js']}
	]
};
Component.entryPoint = function(){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;
	
	var NS = this.namespace, 
		TMG = this.template,
		API = NS.API,
		R = NS.roles;
	
	var initCSS = false,
		buildTemplate = function(w, ts){
		if (!initCSS){
			Brick.util.CSS.update(Brick.util.CSS['chart']['colorpicker']);
			delete Brick.util.CSS['chart']['colorpicker'];
			initCSS = true;
		}
		w._TM = TMG.build(ts); w._T = w._TM.data; w._TId = w._TM.idManager;
	};
	
	var ColorPickerPanel = function(color, callback){
		this.color = color; 
		this.callback = callback;
		ColorPickerPanel.superclass.constructor.call(this, {
			width: '450px',
			height: '280px',
			fixedcenter: true,
			overflow: false
		});
	};
	YAHOO.extend(ColorPickerPanel, Brick.widget.Dialog, {
		initTemplate: function(){
			buildTemplate(this, 'panel');
			return this._TM.replace('panel');
		},
		onLoad: function(){
			var TM = this._TM;
			
			this.picker = new YAHOO.widget.ColorPicker(TM.getEl('panel.picker'), {
				images: {
					PICKER_THUMB: "/modules/chart/i/picker_thumb.png",
					HUE_THUMB: "/modules/chart/i/hue_thumb.png"
				}
			});
			
			this.picker.setValue(YAHOO.util.Color.hex2rgb(this.color));
			
			var __self = this;
			this.picker.on("rgbChange", function(o) {
				__self.color = YAHOO.util.Color.rgb2hex(o.newValue);
			});
		},
		destroy: function(){
			ColorPickerPanel.superclass.destroy.call(this);
		},
		onClick: function(el){
			var tp = this._TId['panel'];
			switch(el.id){
			case tp['bselect']: this.selectColor(); return true;
			case tp['bcancel']: this.close(); return true;
			}
			return false;
		},
		selectColor: function(){
			if (L.isFunction(this.callback)){
				this.callback(this.color);
			}
			this.close();
		}
	});
	NS.ColorPickerPanel = ColorPickerPanel;
	
	API.showColorPickerPanel = function(color, callback){
		new ColorPickerPanel(color, callback);
	};

};