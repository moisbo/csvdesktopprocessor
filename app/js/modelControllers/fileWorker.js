function parseAStream(db, a) {
    //$('#processingFile').html("Processing...");
    a.lines.forEach(function (line) {
        var values = CSVtoArray(line.toString());
        if (isDefined(values) && values != null) {
            if (values.length > 0) {
                db.transaction(function (tx) {
                    $('#processingFile').html(PROCESSCOUNT++);
                    var query = 'INSERT INTO gas (unit, chamber, type, date, raw, value) VALUES (' + values[0] + ',"' + values[1] + '","' + values[2] + '","' + values[3] + '",' + values[4] + ',' + values[5] + ')';
                    tx.executeSql(query, [],
                        null,
                        function (tx, error) {
                            //showMessage(error.message);
                        }
                    );
                });
            }
        }
    });
}