function collectTimestamps(type, tFrom, tTo) {
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS process1', [], function () {
            db.transaction(function (tx) {
                var query = 'CREATE TABLE IF NOT EXISTS process1 AS ';
                query += 'SELECT rowid, chamber, date, value FROM gas where type="'+type+'" AND ( strftime("%M:%S", date) BETWEEN "'+tFrom+':00" and "'+tTo+':59") order by chamber';
                console.log(query)
                tx.executeSql(query, []
                    , function (tx, results) {
                        showTimestamps();
                    }
                )
            });
        });
    });
}
function showTimestamps(limit){
    if(!limit){limit=10000}
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM process1', [], function (tx, results) {
            var len = results.rows.length, i;
            $('#parsedTimestamps').empty();
            $('#parsedTimestamps').append('<tr><th>Id</th><th data-priority="persist">Chamber</th><th>Date</th><th>Value</th></tr>');
            for (i = 0; i < len; i++) {
                $('#parsedTimestamps').append('<tr><td>'+results.rows.item(i).rowid+'</td><td>'+results.rows.item(i).chamber+'</td><td>'+results.rows.item(i).date+'</td><td>'+results.rows.item(i).value+'</td></tr>');
            }
            $('#parsedTimestamps').trigger("create");
            $.mobile.loading('hide');
        }, function (tx, error) {
            showMessage(error.message);
        });
    });
}
function createSlopes(chamber, type){
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS process2', [], function () {
                db.transaction(function (tx) {
                var query = 'CREATE TABLE IF NOT EXISTS process2 AS ';
                query += 'SELECT ("'+ chamber +'" || "_" || strftime("%Y-%m-%d-%H", p0.date)) as id, strftime("%Y-%m-%d at %H", p0.date) as date, group_concat(strftime("%Y-%m-%d %H:%M:%S", p0.date)) as juldate, group_concat(p0.value) as arrayVals FROM process1 as p0 WHERE p0.chamber="' + chamber + '" group by strftime("%YYYY%m%d %H", p0.date) order by p0.date';
                tx.executeSql(query, []
                    , function (tx, results) {
                        getSlopes(chamber, type);
                    }, function (tx, error) {
                        showMessage(error.message);
                    });
            });
        });
    });
}
function getSlopes(chamber, type){
    $('#processSlopes').empty();
    $('#processSlopes').append('<tr><th>Min</th><th>Max</th><th data-priority="persist">Date</th><th>Slope</th><th>r-squared</th><th>&nbsp;</th></tr>');
    createProcess3(function(){
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM process2', [], function (tx, results) {
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    var juldates = CSVtoArray(results.rows.item(i).juldate);
                    var values = CSVtoArray(results.rows.item(i).arrayVals);
                    if ((isDefined(values) && values != null) && (isDefined(juldates) && juldates != null)){
                        calculateSlope(results.rows.item(i).id, results.rows.item(i).date, juldates, values, type, chamber);
                    }
                }

                $.mobile.loading('hide');
            });
        });
    });
}
function getSlopeId(id, type, chamber){
    $.mobile.loading('show');
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM process2 WHERE id = "'+id+'"', [], function (tx, results) {
            var len = results.rows.length, i, a=[];
            for (i = 0; i < len; i++) {
                var juldates = CSVtoArray(results.rows.item(i).juldate);
                var values = CSVtoArray(results.rows.item(i).arrayVals);
                if ((isDefined(values) && values != null) && (isDefined(juldates) && juldates != null)){
                    for (i = 0; i < juldates.length; i++) {
                        var val = parseFloat(values[i]);
                        var date = moment.utc(juldates[i], "YYYY-M-D HH:mm:ss").valueOf();
                        a.push([date, val]);
                    }
                    //var regr = regression('linear', a);
                    generateProcessChart1(type, chamber, a)
                }
            }
        }, function (tx, error) {
            showMessage(error.message);
        });
    });
}
function createProcess3(cb){
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS process3', [], function () {
            db.transaction(function (tx) {
                var query = 'CREATE TABLE IF NOT EXISTS process3 (date TEXT, chamber TEXT, type TEXT, slope NUMERIC, rr NUMERIC, min NUMERIC, max NUMERIC); ';
                tx.executeSql(query, []
                    , function (tx, results) {
                        cb();
                    }
                );
            });
        });
    });
}
function insertRowProcess3(result){
    db.transaction(function (tx) {
        var query = 'INSERT INTO process3 (date, chamber, type, slope, rr, min, max) VALUES ' +
            '("' + result.date + '","' + result.chamber + '","' + result.type + '",' + result.slope + ',' + result.rr + ',' + result.min + ',' + result.max+ ')';
        tx.executeSql(query,[], null);
    });
}
function calculateSlope(id, date, juldates, values, type, chamber) {
    var a = [], result = {date:date,avg:0,slope:null};
    for (i = 0; i < juldates.length; i++) {
        var val = parseFloat(values[i]);
        //var date = moment.utc(juldates[i], "YYYY-M-D HH:mm:ss").valueOf();
        a.push(new Array(i, val));
    }
    console.log(a);
    var regr = regression('linear', a);
    result.slope = regr.equation[0].toFixed(2);
    if(isNaN(result.slope) || !isFinite(result.slope)){
        result.slope = 0;
    }
    result.min = Math.min.apply(Math, values);
    result.max = Math.max.apply(Math, values);
    result.correlation = regr.equation[2].toFixed(4);
    result.rr = Math.pow(result.correlation, 2).toFixed(2);
    result.id = id;
    result.date = date;
    result.chamber = chamber;
    result.type = type;
    if(isNaN(result.rsquare) || !isFinite(result.rsquare)){
        result.rsquare = 0;
    }
    //console.log(regr);
    var text = "'"+id+"','"+type+"','"+chamber+"'";
    $('#processSlopes').append('<tr><td>'+result.min+'</td><td>'+result.max+'</td><td>'+result.date+'</td><td>'+result.slope+'</td><td>'+result.rr+'</td><td><a href="javascript:getSlopeId('+text+')">show</a></button></td></tr>');
    insertRowProcess3(result);
}
function generateProcessChart1(type, chamber, dataPoints){
    $( "#processPopup1" ).popup( "open");
    $('#processChart1').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title:{
            text: chamber
        },
        subtitle: {
            text: type
        },
        xAxis: {
            title: {
                enabled: true,
                text: type
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            type:'datetime'
        },
        yAxis: {
            title: {
                text: 'value'
            }
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(110,110,110)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.y} '
                }
            }
        },
        series: [{
                regression: true ,
                regressionSettings: {
                    type: 'linear',
                    color:  'rgba(223, 83, 83, .9)'
                },
                type:'scatter',
                name: type,
                color: 'rgba(223, 83, 83, .5)',
                data: dataPoints,
                tooltip:{
                    valueDecimals:4
                },
                marker: {
                    radius: 4
                }
            }
        ]
    });
    $.mobile.loading('hide');
}
