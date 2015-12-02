$(function() {
    $( "body>[data-role='panel']" ).panel();
});
/*
 $.mobile.autoInitializePage = false;
 $.mobile.initializePage();
*/
var CHAMBERS = [];
var TYPES = [];
var SPINNERBLACK = '<div class="spinner smallHeight"><div class="bounce1 spinner-black"></div><div class="bounce2 spinner-black"></div><div class="bounce3 spinner-black"></div></div>';
var SPINNERWHITE = '<div class="spinner smallHeight"><div class="bounce1 spinner-white"></div><div class="bounce2 spinner-white"></div><div class="bounce3 spinner-white"></div></div>';
$(document).on('ready', function(event, data) {
    chooseFile('#loadFile');
    createDB();
    addEvents();
    saveChambers();
    savetypes();
    stylers();
});
$(document).on('pagebeforeshow', '[data-role="page"]', function( event ) {
    showMessage('Loading<br/>'+SPINNERWHITE);
});
$(document).on('pagechange', '[data-role="page"]', function( event ) {
    showMessage('Loading<br/>'+SPINNERWHITE);
});
$(document).on('pageshow', '[data-role="page"]', function( event ) {
    $.mobile.loading('hide');
    $('.loadingMessage').remove();
});
$(document).on('pagebeforeshow', '[data-url="page3"]', function( event ) {
    if(CHAMBERS.length > 0){
        $('#selectChoiceChamber').empty();
        for (i = 0; i < CHAMBERS.length; i++) {
            $('#selectChoiceChamber').append('<option value="'+CHAMBERS[i]+'">'+CHAMBERS[i]+'</option>');
        }
        $('#selectChoiceChamber').selectmenu('refresh', true);
    }
    if(TYPES.length > 0){
        $('#selectChoiceType').empty();
        for (i = 0; i < TYPES.length; i++) {
            $('#selectChoiceType').append('<option value="'+TYPES[i]+'">'+TYPES[i]+'</option>');
        }
        $('#selectChoiceType').selectmenu('refresh', true);
    }
});
$(document).on('pagebeforeshow', '[data-url="page4"]', function( event ) {
    if(CHAMBERS.length > 0){
        $('#chamberSlopes').empty();
        for (i = 0; i < CHAMBERS.length; i++) {
            $('#chamberSlopes').append('<option value="'+CHAMBERS[i]+'">'+CHAMBERS[i]+'</option>');
        }
        $('#chamberSlopes').selectmenu('refresh', true);
    }
    if(TYPES.length > 0){
        $('#typeOfData').empty();
        for (i = 0; i < TYPES.length; i++) {
            $('#typeOfData').append('<option value="'+TYPES[i]+'">'+TYPES[i]+'</option>');
        }
        $('#typeOfData').selectmenu('refresh', true);
    }
});

var showMessage = function(msg){
    $("<div class='loadingMessage ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h3>"+msg+"</h3></div>")
        .css({ display: "block",
            opacity: 1,
            position: "fixed",
            padding: "7px",
            "text-align": "center",
            width: "270px",
            left: ($(window).width() - 284)/2,
            top: $(window).height()/2 })
        .appendTo( $.mobile.pageContainer ).delay( 1500 );
        /*
        .fadeOut( 400, function(){
            $(this).remove();
            //$('#loadingMessage').remove();
        });
        */
}

function stylers(){
    $('.minutes-input').parent().css('width','30%');
}

function setTrimDataButton(){
    var duration = localStorage.getItem('trim.duration');
    var hours = localStorage.getItem('trim.hours');

    if(!duration){
        duration = localStorage.getItem('trim.duration');
        localStorage.setItem('trim.duration', duration);
    }else{
        duration = settings.trim.duration;
    }
    var hourSelection;
    if(!hours){
        hourSelection = settings.trim.hours;
    }else{
        hours = localStorage.getItem('trim.hours');
        hourSelection = hours.split(',');
    }
    //console.log(duration);
    //console.log(hourSelection);

    $('#trimDuration').val(duration);
    for(var i = 0; i < 8; i++) {
        $('#trimDataArray'+i).val(hourSelection[i]);
    }
}

function trimDataSave(){
    //localstorage
    var hours = [];
    for(var i = 0; i < 8; i++) {
        hours.push($('#trimDataArray'+i).val());
    }
    localStorage.setItem('trim.hours', hours);
    var duration = $('#trimDuration').val();
    localStorage.setItem('trim.duration', duration);
}
