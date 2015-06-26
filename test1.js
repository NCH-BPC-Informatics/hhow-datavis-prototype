var tempBarChart  = dc.barChart("#barChartTemp");
var psalBarChart = dc.barChart("#barChartPsal");

tempBarChart.yAxis().ticks(0); 
psalBarChart.yAxis().ticks(0);
	
json = [{
			"temp": 23,
			"psal": 35
		}, 
		{
			"temp": 23,
			"psal": 35,
		}, 
		{
			"temp": 23,
			"psal": 30
		}, 
		{
			"temp": 23,
			"psal": 30
		}, 
		{
			"temp": 23,
			"psal": 33
		}, 
		{
			"temp": 20,
			"psal": 38
		}, 
		{
			"temp": 22,
			"psal": 33
		}, 
		{
			"temp": 27,
			"psal": 37
		}, 
		{
			"temp": 21,
			"psal": 34
		}, 
		{
			"temp": 31,
			"psal": 38
		}, 
		{

			"temp": 35,
			"psal": 39
		}, 
		{
			"temp": 32,
			"psal": 31
		}, 
		{

			"temp": 32,
			"psal": 31
		}, 
		{
			"temp": 20,
			"psal": 32
		}, 
		{
			"temp": 29,
			"psal": 31
		}, 
		{
			"temp": 33,
			"psal": 38
		}, 
		{
			"temp": 21,
			"psal": 34
		}, 
		{
			"temp": 31,
			"psal": 38
		}, 
		{
			"temp": 35,
			"psal": 39
		}, 
		{
			"temp": 32,
			"psal": 31
		}, 
		{
			"temp": 21,
			"psal": 34,
		}, 
		{
			"temp": 31,
			"psal": 38
		}, 
		{
			"temp": 35,
			"psal": 39
		},
		{
			"temp": 40,
			"psal": 35
		}];
		
	var xFilter = crossfilter(json);
	var totalReadings = xFilter.size();
	var all = xFilter.groupAll();

    // Updated version 
    dc.dataCount(".dc-data-count")
				.dimension(xFilter)
				.group(all);

	
	// dimensions and groups
	var tempDim = xFilter.dimension(function (d) { return d.temp; });
	var tempGroup = tempDim.group().reduceCount(function (d) { return d.temp; });
		
	var psalDim = xFilter.dimension(function(d) {return d.psal;}); 
	var psalGroup= psalDim.group().reduceCount(function(d) {return d.psal;}); 
	var brush = d3.svg.brush();
		
	// Charts
		tempBarChart	
			.width(300).height(150)			
			.dimension(tempDim) 
			.group(tempGroup) 	
			.x(d3.scale.linear()
				.domain([15, 45])) 					
			.xAxisLabel("Temperature")
            .centerBar(true)
			.on("brushstart", brushed)
			
		psalBarChart	
			.width(300).height(150)			
			.dimension(psalDim) 
			.group(psalGroup) 
			.x(d3.scale.linear()
				.domain([25, 40])) 		
			.xAxisLabel("Salinity")
            .centerBar(true)
			.on("brushstart", brushed)
			
		// keep track of total readings
		d3.select("#total").text(totalReadings);
		
		// First listener test
		function brushed() {
			console.log("brush test 1");
			d3.select("#current").text(all.value());
		}
		
		// Second listener test
		brush.on("brushstart", function() {
			console.log("brush test 2");
		});

			
		// render all charts
		dc.renderAll();