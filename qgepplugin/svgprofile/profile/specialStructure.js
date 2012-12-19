/**
 * Created with JetBrains PhpStorm.
 * User: kk
 * Date: 11/28/12
 * Time: 9:18 PM
 * To change this template use File | Settings | File Templates.
 */

define([ "dojo/_base/declare", "dojo/_base/lang", "profile/profileElement" ], function (declare, lang, _ProfileElement) {
  return declare([ _ProfileElement ], {
    specialStructures: null, /* Reference to the current working set */
    line: d3.svg.line(),
    tooltip: d3.select('body')
      .append( 'div' )
      .attr('class', 'tooltip')
      .attr('id', 'special-structure-tooltip'),

    constructor: function(/*Object*/ kwArgs)
    {
      lang.mixin(this, kwArgs);

      this.line
        .x( lang.hitch( this, function(d) { return this.x( d.x ); } ) )
        .y( lang.hitch( this, function(d) { return this.y( d.y ); } ) );
    },

    data: function( data )
    {
      this.specialStructures = this.svgProfile
        .selectAll( '.special-structure' )
        .data( data, ƒ( 'gid' ) );

      this.specialStructures.exit()
        .transition()
        .duration(300)
        .attr('opacity',0)
        .remove();

      var newSpecialStructures = this.specialStructures
        .enter()
        .append('svg:g')
        .attr( 'id', function(d) { return d.objId; } )
        .attr( 'class', function(d) { return 'usage-current-' + d.usageCurrent; } )
        .classed( 'special-structure', true );

      newSpecialStructures
        .append('svg:path')
        .datum( lang.hitch( this, function(d) { d.pathPoints = this.pathPoints(d); return d; } ) )
        .on('mouseover', lang.hitch( this,
          function(d) {
            console.info( 'ssstruct');
            return this.tooltip
              .html(
              '<h2>Special structure ' + d.objId + '</h2><br/>' +
                "<strong>Entry level:</strong> " + this.formatMeters( d.startLevel ) + '<br/>' +
                "<strong>Exit level:</strong> "  + this.formatMeters( d.endLevel ) + '<br/>' +
                "<strong>Bottom level:</strong> " + this.formatMeters( d.bottomLevel ) + '<br/>' +
                "<strong>Cover level:</strong> "  + this.formatMeters( d.coverLevel ) )
              .style('top', lang.hitch( this, function() { return this.tooltipTop( this.tooltip ); } ) )
              .style('left', (event.pageX+10)+'px');
          } ) )
        .on('mouseout', lang.hitch( this, function() { return this.tooltip.style('left', '-9999px'); } ) );

      newSpecialStructures
        .append('svg:text')
        .text( function(d) { return d.description; } );
    },

    redraw: function( duration )
    {
      var texts = this.specialStructures.selectAll('text');
      var paths = this.specialStructures.selectAll('path');

      if ( duration > 0 )
      {
        texts = texts
          .transition()
          .duration(duration);

        paths = paths
          .transition()
          .duration(duration);
      }

      texts
        .attr( 'x', lang.hitch( this, function (d) { return this.x( (d.endOffset + d.startOffset)/2 ); } ) )
        .attr( 'y', lang.hitch( this, function (d) { return this.y( d.coverLevel ) - 3; } ) );

      paths
        .attr( 'd', lang.hitch( this, function(d) { return this.line(d.pathPoints) +'Z'; } ) );
    },

    extent: function()
    {
      var minX = d3.min( this.specialStructures.data(), ƒ('startOffset') ) || 0;
      var maxX = d3.max( this.specialStructures.data(), ƒ('endOffset') ) || 1;
      var minY = d3.min( this.specialStructures.data(), ƒ('bottomLevel') ) || 0;
      var maxY = d3.max( this.specialStructures.data(), ƒ('coverLevel') ) || 1;

      return {x: [minX, maxX], y: [minY, maxY] };
    },

    pathPoints: function(d)
    {
      var x1 = d.startOffset;
      var y1 = d.coverLevel;
      var x2 = d.endOffset;
      var y2 = d.coverLevel;
      var x3 = d.endOffset;
      var y3 = d.endLevel;
      var x4 = d.wwNodeOffset;
      var y4 = d.bottomLevel;
      var x5 = d.startOffset;
      var y5 = d.startLevel;

      var corners = [
        {x: x1, y: y1 },
        {x: x2, y: y2 },
        {x: x3, y: y3 },
        {x: x4, y: y4 },
        {x: x5, y: y5 }
      ];

      var filteredCorners = corners.filter( function(d) { return d.x !== null && d.y !== null; } );

      return filteredCorners;
    }
  });
});