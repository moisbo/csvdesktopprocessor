var nw = require('nw.gui');
var win = nw.Window.get();
var db = openDatabase('temp.db', '1.0', 'temp database', 2 * 1024 * 1024);
var fs = require("fs");
var lazy = require('lazy');
var moment = require('moment');
var findpath = require('nodewebkit').findpath;
var nwpath = findpath();
var readline = require('readline');

function addEvents() {
    $('#openDevTools').on('click', function(event){
        nw.Window.get().showDevTools();
    });
    $('#exportFileTo').on('click', function(event){
        exportFile();
    });
    $('#loadFile').on('change', function (event) {
        lineReader($(this).val());
    });
    $('#limitOnClick').on('click', function (event) {
        queryDB(parseInt($('#limit').val()));
    });
    $('#fullQueryButton').on('click', function (event) {
        executeQuery($('#fullQuery').val());
    });
    $('#clearDB').on('click', function(event){
        clearDB();
    });
    $('#getRowCount').on('click', function(event){
        $.mobile.loading('show');
        getRowCount();
    });
    $('#selectChamber').on('click', function(event){
        $.mobile.loading('show');
        getChambers();
    });
    $('#selectType').on('click', function(event){
        $.mobile.loading('show');
        getTypes();
    });
    $('#preProcessChartButton').on('click', function(event){
        $.mobile.loading('show');
        getEProcess();
    });
    $('#collectTimestamps').on('click', function(event){
        $.mobile.loading('show');
        collectTimestamps($('#typeOfData').val(), pad(parseInt($('#collectFrom').val()), 2), pad(parseInt($('#collectTo').val()), 2));
    });
    $('#exportTimestamps').on('click', function(event){
        $.mobile.loading('show');
        $('.loadingMessage').remove();
        backup('exportTimestampsDownload', $('#exportTimestampsInput').val(), 'process1');
    });
    $('#getSlopes').on('click', function(event){
        $.mobile.loading('show');
        createSlopes($('#chamberSlopes').val(), $('#typeOfData').val());
    });
    $('#exportSlopes').on('click', function(event){
        $.mobile.loading('show');
        $('.loadingMessage').remove();
        backup('exportSlopesDownload', $('#exportSlopesInput').val(), 'process3');
    });
    $('#trimDataSave').on('click', function(event){
        trimDataSave();
    });
    $('#trimData').on('click', function(event){
        $.mobile.loading('show');
        trimData($('#typeOfData').val(),
            localStorage.getItem('trim.hours').split(','),
            localStorage.getItem('trim.duration'));
    });
}

var settings = {
    trim: {
        hours: ['01', '04', '07', '10', '13', '16', '19', '22'],
        size: 8,
        duration: '07'
    }
};

$(document).ready(function(){
    setTrimDataButton();
});