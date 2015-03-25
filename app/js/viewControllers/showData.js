
function getChambers(){
    CHAMBERS = [];
    $('#selectChoiceChamber').empty();
    db.transaction(function (tx) {
        tx.executeSql('SELECT chamber FROM gas GROUP BY chamber;', []
            , function(tx, results){
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    CHAMBERS.push(results.rows.item(i).chamber);
                    $('#selectChoiceChamber').append('<option value="'+results.rows.item(i).chamber+'">'+results.rows.item(i).chamber+'</option>');
                }
                $('#selectChoiceChamber').trigger("create");
                clearChambers();
                $.mobile.loading('hide');
            }
            , function (tx, error) {
                showMessage(error.message);
            }, function () {
                showMessage('m');
            });
    });
}
function clearChambers(){
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS chambers', [], function () {
            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS chambers (chamber TEXT)', [], function () {
                    insertChambers();
                }, function (tx, error) {
                    showMessage(error.message);
                });
            });
        });
    });
}

function insertChambers(){
    db.transaction(function (tx) {
        console.log(CHAMBERS.length)
        for (var i = 0; i < CHAMBERS.length; i++) {
            tx.executeSql('INSERT INTO chambers (chamber) VALUES ("' + CHAMBERS[i] + '")', [],
                null
                , function (tx, error) {
                    showMessage(error.message);
                });
            console.log(CHAMBERS[i]);
        }
        $.mobile.loading('hide');
    });

}
function saveChambers() {
    CHAMBERS = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT chamber FROM chambers GROUP BY chamber;', []
            , function (tx, results) {
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    CHAMBERS.push(results.rows.item(i).chamber);
                }
            });
    });
}
function getTypes(){
    TYPES = [];
    $('#selectChoiceType').empty();
    db.transaction(function (tx) {
        tx.executeSql('SELECT type FROM gas GROUP BY type;', []
            , function(tx, results){
                var len = results.rows.length, i;

                for (i = 0; i < len; i++) {
                    TYPES.push(results.rows.item(i).type);
                    $('#selectChoiceType').append('<option value="'+results.rows.item(i).type+'">'+results.rows.item(i).type+'</option>');
                }
                $('#selectChoiceType').trigger("create");
                clearTypes();
                $.mobile.loading('hide');
            }
            , function (tx, error) {
                showMessage(error.message);
            }, function () {
                showMessage('m');
            });
    });
}
function clearTypes(){
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS types', [], function () {
            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS types (type TEXT)', [], function () {
                    insertTypes();
                }, function (tx, error) {
                    showMessage(error.message);
                });
            });
        });
    });
}
function insertTypes(){
    db.transaction(function (tx) {
        console.log(TYPES.length)
        for (var i = 0; i < TYPES.length; i++) {
            tx.executeSql('INSERT INTO types (type) VALUES ("' + TYPES[i] + '")', [],
                null
                , function (tx, error) {
                    showMessage(error.message);
                });
            console.log(TYPES[i]);
        }
        $.mobile.loading('hide');
    });
}
function savetypes() {
    TYPES = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT type FROM types GROUP BY type;', []
            , function (tx, results) {
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    TYPES.push(results.rows.item(i).type);
                }
            });
    });
}
function getEProcess() {
    dropTable('dataChart', function () {
        var chamber = $('#selectChoiceChamber').find(":selected").text();
        var type = $('#selectChoiceType').find(":selected").text();
        var dFrom = $('#preProcessFrom').val();
        dFrom = dFrom + " 00:00:00";
        var dTo = $('#preProcessTo').val();
        dTo = dTo + " 23:59:59";
        var typeValue = '';
        if (type == 'co2') {
            typeValue = 'ppm';
        } else if(type == 'ch4') {
            typeValue = '%';
        }
        var query = 'CREATE TABLE IF NOT EXISTS dataChart AS SELECT date, value FROM gas where chamber="' + chamber + '" and type="' + type + '" AND ( date BETWEEN "' + dFrom + '" and "' + dTo + '")';
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS dataChart', [], function () {
                    db.transaction(function (tx) {
                        tx.executeSql(query, []
                            , function (tx, results) {
                                console.log(query)
                                db.transaction(function (tx) {
                                    getChartData(type, typeValue, tx, chamber);
                                })
                            }
                            , function (tx, error) {
                                showMessage(error.message);
                            }, function () {
                                showMessage('m');
                            });
                    });
                },
                function (tx, error) {
                    showMessage(error.message);
                });
        });
    });
}
function getChartData(type, typeValue, tx, chamber){
    var query = 'SELECT date, value FROM dataChart order by date LIMIT 20000';
    //console.log(query);
    tx.executeSql(query, [], function (tx, results) {
            var len = results.rows.length, i;
            var resultSet = [];
            for (i = 0; i < len; i++) {
                resultSet.push([moment.utc(results.rows.item(i).date, "YYYY-M-D HH:mm:ss").valueOf(), results.rows.item(i).value]);
            }
            generateChart(type, typeValue, resultSet, chamber);
        }, function (tx, error) {
            showMessage(error.message);
        }
    )
}
function generateChart(type, typeValue, datachartContent, chamber){
    //$(function () {
    $('#preProcessChart').highcharts({
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Data From: ' + chamber
        },
        subtitle: {
            text: type
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%b'
            },
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: 'value'
            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            //pointFormat: '{point.x:%e. %b}: {point.y:.2f} '+typeValue,
            formatter: function() {
                return  '<b>' + this.series.name +'</b><br/>' +
                    Highcharts.dateFormat('%e - %b %H:%M',
                        new Date(this.x))
                    + ' date, <br/>' + this.y + ' ' +typeValue;
            }
        },
        series: [{
            name: type,
            data: datachartContent
        }]
    });
    $.mobile.loading('hide');
    //});
}