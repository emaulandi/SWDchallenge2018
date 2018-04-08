var chartSize = 180;
var margin = {top: 30, right: 10, bottom: 10, left: 10}
var base = 10;
var raceTab = ["White","Asian","Latino","Black_or_African_American","Other_minorities_rest"];
var color = d3.scaleOrdinal().range(['lightgrey','#aaff80','#b3e6ff','#ffbb99','#ccb3ff']).domain(raceTab); 


var svgContainer = d3.select(".content").append("div").attr("class", "chartContainer");

var legendData = [
	{race: raceTab[0], perc: 60},
	{race: raceTab[1], perc: 10},
	{race: raceTab[2], perc: 10},
	{race: raceTab[3], perc: 10},
	{race: raceTab[4], perc: 10}	
];

d3.csv("data/proportionFor100.csv", function(data) {
	console.log(data);
	
	addLegend();
	
	var prepData = prepareData(data);
	//console.log(prepData );
	drawCharts(svgContainer,prepData);
	
	setupIsotope();

});

function addLegend() {

	var svgLegend = d3.select(".legendContainer").append("svg")
		.attr("width", chartSize)
	  	.attr("height", chartSize);
	  	
	svgLegend.selectAll("rect")
			.data(prepareSingleChartData(legendData))
			.enter()
			.append("rect")
			.attr("x", (d,i) => d.x * chartSize/base)
			.attr("y", (d,i) => d.y * chartSize/base)
			.attr("width", chartSize/base - 1)
			.attr("height", chartSize/base - 1)
			.style("fill", (d,i) => {return color(d.color);});
	
	// COLOR LEGEND //
	var colorCat = d3.scaleOrdinal().range(color.range()).domain(["White","Asian","Latino","Black or African American","Other minorities (Native Hawaiian or Pacific Islander, American Indian Alaskan Native, 2 or more races)"]);
	var colorLegend = d3.legendColor()
		.labelFormat(d3.format(".2f"))
  		.labelWrap(160)
        .scale(colorCat)
        .shapePadding(5)
        .shapeWidth(chartSize/base - 2)
        .shapeHeight(chartSize/base - 2)
        .labelOffset(10);
   
   d3.select(".legendColor").append("svg").append("g")
        .attr("class", "legend")
        .call(colorLegend);

}

function setupIsotope(){

	// init Isotope
	var $grid = $('.chartContainer').isotope({
		itemSelector: '.chart',
		layoutMode: 'fitRows',
		getSortData: {
			company: (e) => {
				d = d3.select(e).datum();
				return d.company;
			},
			white: (e) => {
				d = d3.select(e).datum();
				return getValueSort(d,"White");
			},
			asian: (e) => {
				d = d3.select(e).datum();
				return getValueSort(d,"Asian");
			},
			black: (e) => {
				d = d3.select(e).datum();
				return getValueSort(d,"Black_or_African_American");
			},
			latino: (e) => {
				d = d3.select(e).datum();
				return getValueSort(d,"Latino");
			},
			others: (e) => {
				d = d3.select(e).datum();
				return getValueSort(d,"Other_minorities_rest");
			}
		}
	});
	
	// bind sort button click
	$('.sort-by-button-group').on( 'click', 'button', function() {
	  var sortValue = $(this).attr('data-sort-value');
	  $grid.isotope({ sortBy: sortValue });
	});

	// change is-checked class on buttons
	$('.button-group').each( function( i, buttonGroup ) {
	  var $buttonGroup = $( buttonGroup );
	  $buttonGroup.on( 'click', 'button', function() {
		$buttonGroup.find('.is-checked').removeClass('is-checked');
		$( this ).addClass('is-checked');
	  });
	});

}

function getValueSort(d,text){
	var perc ;
	for (i=0;i<raceTab.length;i++){
		if(d.percArray[i].race == text){
			perc = d.percArray[i].perc;
			//console.log(d.percArray[i]);
		}
	}
	return perc * -1;
}

function prepareData(inputData){
	
	return inputData.map(function(d) {
	
		var percArray = [];
		for (i=0;i<raceTab.length;i++){
			var race = raceTab[i];
			percArray.push({race: race, perc: +d[race]});
			
			//console.log("raceTab[i]",raceTab[i]);
			//console.log("+d[race]",+d[race]);
		}
		percArray.sort(function(a, b){return b.perc - a.perc});
		//console.log("percArray",percArray);
	
		return {
        	"company": d.Company, 
        	"percArray": percArray
        };
	});
}

function drawCharts(svg,data) {

	var divs = svg.selectAll(".chart")
		.data(data)
		.enter()
		.append("div")
			.attr("class", "chart")
	  	.append("svg")
	  		.attr("width", chartSize + margin.left + margin.right )
	  		.attr("height", chartSize + margin.top + margin.bottom ) ;
	 
	divs.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.selectAll("rect")
			.data((d) => prepareSingleChartData(d.percArray))
			.enter()
			.append("rect")
			.attr("x", (d,i) => d.x * chartSize/base)
			.attr("y", (d,i) => d.y * chartSize/base)
			.attr("width", chartSize/base - 1)
			.attr("height", chartSize/base - 1)
			.style("fill", (d,i) => {return color(d.color);});

	divs.append("text")
		.text( (d) => {return d.company})
		.attr("transform", "translate(15,15)");
}

//console.log(prepareSingleChartData(testItems[0].innerData));
function prepareSingleChartData(data){
	var recArray = [];
	//count value to help define position
	var i = 0;
	
	// for each race
	for (j=0;j<data.length;j++){
		//for each # of people
		for (k=0;k<data[j].perc;k++){
			//add a value whoch will correspond to a small rectangle
			recArray.push(
				{x: i%base, y: Math.trunc(i/10), color: data[j].race}
			);
			i++;
		}	
	}
	
	return recArray;
}
