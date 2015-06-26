var filename = "https://html5-cosmocracy.c9.io/SpecimenStats10000.csv";
d3.csv(filename, function(error, data) {
    if(error) {
        var msg = "Could not read " + filename;
        console.log(msg);
        alert(msg);
        return;
    }

	// CSV data pre-processing (e.g., type conversion, attribute extraction)
    var dateFormat = d3.time.format("%Y-%m-%d");
    data.forEach(function (d) {
    	d.collectionDate = dateFormat.parse(d.collectionDate);
    	d.collectionMonth = d3.time.month(d.collectionDate); // pre-calculate month for better performance
    	d.SpecimenCount = +d.SpecimenCount;
    });
	
	var ndx = crossfilter(data);
    var all = ndx.groupAll();
    
    var collectionYearDimension = ndx.dimension(function (d) {
        return d3.time.year(d.collectionDate).getFullYear();
    });
    
    var collectionYearPerformanceGroup = collectionYearDimension.group().reduce(
        /* callback for when data is added to the current filter results */
        function (p, v) {
            p.count += v.SpecimenCount;
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function (p, v) {
            p.count -= v.SpecimenCount;
            return p;
        },
        /* initialize p */
        function () {
            return {
                count: 0
            };
        }
    );
    
    var collectionDateDimension = ndx.dimension(function (d) {
        return d.collectionDate;
    });
    
    var collectionMonths = ndx.dimension(function (d) {
        return d.collectionMonth;
    });

	// group by total movement within month
    var collectionMonthsGroup = collectionMonths.group().reduceSum(function (d) {
        return d.SpecimenCount; // ???
    });

	// group by total volume within move, and scale down result

 
    var specimensByMonthGroup = collectionMonths.group().reduceSum(function (d) {
        return d.SpecimenCount; // / 500000;
    });

    var specimenBiophysicalType = ndx.dimension(function (d) {
        return d.specimenBiophysicalType;
    });
    var specimenBiophysicalTypeGroup = specimenBiophysicalType.group();

    var pathologicalStatus = ndx.dimension(function (d) {
        return d.pathologicalStatus;
    });
    var pathologicalStatusGroup = pathologicalStatus.group();

    var specimenBiophysicalType = ndx.dimension(function (d) {
        return d.specimenBiophysicalType;
    });
    var specimenBiophysicalTypeGroup = specimenBiophysicalType.group();

	var pathologicalStatusChart = dc.pieChart('#pathological-status');
	pathologicalStatusChart
		.dimension(pathologicalStatus)
        .group(pathologicalStatusGroup)
        .width(300) // (optional) define chart width, :default = 200
        .height(300) // (optional) define chart height, :default = 200
        .radius(100)
        .innerRadius(20);
        
    dc.dataCount('.dc-data-count')
        .dimension(ndx)
        .group(all);



	dc.dataTable('.dc-data-table')
        .dimension(collectionDateDimension)
        .group(function (d) {
            var format = d3.format('02d');
            return d.collectionDate.getFullYear() + '/' + format((d.collectionDate.getMonth() + 1));
        })
        .size(20) // (optional) max number of records to be shown, :default = 25
        //.columns([
        //	'SpecimenCount'
        	/*
        	'collectionDate', 
        	'specimenBiophysicalType',
        	'preservationType',
        	'fmaAnatomicSourceLocation',
        	'pathologicalStatus',
        	'diseaseStatus',
        	'collectionInstitution',
        	'SpecimenCount'
        	*/
        	/*
            {
                label: 'Change', // desired format of column name 'Change' when used as a label with a function.
                format: function (d) {
                    return numberFormat(d.close - d.open);
                }
            },
            */
        //])
        .sortBy(function (d) {
            return d.collectionDate;
        });
        
        var monthlySpecimenCollectionChart = dc.barChart('#monthly-specimen-collection-chart');
 		monthlySpecimenCollectionChart
 			.width(990)
 			.height(100)
        	.margins({top: 0, right: 50, bottom: 20, left: 40})
        	.dimension(collectionMonths)
	        .group(specimensByMonthGroup)
	        .centerBar(true)
	        .gap(1)
	        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2015, 11, 31)]))
	        .round(d3.time.month.round)
	        // .alwaysUseRounding(true)
	        .xUnits(d3.time.months);
});            


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