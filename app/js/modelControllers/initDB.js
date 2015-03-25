function createDB() {
// Create table and insert one line
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS gas( " +
            " unit INTEGER," +
            " chamber TEXT," +
            " type TEXT," +
            " date DATETIME," +
            " raw INTEGER," +
            " value NUMERIC)");
    });
}
function insertRowDB(values){
    db.transaction(function (tx) {
        tx.executeSql('INSERT INTO gas (unit, chamber, type, date, raw, value) VALUES (' + values[0] + ',"' + values[1] + '","' + values[2] + '","' + values[3] + '",' + values[4] + ',' + values[5] + ')',
            function(tx, error){
                showMessage(error);
            });
    });
}
function queryDB(limit) {
// Query out the data
    if(!limit){limit=100}
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM gas LIMIT '+limit, [], function (tx, results) {
            printResults(results)
        }, function (tx, error) {
            showMessage(error);
        });
    });
}
function executeQuery(query, limit){
    if(!limit){limit=10000}
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM gas '+ query +' LIMIT '+limit, [], function (tx, results) {
            printResults(results)
        }, function (tx, error) {
            showMessage(error.message);
        });
    });
}
function clearDB(){
    db.transaction(function (tx) {
        PROCESSCOUNT = 0;
        $('#processingFile').html(PROCESSCOUNT);
        tx.executeSql('DELETE FROM gas', []
            , null
            , function (tx, error) {
                showMessage(error.message);
            }, function () {
                showMessage('m');
            });
    });
}
function getRowCount(){
    db.transaction(function (tx) {
        tx.executeSql('SELECT count(*) as rowCount FROM gas', []
            , function(tx, results){
                var len = results.rows.length, i;
                var resultSet = 0;
                for (i = 0; i < len; i++) {
                    resultSet = results.rows.item(i).rowCount;
                }
                $('#rowCount').empty().append(resultSet + ' lines');
                $.mobile.loading('hide');
            }
            , function (tx, error) {
                showMessage(error.message);
            }, function () {
                showMessage('m');
            });
    });
}
function dropTable(tableName, cb){
    var query = 'DROP TABLE IF EXISTS '+ tableName;
    db.transaction(function (tx) {
        tx.executeSql(query, []
            , function(tx, results){
                cb()
            }
            , function (tx, error) {
                showMessage(error.message);
            })
    });
}