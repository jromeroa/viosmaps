/**
 * Italia Interactive Map
 * @author  Gustavo Adrián Salvini
 * @date 20160322
 */


window.onload = function () {

	var s 			= Snap("#svgMap");
	var map_x_offset = 85, map_y_offset = 55;
	var isFullyCompatibleBrowser =  ! ( $.browser.msie || $.browser.msedge || $.browser["windows phone"] );

	var shadow 		= s.filter(Snap.filter.shadow(0, 2, 3));
	var noShadow 	= s.filter(Snap.filter.shadow(0,0,0));
	var invert 		= s.filter(Snap.filter.invert(1.0));
	// var invertFilterChild = invert.node.firstChild;
	var noInvert 	= s.filter(Snap.filter.invert(0));
	var saturate	= s.filter(Snap.filter.saturate(1.5));
	var saturateFilterChild = saturate.node.firstChild;

	var activeBounds = {};

	var regionsMetadata =
		{ 
			'abruzzo': 		{ 'text': "Abruzzo", 'label_offset_x': 2, 'label_offset_y': 20, 'label_hover_offset_x': 90, 'label_hover_offset_y': -55 },	
			'basilicata': 	{ 'text': "Basilicata", 'label_offset_x': 0, 'label_offset_y': 14, 'rotation': 25, 'label_hover_offset_x': 3, 'label_hover_offset_y': -4 },	
			'calabria': 	{ 'text': "Calabria", 'label_offset_x': 5, 'label_offset_y': -10, 'rotation': 25, 'label_hover_offset_x': 2, 'label_hover_offset_y': -16 },	
			'campania': 	{ 'text': "Campania", 'label_offset_x': -2, 'label_offset_y': -2, 'label_hover_offset_x': -5, 'label_hover_offset_y': -18 },	
			'emilia-romagna': { 'text': "Emilia-Romagna", 'label_offset_x': -5, 'label_offset_y': -3, 'label_hover_offset_x': 2, 'label_hover_offset_y': -12 },	
			'friuli-venezia-giulia': { 'text': "Friuli-Venezia Giulia", 'label_offset_x': 40, 'label_offset_y': 10, 'label_hover_offset_x': 170, 'label_hover_offset_y': 0 },	
			'lazio': 		{ 'text': "Lazio", 'label_offset_x': -5, 'label_offset_y': 10 },	
			'liguria':		{ 'text': "Liguria", 'label_offset_x': 10, 'label_offset_y': 25, 'label_hover_offset_x': 10, 'label_hover_offset_y': 0 },	
			'lombardia': 	{ 'text': "Lombardia", 'label_offset_x': -10, 'label_offset_y': 20, 'label_hover_offset_x': -10, 'label_hover_offset_y': 0 },		
			'marche': 		{ 'text': "Marche", 'label_offset_x': 20, 'label_offset_y': 10, 'label_hover_offset_x': 50, 'label_hover_offset_y': -70 },	
			'molise': 		{ 'text': "Molise", 'label_offset_x': 8, 'label_offset_y': 14, 'rotation': -42 },	
			'piemonte': 	{ 'text': "Piemonte", 'label_offset_x': 0, 'label_offset_y': 40, 'label_hover_offset_x': -12, 'label_hover_offset_y': 0 },	
			'puglia': 		{ 'text': "Puglia", 'label_offset_x': 35, 'label_offset_y': 30, 'rotation': 25, 'label_hover_offset_x': 10, 'label_hover_offset_y': -60, 'label_hover_rotation': -25 },	
			'sardegna': 	{ 'text': "Sardegna", 'label_offset_x': 0, 'label_offset_y': -25, 'rotation': 0, 'label_hover_offset_x': 7, 'label_hover_offset_y': -25 },	
			'sicilia':		{ 'text': 'Sicilia', 'label_offset_x': 30, 'label_offset_y': -10, 'label_hover_offset_x': 10, 'label_hover_offset_y': -25 },
			'toscana':		{ 'text': "Toscana", 'label_offset_x': 10, 'label_offset_y': 10 },	
			'trentino-alto-adige':	{ 'text': "Trentino-Alto Adige", 'label_offset_x': 0, 'label_offset_y': -45, 'label_hover_offset_x': -80, 'label_hover_offset_y': 15 },	
			'umbria': 		{ 'text': "Umbria", 'label_offset_x': -4, 'label_offset_y': 23, 'label_hover_offset_x': -6, 'label_hover_offset_y': 10 },	
			'valle-daosta':	{ 'text': "Valle d'Aosta", 'label_offset_x': -30, 'label_offset_y': -15, 'label_hover_offset_x': 0, 'label_hover_offset_y': -25 },
			'veneto': 		{ 'text': "Veneto", 'label_offset_x': -12, 'label_offset_y': 30 },	
		};

	Snap.plugin( function( Snap, Element, Paper, global ) {
		Element.prototype.addTransform = function( t ) {
			return this.transform( this.transform().localMatrix.toTransformString() + t );
		};
	});

	Snap.load("assets/italia_regioni_2.svg", function (f) {

		/**
		 * [drawBounds description]
		 * @param  {[type]} targetObject [description]
		 * @return {[type]}              [description]
		 */
		function drawBounds(targetObject) {

			targetId = targetObject.attr('id');

			if ( typeof activeBounds[ targetId ] == 'undefined')  
    			activeBounds[ targetId ] = [];

			var tmp_polyline, tmp_outer_disc, tmp_inner_disc, tmp_innermost_disc;

			var bbox = targetObject.getBBox();

        	// calculate middle point
            var x_center = ( bbox.x2 + bbox.x ) / 2 + map_x_offset; 
            var y_center = ( bbox.y2 + bbox.y ) / 2 + map_y_offset;

            if (false) {


	    		tmp_polyline = s.polyline( bbox.x + map_x_offset, bbox.y + map_y_offset, 
	    									bbox.x2 + map_x_offset, bbox.y + map_y_offset,
	    									bbox.x2 + map_x_offset, bbox.y2 + map_y_offset,
	    									bbox.x + map_x_offset, bbox.y2 + map_y_offset,
	    									bbox.x + map_x_offset, bbox.y + map_y_offset
	    									 )
		    		.attr({
		                stroke: "rgb(206,43,55)",
		                strokeWidth: "2",
		                opacity: "0.3",
		                fill: "none"
		            });

		    	activeBounds[ targetId ].push( tmp_polyline );

	            tmp_outer_disc = s.circle(x_center, y_center, bbox.r0 ).attr({
	                fill: "none",
	                stroke: "rgb(0, 146, 70)",
	                strokeWidth: "3",
	                opacity: "0.3",
	            });

		    	activeBounds[ targetId ].push( tmp_outer_disc );

	            tmp_inner_disc = s.circle(x_center, y_center, bbox.r1 ).attr({
	                fill: "none",
	                stroke: "rgb(206,43,55)",
	                strokeWidth: "3",
	                opacity: "0.3",
	            });

		    	activeBounds[ targetId ].push( tmp_inner_disc );
		    	// console.log('activeBounds:', activeBounds);
            }


		}

		/**
		 * [mouseOutSVG description]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		function mouseOutSVG(event) {
			// console.log('Out of SVG!!!!!');
			// console.log(event.target);
		}



		/**
		 * [hoverRegion description]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		function hoverRegion(event) {

			// console.log('mouseOver on:', this.attr('id'));

        	// drawBounds(this);

        	// console.log('snapLabel:', regions[ this.attr('id') ].snapLabel);

			// regions[ this.attr('id') ].snapLabel.attr( { 'opacity': '1' });

			if ( isFullyCompatibleBrowser ) {

				// var lastChild = document.querySelectorAll('g#italia_regioni')[0].lastElementChild;
				var $lastChild = $('#regions > path:last-child');
				// var lastSnapObject = s.select( '#'+lastChild.id );
				var lastSnapObject = s.select( '#'+$lastChild.attr('id') );
				lastSnapObject.after(this);

				/* regions labels */
				var label_hover_x = 0;
				var label_hover_y = 0;

				if ( typeof regionsMetadata[ this.attr('id') ] != 'undefined') 
				{				
					if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_offset_x'] != 'undefined')
						label_hover_x = regionsMetadata[ this.attr('id') ]['label_hover_offset_x'];
		
					if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_offset_y'] != 'undefined')
						label_hover_y = regionsMetadata[ this.attr('id') ]['label_hover_offset_y'];

					// if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_rotation'] != 'undefined')
					// 	label_hover_rotation = regionsMetadata[ this.attr('id') ]['label_hover_rotation'];

				}

				// console.log(label_hover_x, label_hover_y);

            	var that = this;
            	that.attr({ filter: shadow }).animate({ transform: "s2,2" }, 600, mina.elastic);
				
				regions[ this.attr('id') ].snapLabel.animate( { 'opacity': '1' }, 300, mina.easeout );
				// regions[ this.attr('id') ].addTransform('t'+label_hover_x+','+label_hover_y ).snapLabel.addTransform('s2,2');
				regions[ this.attr('id') ].snapLabel.addTransform('t'+label_hover_x+','+label_hover_y ).addTransform('s2,2');

			}
			else // not fully compatible browser
			{
	            this.attr({ filter: invert });
			}
		}

		/**
		 * [removeBounds description]
		 * @return {[type]} [description]
		 */
		function removeBounds() {

			// cleans the activeBounds Queue
			var nActiveBounds = Object.keys(activeBounds).length;
			// console.log('#Regions with Active Bounds:', nActiveBounds );
			if ( nActiveBounds > 0 )
			{ 
				// console.log('There are things to be cleaned!');
				for (var region in activeBounds) {
					// console.log('#-# region: ', region);
					for ( var i = 0; i < activeBounds[region].length; i++ ) {
						activeBounds[region][i].remove();
					}
					activeBounds[region] = [];
				}
			} 
		}


		/**
		 * [noHoverRegion description]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		function noHoverRegion(event) {
			// console.log('mouseOut:', this.attr('id'));
        	// setTimeout( function() { removeBounds() }, 2000 );

			if ( isFullyCompatibleBrowser ) {

				/* regions labels */
				var label_hover_x = 0;
				var label_hover_y = 0;

				if ( typeof regionsMetadata[ this.attr('id') ] != 'undefined') 
				{				
					if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_offset_x'] != 'undefined')
						label_hover_x = -1 * regionsMetadata[ this.attr('id') ]['label_hover_offset_x'];
		
					if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_offset_y'] != 'undefined')
						label_hover_y = -1 * regionsMetadata[ this.attr('id') ]['label_hover_offset_y'];

					// if ( typeof regionsMetadata[ this.attr('id') ]['label_hover_rotation'] != 'undefined')
					// 	label_hover_rotation = -1 * regionsMetadata[ this.attr('id') ]['label_hover_rotation'];

				}


    	        this.animate({ transform: "s1,1" }, 700, mina.elastic).attr({ filter: noShadow });
	
				regions[ this.attr('id') ].snapLabel.animate( { 'opacity': '0.2' }, 300, mina.easeout );
				regions[ this.attr('id') ].snapLabel.addTransform('s0.5,0.5').addTransform('t'+label_hover_x+','+label_hover_y);
			}
			else
			{
    	        this.animate({ transform: "s1,1" }, 700, mina.elastic).attr({ filter: noInvert });
			}


		}



		/**
		 * [clickRegion description]
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		function clickRegion(event) {
			// var bbox = this.getBBox();
			top.location.href = 'http://dev.sfidalabs.com/migro2/regione/'+this.attr('id'); 
		}

		/* Main ************************************************************************/

		var regions = f.select("#regions");
		s.append(regions); 

		var	elemRegions		= document.querySelectorAll('#regions > path'),
			regions			= {};

		// console.log( 'Regiones:', elemRegions.length );

		s.mouseout( function(event) {
			mouseOutSVG(event);
		} );

		var regionBBox;
		for ( var i = 0; i < elemRegions.length; i++ ) {
			regions[ elemRegions[i].id ] = {};
			regions[ elemRegions[i].id ].id = elemRegions[i].id;
			var regionId = regions[ elemRegions[i].id ].id;
			// regions[ elemRegions[i].id ].name = elemRegions[i].getAttribute('data-name');
			regions[ elemRegions[i].id ].snapObject = s.select( '#'+elemRegions[i].id );
			regions[ elemRegions[i].id ].pathLength = Snap.path.getTotalLength( regions[ elemRegions[i].id ].snapObject );

			/* region bounding box */
			var regionBBox = regions[ elemRegions[i].id ].snapObject.getBBox();
            
            var x_center = ( regionBBox.x2 + regionBBox.x ) / 2 + map_x_offset; 
            var y_center = ( regionBBox.y2 + regionBBox.y ) / 2 + map_y_offset;

			/* event handlers */
			regions[ elemRegions[i].id ].snapObject.hover( hoverRegion, noHoverRegion );
			regions[ elemRegions[i].id ].snapObject.click( clickRegion );

			/* regions labels */
			var label_x = x_center;
			var label_y = y_center;
			var label_text = regionId;
			var label_rotation = 0;

			if ( typeof regionsMetadata[ elemRegions[i].id ] != 'undefined') 
			{				
				if ( typeof regionsMetadata[ elemRegions[i].id ]['label_offset_x'] != 'undefined')
					label_x += regionsMetadata[ elemRegions[i].id ]['label_offset_x'];
	
				if ( typeof regionsMetadata[ elemRegions[i].id ]['label_offset_y'] != 'undefined')
					label_y += regionsMetadata[ elemRegions[i].id ]['label_offset_y'];

				if ( typeof regionsMetadata[ elemRegions[i].id ]['text'] != 'undefined')
					label_text = regionsMetadata[ elemRegions[i].id ]['text'];

				if ( typeof regionsMetadata[ elemRegions[i].id ]['rotation'] != 'undefined')
					label_rotation = regionsMetadata[ elemRegions[i].id ]['rotation'];

			}


			var label 		= s.text(label_x, label_y, label_text);
			var labelBBox 	= label.getBBox();
			label.transform('t-'+labelBBox.width/2+',-'+ labelBBox.height/2 +' r' + label_rotation );
			label.attr({ 'pointer-events': 'none' });
			regions[ elemRegions[i].id ].snapLabel = label;
			// regions[ elemRegions[i].id ].snapLabel.remove();
			regions[ elemRegions[i].id ].snapLabel.attr({'opacity': '0.2'});

			regions[ elemRegions[i].id ].snapLabelTransform = regions[ elemRegions[i].id ].snapLabel.transform();
        	// console.log( 'current label transform:', regions[ elemRegions[i].id ].snapLabelTransform ); 


			// s.append(regions[ elemRegions[i].id ].snapLabel );

		}
		/* /End Main ************************************************************************/


	});
};
