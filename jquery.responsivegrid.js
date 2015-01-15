(function($){

	var _ = {

		defaults : {

			column : 6,
			gutter : '10px',
			itemheight : '100%',

		},

		options : {

			grid : null,
			gridWidth : null,
			gridHeight : null,
			gridGutter : null,
			gridSelector : '.grid',

			gridItemWidth : null,
			gridItemHeight : null,
			gridItemSelector : '.grid-item',

			gridMap : [],

			bodyWidth : null,

			breakpoints : [],
			rangeValues : [],
			currentbreakpoint : null,
			
		},

		functions : {
			parseBreakpoint : function(key, range){
				// Invalid? Always fail.
				if (typeof range != 'string')
					condition = function(v) { return false; };
				// Wildcard? Always succeed.
				if (range == '*')
					condition = function(v) { return true; };
				// Less than or equal (-X)
				else if (range.charAt(0) == '-'){
					_.options.rangeValues[key] = parseInt(range.substring(1));
					condition = function(v) { return (v <= _.options.rangeValues[key]); };
				}
				// Greater than or equal (X-)
				else if (range.charAt(range.length - 1) == '-'){
					_.options.rangeValues[key] = parseInt(range.substring(0, range.length - 1));
					condition = function(v) { return (v >= _.options.rangeValues[key]); };
				}
				// Range (X-Y)
				else if (~range.indexOf(range,'-')){
					range = range.split('-');
					_.options.rangeValues[key] = [parseInt(range[0]), parseInt(range[1])];
					condition = function(v) { return (v >= _.options.rangeValues[key][0] && v <= _.options.rangeValues[key][1]); };
				}
				// Exact match (X)
				else {
					_.options.rangeValues[key] = parseInt(range);
					condition = function(v) { return (v == _.options.rangeValues[key]); };
				}
				return condition;
			},
			isPx : function(value){
				value = value.toLowerCase();
				if (~value.indexOf('px')){
					return true;
				}
				return false;
			},
			isPercent : function(value){
				value = value.toLowerCase();
				if (~value.indexOf('%')){
					return true;
				}
				return false;
			},
			getPxValue : function(value, size){
				size_ = parseInt(value);
				if (isNaN(size_)){
					size_ = 0;
				}
				if (_.functions.isPercent(value)){
					return Math.floor(size * size_ / 100);
				}
				if (_.functions.isPx(value)){
					return Math.floor(size_);
				}
				return 0;
			},
		},

		methods : {
			init : function(options){

				// viewport width
				bodyWidth = $(window).width();

				$.extend(true, _.options, _.defaults);
				$.extend(true, _.options, options);

				return this.each(function(){

					// setting grid options
					_.options.grid = this;

					// parsing breakpoints
					_.options.currentbreakpoint = {};
					$.each(_.options.breakpoints, function(key, breakpoint){
						breakpoint.condition = _.functions.parseBreakpoint(key, breakpoint.range);
					});

					// resize function
					_.methods.resize();
					$(window).resize(function(){
						_.methods.resize();
					});

				});

			},
			resize : function(){

				bodyWidth = $(window).width();

				// changing breakpoint
				$.each(_.options.breakpoints, function(key, breakpoint){
					if ((breakpoint.condition)(bodyWidth)){
						if (breakpoint.range != _.options.currentbreakpoint.range){
							_.options.currentbreakpoint = breakpoint;
							$.extend(true, _.options, breakpoint.options);
						}
					}
				});

				if (_.options.column < 1) {
					_.options.column = 1;
				}

				_.methods.initMap();
				_.methods.calculateMap();
				_.methods.renderGrid();

			},
			calculateMap : function(){

				_.options.gridWidth = $(_.options.grid).width();
				_.options.gridGutter = _.functions.getPxValue(_.options.gutter, _.options.gridWidth);
				_.options.gridItemWidth = Math.floor((_.options.gridWidth - (_.options.column - 1) * _.options.gridGutter) / _.options.column);
				_.options.gridItemHeight = _.functions.getPxValue(_.options.itemheight, _.options.gridItemWidth);

				$(_.options.grid).children(_.options.gridItemSelector).each(function(k){
					var colspan = $(this).data('colspan') || 1;
					var rowspan = $(this).data('rowspan') || 1;
					var added = false;
					var i, j;
					for (i = 0; i < _.options.gridMap.length; ++i){
						for (j = 0; j < _.options.gridMap[i].length; ++j){
							if (_.methods.isFreeMap(i, j, colspan, rowspan)){
								_.methods.addElementToMap(i, j, colspan, rowspan, {
									'element' : this,
									'colspan' : colspan,
									'rowspan' : rowspan,
								});
								added = true;
								break;
							}
						}
						if (added){
							break;
						}
					}
				});

			},
			renderGrid : function(){

				_.methods.removeEmptyRows();

				$(_.options.grid).css({
					'height' : _.methods.calculateItemHeight(_.options.gridMap.length),
				});

				var i, j;
				for (i = 0; i < _.options.gridMap.length; ++i){
					for (j = 0; j < _.options.gridMap[i].length; ++j){
						if (typeof(_.options.gridMap[i][j]) == 'object'){
							$(_.options.gridMap[i][j].element).css({
								'top' : _.methods.calculateItemTop(i),
								'left' : _.methods.calculateItemLeft(j),
								'width' : _.methods.calculateItemWidth(_.options.gridMap[i][j].colspan),
								'height' : _.methods.calculateItemHeight(_.options.gridMap[i][j].rowspan),
							});
						}
					}
				}

			},			
			initMap : function(){
				var length = 0;
				$(_.options.grid).children(_.options.gridItemSelector).each(function(){
					length += $(this).data('rowspan') || 1;
				});
				_.options.gridMap = new Array(length);
				var i;
				for (i = 0; i < _.options.gridMap.length; ++i){
					_.options.gridMap[i] = new Array(_.options.column);
				}
			},
			removeEmptyRows : function(){
				var i, j;
				for (i = 0; i < _.options.gridMap.length; ++i){
					var isFree = true;
					for (j = 0; j < _.options.gridMap[i].length; ++j){
						if (_.options.gridMap[i][j] != undefined){
							isFree = false;
							break;
						}
					}
					if (isFree){
						break;
					}
				}
				if (isFree) {
					var length = _.options.gridMap.length - 1;
					for (var k = length; k >= i; --k){
						_.options.gridMap.pop();
					}
				}
			},	
			isFreeMap : function(i_, j_, colspan, rowspan){
				var isFree = true;
				var i, j;
				for (i = i_; i < i_ + rowspan; ++i){
					for (j = j_; j < j_ + colspan; ++j){
						if (_.options.gridMap[i][j] != undefined){
							isFree = false;
							break;
						}
						if (j + colspan - 1 > _.options.gridMap[i].length){
							isFree = false;
							break;
						}
					}
					if (!isFree){
						break;
					}
				}
				return isFree;
			},
			addElementToMap : function(i_, j_, colspan, rowspan, object){
				_.options.gridMap[i_][j_] = object;
				var i, j;
				for (i = i_; i < i_ + rowspan; ++i){
					for (j = j_; j < j_ + colspan; ++j){
						if (i != i_ || j != j_){
							_.options.gridMap[i][j] = 0;
						}
					}
				} 
			},
			calculateItemWidth : function(colspan){
				return _.options.gridItemWidth * colspan + _.options.gridGutter * (colspan - 1);
			},
			calculateItemHeight : function(rowspan){
				return _.options.gridItemHeight * rowspan + _.options.gridGutter * (rowspan - 1);
			},
			calculateItemTop : function(row){
				return (row == 0) ? 0 : _.methods.calculateItemHeight(row) + _.options.gridGutter;
			},
			calculateItemLeft : function(col){
				return (col == 0) ? 0 : _.methods.calculateItemWidth(col) + _.options.gridGutter;
			},
		}

	}

	$.fn.responsivegrid = function(options){
		if (typeof options === 'object'){
			return _.methods.init.apply(this, arguments);
		}
	}

})(jQuery);