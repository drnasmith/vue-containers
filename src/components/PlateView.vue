
<!--
Component that renders a plate based on a passed geometry
Tries to be as data agnostic as possible
OnClickEvent will only fire if there is data bound to the element with a valid LOCATION property
TODO - move the score colour methods to a utility class
-->
<template>
    <div>
        <div id="plate" class="mt-3 border border-green-500"></div>
    </div>
</template>

<script>
import * as d3 from 'd3'


export default {
    name: 'Plate-View',
    props: {
        'container': Object, // Plate geometry
        'samples': Array, // Data bound to each cell / location
        'selected': {
            type: Array, // list of locations that should be highlighted
            required: false
        },
        label: {
            type: String, // Which key within the sample data should be shown (location index if nothing provided)
            required: false
        },
        'color-scale': String, // color-scale mapped to colorScale prop
        'threshold': Number // Threshold used as part of colorScale
    },
    data: function() {
        return {
            cell: {
                width: 60,
                height: 60,
                padding: 4, // Padding within each cell
                margin: 10, // Spacing between wells in graphic
            },
        }
    },
    computed: {
      dropsPerWell: function() {
          return this.container.drops.x * this.container.drops.y
      },
      dropWidth: function() {
        return this.cell.width / this.container.drops.x
      },
      dropHeight: function() {
        return this.cell.height / this.container.drops.y
      },
      dropCoords: function() {
        // Build up coordinates for each drop based on the geometry
        // Will include an array of objects with x, y parameters
        let drops = []
        
        for (let i = 0; i<this.container.drops.x; ++i) {
            for (let j = 0; j<this.container.drops.y; ++j) {
                drops.push({x: this.cell.padding + this.dropWidth*i, y: this.cell.padding + this.dropHeight*j})
            }
        }
        return drops
      },
      columns: function() {
          return (this.container.capacity /  this.dropsPerWell) / this.container.rows
      },
      columnLabels: function() {
        let labels = Array.from({length: this.columns}, (v, i) => i + 1)
        return labels
      },
      columnDomain: function() {
        let labels = Array.from({length: this.columns}, (v, i) => i)
        return labels
      },
      rowLabels: function() {
        // Return the alphabet as an array of letters
        let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let labels = Array.from({length: letters.length}, (v, i) => letters.charAt(i))
        return labels
      },
      rowDomain: function() {
        // Return the alphabet as an array of letters
        let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let labels = Array.from({length: letters.length}, (v, i) => i)
        return labels
      },
      preparedData: function() {
        // Firstly create an array of length == capacity of container
        let samples = Array.from({length: this.container.capacity}, () => { return {} })

        // Now fill in location with sample data at that location
        for (var i=0; i<this.samples.length; i++) {
            let location = this.samples[i].LOCATION || null
            // Not quite right - need to add as an array for consistency
            if (location) samples[location-1] = this.samples[i]
        }

        // Chop up the list of "samples" at each location into rows/wells
        // [ A [ 1 [1,2], 2 [3,4], ... ], B [ 1 [ 5,6 ], 2 [7,8], ...] ]

        // First parse into an array of wells
        var wells = [];
        while (samples.length) {
            wells.push(samples.splice(0, this.dropsPerWell));
        }

        let chunked_rows = [];
        while (wells.length) {
            chunked_rows.push(wells.splice(0, this.columns));
        }

        return chunked_rows;
      }
    },
    mounted: function() {
        this.drawContainer()
  },
  methods: {
      drawContainer: function() {
          // Standard practice for d3 chart is to define margin, then define graphic/chart area inset from main svg
          // This allows room for axes labels etc.
          const margin = { top: 40, left: 40, bottom: 20, right: 20 }

          const viewBoxWidth = this.preparedData[0].length*(this.cell.width+2*this.cell.padding+this.cell.margin) + margin.left+margin.right
          const viewBoxHeight = this.preparedData.length*(this.cell.height+2*this.cell.padding+this.cell.margin) + margin.top+margin.bottom

          const viewBox = [0,0,viewBoxWidth,viewBoxHeight]

          console.log("View box size = " + viewBox)
          console.log("Rows = " + this.preparedData.length)
          console.log("Columns = " + this.preparedData[0].length)
          
          // Make the svg fit within a viewport
          const svg = d3.select('#plate')
            .append('svg')
            .attr('viewBox', viewBox.join(','))
            .attr('preserveAspectRatio', 'xMaxYMax meet')

          // Column labels e.g. 1..12
          svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top-5})`)
            .selectAll('text')
            .data(this.columnLabels)
            .enter()
            .append('text')
                .attr('x', (d,i) => { return (this.cell.width+2*this.cell.padding+this.cell.margin)*i })
                .style('fill', 'black')
                .text( function(d) { return d; })

        // Row labels scale - maps numbers to letters
        let letterScale = d3.scaleOrdinal().domain(this.rowDomain).range(this.rowLabels)

        // Row labels e.g. A..H
        svg.append('g')
            .attr('transform', `translate(${margin.left - margin.left/2}, ${margin.top+margin.top/2})`)
            .selectAll('text')
            .data(this.preparedData)
            .enter()
            .append('text')
                .attr('y', (d,i) => { return (this.cell.height+2*this.cell.padding+this.cell.margin)*i })
                .style('fill', 'black')
                .text( function(d,i) { return letterScale(i); })

          // Chart area
          const graphic = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

          this.drawRows(graphic)

      },
      // The main plate gra
      drawRows: function(graphic) {
          // This keyword gets used for d3 selection in 'each' method
          let self = this

          let rows = graphic.selectAll('.container-row')
            .data(this.preparedData)
            .enter()
            .append('g')
                .attr('class', 'container-row')
                .attr('transform', (d,i) => { return 'translate(0,' + (this.cell.height+2*this.cell.padding+this.cell.margin)*i + ')'})
          
          rows.each(function(d, i) {
                    d3.select(this).selectAll('.container-cell')
                    .data(d)
                    .enter()
                    .append('g')
                        .attr('class', 'container-cell')
                        .attr('transform', (d,i) => { return 'translate('+ (self.cell.width+2*self.cell.padding+self.cell.margin)*i + ',0)'})
                        .call(self.drawRow, i)
                })
      },
      // Draw well and drops
      // selection is the row data
      // i in the column index,
      drawRow: function(selection) {
        let self = this

        // Draw the cell/well boundary
        selection.append('rect')
            .attr('class', 'container-well')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.cell.width+2*this.cell.padding)
            .attr('height', this.cell.height+2*this.cell.padding)
            .style('stroke','black')
            .style('fill','none')
            .style('fill-opacity','0.2')

        // Draw the drops - grouped into a node 
        selection.append('g')
            .attr('class', 'drops')
            .each( function(d) {
                d3.select(this).selectAll('.drop')
                .data(d)
                .enter()
                .append('rect')
                    .attr('class', 'drop')
                    .attr('x', (d,i) => { return self.dropCoords[i].x })
                    .attr('y', (d,i) => { return self.dropCoords[i].y })
                    .attr('width', self.dropWidth*self.container.drops.w)
                    .attr('height', self.dropHeight*self.container.drops.h)
                    // .style('fill', 'none')
                    .style('stroke', 'gray')
                    .style('fill', (d) => { return self.scoreColors(d) })
                    .style("pointer-events","visible") // Required to capture mouse events on non-fill shapes
                    .on("click", function() {
                        let sampleId = d3.select(this).data()[0].BLSAMPLEID
                        if (sampleId === undefined) return

                        let index = self.selected.indexOf(sampleId)

                        if ( index < 0) {
                            d3.select(this).style('stroke', 'steelblue').style('stroke-width', 2)
                            self.selected.push(sampleId)
                        } else {
                            d3.select(this).style('stroke', 'gray').style('stroke-width', 1)
                            self.selected.splice(index, 1)
                        }
                    })

                d3.select(this).selectAll('text')
                .data(d)
                .enter()
                .append('text')
                    .attr('x', (d,i) => { return self.dropCoords[i].x + self.dropWidth*0.5*self.container.drops.w })
                    .attr('y', (d,i) => { return self.dropCoords[i].y + self.dropHeight*0.5*self.container.drops.h })
                    .html((d) => { return d.SCORE ? d3.format(".1f")(d.SCORE) : ''})
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('font-size', '10px')
                    .style('fill', 'darkgray')
                    .style("pointer-events","none") // Required to capture mouse events on non-fill shapes
                
            })
      },
      scoreColors: function(d) {
        let color = 'none'
        switch(this.colorScale) {
            case 'rgb':
                color = this.rgbScale(d)
                break
            case 'viridis':
                color = this.viridisScale(d)
                break
            case 'threshold':
                color = this.quantScale(d)
                break
            default:
                color = this.rgbScale(d)
                break
        }
        return color
      },
      quantScale: function(d) {
        let color = 'none'

        var myColor = d3.scaleThreshold()
            .domain([0,this.threshold, 1])
            .range(["lightgray", "lightgray", "green"])
        
        let score = d.SCORE || null

        if (score) {
            color = myColor(score)
        }

        return color
      },
      rgbScale: function(d) {
        let color = 'none'
        // Option 1: give 2 color names
        var myColor = d3.scaleLinear()
            .domain([0,1])
            .range(["red", "green"])
        
        let score = d.SCORE || null

        if (score)
            color = myColor(score)

        return color
      },
      viridisScale: function(d) {
        let color = 'none'
    
        let score = d.SCORE || null
    
        if (score) color = d3.interpolateViridis(score)

        return color
      },
    }
}
</script>