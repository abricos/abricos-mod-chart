/*
@version $Id: project.js 705 2010-09-08 12:47:39Z Mansur $
@package Abricos
@copyright Copyright (C) 2010 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	yahoo: ['datasource']
};
Component.entryPoint = function(){
	var Dom = YAHOO.util.Dom,
		L = YAHOO.lang,
		NS = this.namespace;
	
	NS.lib = NS.lib || {};
	
	NS.lib.Number = YAHOO.util.Number;
	NS.lib.NumberFormat = {decimalPlaces: 2, thousandsSeparator: ' ', suffix: ' '}; 

	var DPOINT = '.';
	var lz = function(num){
		var snum = num+'';
		return snum.length == 1 ? '0'+snum : snum; 
	};
	NS.lib.dayToString = function(date){
		if (L.isNull(date)){ return ''; }
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear();
		return lz(day)+DPOINT+lz(month)+DPOINT+year;
	};
	NS.lib.stringToDay = function(str){
		str = str.replace(/,/g, '.').replace(/\//g, '.');
		var aD = str.split(DPOINT);
		if (aD.length != 3){ return null; }
		return new Date(aD[2], aD[1]*1-1, aD[0]);
	};
	
	// var TZ_OFFSET = (new Date()).getTimezoneOffset();
	var TZ_OFFSET = 0;
	
	NS.lib.dateClientToServer = function(date){
		if (L.isNull(date)){ return 0; }
		var tz = TZ_OFFSET*60*1000;
		return (date.getTime()-tz)/1000; 
	};
	
	NS.lib.dateServerToClient = function(unix){
		unix = unix * 1;
		if (unix == 0){ return null; }
		var tz = TZ_OFFSET*60;
		return new Date((tz+unix)*1000);
	};
};