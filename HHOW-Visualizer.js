String.prototype.trunc =
      function(n){
          return this.substr(0,n-1)+(this.length>n?'&hellip;':'');
      };

function remove_empty_bins(source_group) {
    return {
        all: function () {
            return source_group.all().filter(function (d) {
                return d.value != 0;
            });
        }
    };
}

var displayDateFormat = d3.time.format("%m/%d/%Y");
var filename = "SpecimenStats.csv";
d3.csv(filename, function (error, data) {
    if (error) {
        var msg = "Could not read " + filename;
        console.log(msg);
        alert(msg);
        return;
    }

    data.forEach(function (d) {
        var number = d.SpecimenCount.match(/\d+$/);
		d.SpecimenCount = parseInt(number, 10);
    });

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var protocolCategoryDimension = ndx.dimension(function (d) { return d.ProtocolCategory; });
    var protocolCategoryGroup = protocolCategoryDimension.group().reduceSum(function (d) { return d.SpecimenCount; });
    var protocolCategoryChart = dc.pieChart('#protocol-category')
        .dimension(protocolCategoryDimension)
        .group(protocolCategoryGroup)
        .width(600) // (optional) define chart width, :default = 200
        .height(350) // (optional) define chart height, :default = 200
        .radius(150)
        .innerRadius(100)
        .legend(dc.legend().x(0).y(0))//.gap(5))
        .cx(400)
        //.label(null)
    .minAngleForLabel(100);

    var protocolStatusDimension = ndx.dimension(function (d) { return d.CollectionProtocolStatus; });
    var protocolStatusGroup = protocolStatusDimension.group().reduceSum(function (d) { return d.SpecimenCount; });
    var protocolStatusChart = dc.pieChart('#protocol-status')
        .dimension(protocolStatusDimension)
        .group(protocolStatusGroup)
        .width(300) // (optional) define chart width, :default = 200
        .height(200) // (optional) define chart height, :default = 200
        .radius(50)
        .cx(200)
        .cy(50)
        .legend(dc.legend().x(0).y(0))//.gap(5))
        //.innerRadius(50)
        .minAngleForLabel(100);

    var protocolDimension = ndx.dimension(function (d) { return d.CtepStudyID; });
    var protocolGroup = protocolDimension.group().reduceSum(function (d) { return d.SpecimenCount; });
/*
    var protocolChart = dc.bubbleCloud('#protocols')
        .dimension(protocolDimension)
        .group(protocolGroup)
        .width(300)
        .height(300) // (optional) define chart height, :default = 200
        //.x(d3.scale.ordinal().domain([0,150000]))
        .x(d3.scale.ordinal())
        .r(d3.scale.linear().domain([0, 150000]))
        .maxBubbleRelativeSize(0.1)
        .radiusValueAccessor(function (d) {
            return d.value; // 1; // d.value; // 0.5; //d.SpecimenCount;
        });
*/
    var protocolGroup2 = remove_empty_bins(protocolGroup);
/*
    var protocolChart2 = dc.rowChart('#protocols2')
        .dimension(protocolDimension)
        .group(protocolGroup2)
        .width(700)
        .height(700)
        .elasticX(true);
*/
    var protocolChart3 = dc.barChart('#protocols3')
        .dimension(protocolDimension)
        .group(protocolGroup2)
        .width(1100)
        .height(400)
        .elasticY(true)
        .elasticX(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .brushOn(false)
        .margins({top:0, bottom:70, left:60, right:0})
        .yAxisLabel("# Specimens")
        .barPadding(0.1)
        .outerPadding(0.05)
        .renderlet(function (chart) {
            chart.selectAll("g.x text")
              .attr('dx', '-30')
              .attr('dy', '-7')
              .attr('transform', "rotate(-90)");
        });
        

    var specimenBiophysicalType = ndx.dimension(function (d) { return d.specimenBiophysicalType; });
    var specimenBiophysicalTypeGroup = specimenBiophysicalType.group().reduceSum(function (d) { return d.SpecimenCount; });
    var specimenBiophysicalTypeChart = dc.pieChart('#specimen-biophysical-type')
        .dimension(specimenBiophysicalType)
        .group(specimenBiophysicalTypeGroup)
/*
        .width(300) // (optional) define chart width, :default = 200
        .height(300) // (optional) define chart height, :default = 200
        .radius(150)
        .innerRadius(20);
*/
        .width(300) // (optional) define chart width, :default = 200
        .height(200) // (optional) define chart height, :default = 200
        .radius(50)
        .cx(200)
        .cy(50)
        .legend(dc.legend().x(0).y(0))//.gap(5))
        //.innerRadius(50)
        .minAngleForLabel(100);

    var diseaseStatus = ndx.dimension(function (d) { return d.diseaseStatus; });
    var diseaseStatuseGroup = diseaseStatus.group().reduceSum(function (d) { return d.SpecimenCount; });
    var diseaseStatusChart = dc.pieChart('#disease-status')
        .dimension(diseaseStatus)
        .group(diseaseStatuseGroup)
        .width(300) // (optional) define chart width, :default = 200
        .height(200) // (optional) define chart height, :default = 200
        .radius(50)
        .cx(200)
        .cy(50)
        .legend(dc.legend().x(0).y(0))//.gap(5))
        //.innerRadius(50)
        .minAngleForLabel(100);

    dc.dataCount('.dc-data-count')
        .dimension(ndx)
        .group(all);

    var specimenCountGroup = ndx.groupAll().reduceSum(function (p) { return p.SpecimenCount; });
    var specimenCountND = dc.numberDisplay(".candidate-specimens-counter")
        .formatNumber(d3.format(".g"))
        .valueAccessor(function (p) { return p; })
        .group(specimenCountGroup)
        .transitionDuration(0);

    var totalSpecimenCount = specimenCountGroup.value();
    var specimenCountND = dc.numberDisplay(".total-specimens-counter")
        .formatNumber(d3.format(".g"))
        .valueAccessor(function (p) { return totalSpecimenCount; })
        .group(specimenCountGroup)
        .transitionDuration(0);

    /*
    http://getbootstrap.com/examples/theme/#
    http://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-1-Using-Crossfil
    file:///C:/TDE/GitHub/hhow-datavis-prototype/HHOW-Visualizer.html
    https://becomingadatascientist.wordpress.com/tag/dc-js/
    http://paletton.com/#uid=72G0u0kfDpf6bEGaJuhkgkIphfP
    http://stackoverflow.com/questions/27789872/display-the-number-of-distinct-items-with-data-count-widget
    */
    var specimenStatsGrid = dc.dataTable('#specimen-stats-grid')
        .width(960)
        .height(800)
        .dimension(protocolDimension)
        .group(function (d) { return "(Candidate Subset)" })
        .size(20) // (optional) max number of records to be shown, :default = 25
        .columns([
            function (d) { return d.CtepStudyID; },
            function (d) { return d.CollectionProtocolStatus; },
            function (d) { return d.ProtocolCategory; },
            function (d) { return d.specimenBiophysicalType; },
            function (d) { return d.preservationType; },
            function (d) { return d.fmaAnatomicSourceLocation; },
            function (d) { return d.pathologicalStatus; },
            function (d) { return d.diseaseStatus; },
            function (d) { return d.SpecimenCount; }
        ])
        .sortBy(function (d) { return d.CtepStudyID; });

    $(document).ready(function () {
		// Render all charts
        dc.filterAll();
        dc.renderAll();
    });
});

function print_filter(filter) {
    var f = eval(filter);
    if (typeof (f.length) != "undefined") { } else { }
    if (typeof (f.top) != "undefined") { f = f.top(Infinity); } else { }
    if (typeof (f.dimension) != "undefined") { f = f.dimension(function (d) { return ""; }).top(Infinity); } else { }
    console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
}