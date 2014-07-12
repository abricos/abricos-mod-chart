/*
@version $Id$
@copyright Copyright (C) 2008 Abricos. All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var RAPHAEL_VERSION = 'r.1.5.2';
var GRAPHAEL_VERSION = 'gr.0.4.1';

var Component = new Brick.Component();
Component.requires = {
	ext: [{
		name: 'raphael',
		fullpath: [
			'/modules/chart/lib/'+RAPHAEL_VERSION+'/raphael.js', 
			// '/modules/chart/lib/'+RAPHAEL_VERSION+'/raphael-min.js', -- bag in IE 
			'/modules/chart/lib/'+GRAPHAEL_VERSION+'/g.raphael-min.js', 
			'/modules/chart/lib/'+GRAPHAEL_VERSION+'/g.bar-min.js', 
			'/modules/chart/lib/'+GRAPHAEL_VERSION+'/g.dot-min.js', 
			'/modules/chart/lib/'+GRAPHAEL_VERSION+'/g.line-min.js', 
			'/modules/chart/lib/'+GRAPHAEL_VERSION+'/g.pie-min.js'
		],
		type: 'js'
	}]
};
Component.entryPoint = function(){
	var NS = this.namespace,
		API = NS.API;
	
};
