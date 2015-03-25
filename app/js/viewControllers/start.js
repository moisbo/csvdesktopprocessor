function printResults(results){
    var len = results.rows.length, i;
    $('#tableList').empty();
    $('#tableList').append('<tr><th>#</th><th>Unit Id</th><th>Chamber</th><th>type</th><th>Date</th><th>Raw</th><th>Value</th></tr>');
    for (i = 0; i < len; i++) {
        //console.log(results.rows.item(i));
        $('#tableList').append('<tr><td>'+(i+1)+'</td><td>'+results.rows.item(i).unit+'</td><td>'+results.rows.item(i).chamber+'</td><td>'+results.rows.item(i).type+'</td><td>'+results.rows.item(i).date+'</td><td>'+results.rows.item(i).raw+'</td><td>'+results.rows.item(i).value+'</td></tr>');
        //$('#tableList').append('<li>'+(i+1)+': '+results.rows.item(i).unit+', '+results.rows.item(i).chamber+','+results.rows.item(i).type+','+results.rows.item(i).date+','+results.rows.item(i).raw+','+results.rows.item(i).value+'</li>');
    }
    $('#tableList').trigger("create");
}