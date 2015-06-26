var displayDateFormat = d3.time.format("%m/%d/%Y");
var filename = "https://html5-cosmocracy.c9.io/SpecimenStats10000.csv";
d3.csv(filename, function(error, data) {
            if (error) {
                var msg = "Could not read " + filename;
                console.log(msg);
                alert(msg);
                return;
            }

            // CSV data pre-processing (e.g., type conversion, attribute extraction)
            var dateFormat = d3.time.format("%Y-%m-%d");
            data.forEach(function(d) {
                d.collectionDate = dateFormat.parse(d.collectionDate);
                d.collectionMonth = d3.time.month(d.collectionDate); // pre-calculate month for better performance
                d.SpecimenCount = +d.SpecimenCount;
            });

            var ndx = crossfilter(data);
            var all = ndx.groupAll();

            var collectionYearDimension = ndx.dimension(function(d) {
                return d3.time.year(d.collectionDate).getFullYear();
            });
            var collectionYearGroup = collectionYearDimension.group();

            var collectionYearBucketedDimension = ndx.dimension(function(d) {
                var year = d3.time.year(d.collectionDate).getFullYear();
                return (year < 2005) ? "Before 2005" : year;
            });
            var collectionYearBucketedGroup = collectionYearBucketedDimension.group();

            var collectionYearPerformanceGroup = collectionYearDimension.group().reduce(
                /* callback for when data is added to the current filter results */
                function(p, v) {
                    p.count += v.SpecimenCount;
                    return p;
                },
                /* callback for when data is removed from the current filter results */
                function(p, v) {
                    p.count -= v.SpecimenCount;
                    return p;
                },
                /* initialize p */
                function() {
                    return {
                        count: 0
                    };
                }
            );

            var collectionDateDimension = ndx.dimension(function(d) {
                return d.collectionDate;
            });

            var collectionMonths = ndx.dimension(function(d) {
                return d.collectionMonth;
            });

            // group by total movement within month
            var collectionMonthsGroup = collectionMonths.group().reduceSum(function(d) {
                return d.SpecimenCount; // ???
            });

            // group by total volume within move, and scale down result


            var specimensByMonthGroup = collectionMonths.group().reduceSum(function(d) {
                return d.SpecimenCount; // / 500000;
            });

            var specimenBiophysicalType = ndx.dimension(function(d) {
                return d.specimenBiophysicalType;
            });
            var specimenBiophysicalTypeGroup = specimenBiophysicalType.group();

            var diseaseStatus = ndx.dimension(function(d) {
                return d.diseaseStatus;
            });
            var diseaseStatuseGroup = diseaseStatus.group();
            
            var pathologicalStatus = ndx.dimension(function(d) {
                return d.pathologicalStatus;
            });
            var pathologicalStatusGroup = pathologicalStatus.group();

            var specimenBiophysicalType = ndx.dimension(function(d) {
                return d.specimenBiophysicalType;
            });
            var specimenBiophysicalTypeGroup = specimenBiophysicalType.group();

            var collectionYearChart = dc.rowChart('#collection-year');
            collectionYearChart
                .width(300)
                .height(300)
                .margins({
                    top: 20,
                    left: 10,
                    right: 10,
                    bottom: 20
                })
                .group(collectionYearBucketedGroup)
                .dimension(collectionYearBucketedDimension)
                /*
                .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                .label(function (d) {
                    return d.key.split('.')[1];
                })
                .title(function (d) {
                    return d.value;
                })
                */
                .elasticX(true)
                .xAxis().ticks(4);

            var diseaseStatusChart = dc.pieChart('#disease-status');
            diseaseStatusChart
                .dimension(diseaseStatus)
                .group(diseaseStatuseGroup)
                .width(300) // (optional) define chart width, :default = 200
                .height(300) // (optional) define chart height, :default = 200
                .radius(150)
                .innerRadius(20);
                
            var pathologicalStatusChart = dc.pieChart('#pathological-status');
            pathologicalStatusChart
                .dimension(pathologicalStatus)
                .group(pathologicalStatusGroup)
                .width(300) // (optional) define chart width, :default = 200
                .height(300) // (optional) define chart height, :default = 200
                .radius(150)
                .innerRadius(20);

            var specimenBiophysicalTypeChart = dc.pieChart('#specimen-biophysical-type');
            specimenBiophysicalTypeChart
                .dimension(specimenBiophysicalType)
                .group(specimenBiophysicalTypeGroup)
                .width(300) // (optional) define chart width, :default = 200
                .height(300) // (optional) define chart height, :default = 200
                .radius(150)
                .innerRadius(20);

            dc.dataCount('.dc-data-count')
                .dimension(ndx)
                .group(all);





            var specimenStatsGrid = dc.dataTable('#specimen-stats-grid');
            specimenStatsGrid
                .width(960).height(800)
                .dimension(collectionDateDimension)
                .group(function(d) {
                    return "Specimen Stats..."
                })
                /*
                        .group(function (d) {
                            var format = d3.format('02d');
                            return d.collectionDate.getFullYear() + '/' + format((d.collectionDate.getMonth() + 1));
                        })
                */
                .size(20) // (optional) max number of records to be shown, :default = 25
                .columns([
                    function(d) { return displayDateFormat(d.collectionDate); },
                    function(d) { return d.specimenBiophysicalType; },
                    function(d) { return d.preservationType; },
                    function(d) { return d.fmaAnatomicSourceLocation; },
                    function(d) { return d.pathologicalStatus; },
                    function(d) { return d.diseaseStatus; },
                    function(d) { return d.collectionInstitution; },
                    function(d) { return d.SpecimenCount; }
                ])
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
                    .sortBy(function(d) {
                        return d.collectionDate;
                    });

                    var monthlySpecimenCollectionChart = dc.barChart('#monthly-specimen-collection-chart');
                    monthlySpecimenCollectionChart
                    .width(990)
                    .height(300)
                    .margins({
                        top: 0,
                        right: 50,
                        bottom: 20,
                        left: 40
                    })
                    .dimension(collectionMonths)
                    .group(specimensByMonthGroup)
                    .centerBar(true)
                    .gap(1)
                    .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2015, 11, 31)]))
                    .round(d3.time.month.round)
                    // .alwaysUseRounding(true)
                    .xUnits(d3.time.months);


                    // render all charts
                    $(document).ready(function() {
                        dc.filterAll();
                        dc.renderAll();
                    });
                });
