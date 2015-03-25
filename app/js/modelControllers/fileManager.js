function readFile(filePath){
    $('#tableList').empty();
    var stream =  fs.createReadStream(filePath, { flags: 'r', encoding: null, fd: null, mode: 0666, bufferSize: 64 * 1024});
    //var a = new lazy(stream);
    PROCESSCOUNT = 0;
    //parseAStream(a);
}
function lineReader(filePath){
    var rl = readline.createInterface({
        input : fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false
    });
    rl.on('line',function(line){
        var values = CSVtoArray(line.toString());
        if (isDefined(values) && values != null) {
            if(values.length > 0){
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
var PROCESSCOUNT = 0;
//var fileWorker = new Worker("fileWorker.js");
//fileWorker.postMessage()
function parseAStream(a){
    //$('#processingFile').html("Processing...");
    a.lines.forEach(function (line) {
        var values = CSVtoArray(line.toString());
        if (isDefined(values) && values != null) {
            if(values.length > 0){
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
    //$('#processingFile').html("Finished Processing");
}
var buildFile = function(name, csvContent, element) {
    console.log(name);
    fs.writeFile(name, csvContent, function(error) {
        if(error) {
            $('#downloadTo').empty().append(error.message);
            showMessage(error.message);
        }else{
            //If Windows machine convert backslash
            if(/^win/.test(process.platform)){
                //If network file add  file protocol
                if(/^\\/.test(name)){
                    name = 'file:///'+name;
                }
                name = name.replace(/\\/g,"/");
            }
            $('#'+element).empty().append("Saved to: <a onclick=javascript:showitem('"+name+"') title='show' style='cursor:pointer'>"+name+"</>");
            $.mobile.loading('hide');
        }
    });
}
function backup(element, path, table, dFrom, dTo) {
    $('.loadingMessage').remove();
    console.log('path', path, typeof path, !path )
    if(path == '' || !isDefined(path) || !path){
        showMessage("Please choose file location");
    }else {
        db.transaction(function (tx) {
            var query2 = '';
            if (isDefined(dFrom) && isDefined(dTo)) {
                query2 = ' WHERE date BETWEEN "' + dFrom + '" and "' + dTo + '"';
            }
            var query = 'SELECT * FROM "' + table + '" ' + query2;
            console.log(query)
            tx.executeSql(query, [], function (tx, results) {
                var len = results.rows.length, i;
                var csvContent = '';
                for (i = 0; i < len; i++) {
                    var row = results.rows.item(i);
                    var rowCount = Object.keys(row).length;
                    for(var column in row){
                        if(row.hasOwnProperty(column)) {
                            rowCount--;
                            csvContent += row[column];
                            if(rowCount>0){
                                csvContent += ', ';
                            }else{
                                csvContent += '\n';
                            }
                        }
                    }
                    //csvContent += results.rows.item(i).chamber + ', ' + results.rows.item(i).type + ', ' + results.rows.item(i).date + ', ' + results.rows.item(i).value + '\n';
                }
                //var encodedUri = 'data:application/csv;charset=utf-8,' + encodeURI(csvContent);
                buildFile(path, csvContent, element);
            }, function (tx, error) {
                showMessage(error.message);
            });
        });
    }
}
function chooseFile(name) {
    var chooser = $(name);
    chooser.change(function(evt) {
        //console.log($(this).val());
    });
}
function exportFile(){
    var table = 'gas';
    var dFrom = $('#exportFrom').val();
    var dFrom1 = dFrom + " 00:00:00";
    var dTo = $('#exportTo').val();
    var dTo1 = dTo + " 23:59:59";
    var filePath = $('#fileDownload').val();
    console.log(dFrom, dTo, filePath);
    if((dFrom != '' && dTo != '') && (filePath != '' || !isDefined(filePath))) {
        $('#downloadTo').empty().append(SPINNERBLACK+'Working...');
        backup('downloadTo',filePath, table, dFrom1, dTo1);
    }else{
        showMessage("Please fill all inputs");
    }
}

function showitem(filePath){
    nw.Shell.openItem(filePath);
}
