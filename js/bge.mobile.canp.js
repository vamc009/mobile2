// Timeout defined for canp ajax activity
var CanpAjaxTO = 60000;
var CanpCommEMsg = 'Data not available at this time. Please try again later'; // communication or msg.d error
var CanpGenEMsg = 'Error detected. Please contact your BGE service representative.'; // generic server error
var globalEMsg = ''; //to store the global error message
var summaryWaitCount = 0;
var outageWaitCount = 0;
var ReportOutageWaitCount = 0;
var CurrentAccountSummary;
var CANPMessages;
var NotifClosed = false;
var OutageData;

//globalVariables for ajax calls
var OutageData;
var OpowerData;
var SERData;
var ProgramsData;
var NotificationsData;
var debugMode = true;

$(document).on('pagebeforeshow', 'div[data-role=page]', function (event) {

    try {
        var currentPageId = $(event.target).attr('id');
        if ($(event.target).attr('authpage') && currentPageId != 'bge-signin' && $(event.target).attr('id') != 'bge-index' && $('.ui-page-active').attr('id') != 'bge-index' && $('.ui-page-active').attr('id') != 'bge-index' && $('.ui-page-active').attr('id') != 'bge-signin') {
            //validateSession();
            if (sessionExpired()) {
                $.mobile.changePage('signin.html', { transition: "slide" });
                return;
            }

        }


        viewModel.getFromLocal();

        if (currentPageId == 'billing-page' || currentPageId == 'billing-accounts-page' || currentPageId == 'billing-sch-page' || currentPageId == 'billing-automated-page' || currentPageId == 'billing-editautomated-page') {
            viewModel.initAccounts();
        }

        if (currentPageId == 'billing-sch-page' || currentPageId == 'billing-editsch-page') {
            var CDate = new Date();
            CDate = CDate.getMonth() + 1 + "/" + CDate.getDate() + "/" + CDate.getFullYear();
            if (new Date(viewModel.accountSummary.DueDate) >= new Date(CDate)) {
                $('#liduecheck').show();
                $('#duedate').prop("checked", true);
                //viewModel.selectedPayment().dateType('dueDate');
            } else {
                $('#liduecheck').hide();
                $('#duedate').prop("checked", false);
                $('#payDateType').prop("checked", true);
                viewModel.selectedPayment().dateType('specifiedDate');
            }
            viewModel.saveToLocal();
            $("input[type='radio']").checkboxradio("refresh");
        }


        if (jQuery.isEmptyObject(CANPMessages))
            GetMessages();
        $('.notifications').bind('click', function () {
            $('.notification-message').fadeIn(300);
        });
        $('.notification-message .close-icon-sm').on('click', function () {
            $('.notification-message').fadeOut(300);
        });

        $('.modal-go').on('click', function () {
            $('#overlay2, .redirect-window').fadeIn(300);
        });
        $('.cancel-redirect').on('click', function () {
            $('#overlay2, .redirect-window').fadeOut(300);
        });

        if (!$.isEmptyObject(viewModel.accountSummary)) {
            $('.myaccount').show();
            $('.lisignout').show();
        } else {
            $('.lisignout').hide();
            $('.myaccount').hide();
            $('.notif-alert').hide();
            CurrentAccountSummary = null;
        }

        //setCookie('fullsite',true,1);
        if ($('.ui-page-active').attr('annonymous') == 'true')
            $('.myaccount').hide();

        if (currentYear != null && currentYear != "" && currentYear != "undefined")
            $('#currentyear').text(currentYear);
        if ($.isEmptyObject(viewModel.globalAlert())) {
            getAlertsMsgSP();
        }
        //Webtrends script//
        //			window.webtrendsAsyncInit = function(){
        //							    var dcs=new Webtrends.dcs().init({
        //							        dcsid:"dcs8esu3r7bv0h4fbiqv03si6_5e7x",
        //							        domain:"statse.webtrendslive.com",
        //							        timezone:-5
        //							        }).track();
        //							};
        //							(function(){
        //							    var s=document.createElement("script"); s.async=true; s.src="/'+ globalpath +'/Style Library/Bge Mobile/js/webtrends.lite.min.js";
        //							    var s2=document.getElementsByTagName("script")[0]; s2.parentNode.insertBefore(s,s2);
        //				}());

        //all the pagebeforeshow are triggered from here

        if ($.mobile.activePage.attr('id') == 'outages-page') {
            GetOutages();
            $(".serviceaddressclass").empty();
            if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
                $(".serviceaddressclass").append('<span><strong>Account Number: </strong><label id="lblaccountid"> ' + CurrentAccountSummary.AccountId + '</label></span></br>');

                if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length == 1 && CurrentAccountSummary.ServiceList[0].Address != "No Data") {
                    $('#uiPremiseSingle').text(CurrentAccountSummary.ServiceList[0].Address);
                    $(".serviceaddressclass").append('<span><label id="uiPremiseSingle" > ' + CurrentAccountSummary.ServiceList[0].Address + '</label></span>');
                } else if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length > 1) {
                    $(".serviceaddressclass").append('<div data-role="fieldcontain" style="display:inline"><span for=uiPremiseSelect>Address :</span><select data-native-menu="false" id="uiPremiseSelect" name="uiPremiseSelect"></select></div>');
                    var pselect = $('#uiPremiseSelect');
                    pselect.empty();
                    $.each(CurrentAccountSummary.ServiceList, function (idx) {
                        pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
                    });
                    $('#uiPremiseSelect option:first-child').attr('selected', 'selected');
                    $('#uiPremiseSelect').selectmenu();
                    $('#uiPremiseSelect').selectmenu('refresh');
                    $('.serviceaddressclass').trigger('create');
                    pselect.change(OnChangePremise);
                }

                //$(".serviceaddressclass").append('<div><ul class="bullet hbullet"><li><a  data-rel="popup" href="#"  onclick="javascript:OutagesClick();return false;" data-inline="true">Report a Power Outage </a></li></ul><ul class="bullet"><li><a  data-rel="popup" href="http://outagemap.bge.com/m.html" data-inline="true">View Outage Map </a></li></ul></div>');
                //$(".serviceaddressclass").append('<div><ul class="bullet hbullet"><li><a  data-rel="popup" href="#"  onclick="javascript:OutagesClick();return false;" data-inline="true">Report a Power Outage </a></li><li><a  data-rel="popup" href="http://outagemap.bge.com/m.html" data-inline="true">View Outage Map </a></li></ul></div>');
                //$(".serviceaddressclass").append('<div><ul class="bullet hbullet"><li><a  data-rel="popup" href="#"  onclick="javascript:OutagesClick();return false;" data-inline="true">Report a Power Outage </a></li></ul><ul class="bullet"><li><a  data-rel="popup" href="http://outagemap.bge.com/m.html" data-inline="true">View Outage Map </a></li></ul></div>');
                if (OutageData == null || OutageData.d.Status == 'Our records show that your power is on. If this is incorrect, please call 1-877-778-2222 to report a power outage.' || OutageData.d.Status == null)
                    $(".serviceaddressclass").append('<div><ul class="bullet hbullet"><li><a  data-rel="popup" href="#"  onclick="javascript:OutagesClick();return false;" data-inline="true">Report a Power Outage </a></li><li><a  data-rel="popup" href="http://outagemap.bge.com/m.html" data-inline="true">View Outage Map </a></li></ul></div>');
                else
                    $(".serviceaddressclass").append('<div><ul class="bullet hbullet"><li><a  data-rel="popup" href="http://outagemap.bge.com/m.html" data-inline="true">View Outage Map </a></li></ul></div>');

            }

        } //outage-page


        //Prasad  Outages,SEM,myprograms,viewbill,paybill
        // Opower Comparison functions --	
        if ($.mobile.activePage.attr('id') == 'myenergyusage-page') {

            var energyUsageFlag = false;
            if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
                if (CurrentAccountSummary.IsAMI == true && CurrentAccountSummary.IsAMI != null && CurrentAccountSummary.IsCommercial == false) {
                    $('#uiPnlMyEnergyUse').removeClass("hidden");
                    $('#uinonami').addClass("hidden");
                    $('#uiSEM').show();
                    energyUsageFlag = true;
                } else {
                    $('#uiSEM').hide();
                }
                var d = new Date();
                var n = d.getMonth();
                n = n + 1;
                if (CurrentAccountSummary.SERStartMonth != null && CurrentAccountSummary.SEREndMonth != null) {
                    if (CurrentAccountSummary.IsSER != null && CurrentAccountSummary.IsSER == "ENROLLED" && (n >= CurrentAccountSummary.SERStartMonth && n <= CurrentAccountSummary.SEREndMonth)) {
                        $('#uiPnlMyEnergyUse').removeClass("hidden");
                        $('#uinonami').addClass("hidden");
                        $('#uiSER').show();
                        energyUsageFlag = true;
                    } else {

                        $('#uiSER').hide();
                    }
                } else {
                    $('#uiSER').hide();
                }
            }
            if (energyUsageFlag) {
                $('#uiPnlMyEnergyUse').removeClass("hidden");
                $('#uinonami').addClass("hidden");
            } else {
                $('#uiPnlMyEnergyUse').addClass("hidden");
                $('#uinonami').removeClass("hidden");
            }

            $('#uiPnlMyEnergyUse2').listview('refresh');
        } //myenergyusage-page

        if ($.mobile.activePage.attr('id') == 'myprograms-page') {
            if (viewModel.accountSummary.ServiceList > 1) { }
            setGrayHeader();
            $('#uiPrograms').listview('refresh');
        } //myprograms-page
        if ($.mobile.activePage.attr('id') == 'sem-page') {
            GetOpowerComp();
            setGrayHeader();
        } //sem-page

        if ($.mobile.activePage.attr('id') == 'summaryofbill-page') {
            //$(".serviceaddressclass").empty();
            //$(".serviceaddressclass").append('<span>Account #: <strong><label id="lblaccountid" > '+ userEnteredAccount +'</label></span>');
            if (currentBalance != null) {
                $('#enteredAccount').text(userEnteredAccount);
                $('#currentAmountDue').text("$ " + currentBalance);
                $('#currentDueDate').text(currentDueDate);
            }
        } //summaryofbill-page

        if ($.mobile.activePage.attr('id') == 'ser-page') {
            showSERHistoricalData();
            setGrayHeader();
        } //ser-page

        if ($.mobile.activePage.attr('id') == 'notification-page') {
            $.mobile.showPageLoadingMsg();
            getPersonNotifications();
        } //notification-page

        if ($.mobile.activePage.attr('id') == 'notificationsummary-page') {
            notificationsummaryBefore();
        } //notificationsummary-page
        if ($.mobile.activePage.attr('id') == 'billing-page') {
            $('#uiBilling').listview('refresh');
        } //billing-page
        if ($.mobile.activePage.attr('id') == 'myprograms-page') {
            if (viewModel.canpPrograms().length == 0) {
                setGrayHeader();
                ShowLearMoreLink();
            }
        }

        if (currentPageId == 'billing-page' || currentPageId == 'my-account')
            ko.applyBindings(viewModel, document.getElementById(currentPageId));
        if ($.mobile.activePage.attr('id') == 'notification-confirm-page') {
            NotificationsData = null;
        }
    } catch (e) {
        if (e.name == 'QUOTA_EXCEEDED_ERR') {
            //alert("BGE mobile site doesn't support private browsing mode. Please try after disabling private browsing");
            window.location = 'privatebrowsing.html';
        }
        else if (debugMode)
            alert("name:" + e.name + "\nmessage:" + e.message);
    }

});

var navMap = {
    'myaccountp': '#navmyaccount',
    'myprofile': '#navprofile',
    'outages': '#navoutages',
    'mynotifications': '#navnotifications',
    'sem': '#navsem'
};

$(document).on('pageshow', 'div[data-role=page]', function (event) {
    var currentPageId = $(event.target).attr('id');
    if ($('.ui-page-active').attr('annonymous') == 'true')
        $('.myaccount').hide();
    if (currentPageId == 'billing-sch-page' || currentPageId == 'billing-editsch-page')
        $('#liduecheck').parent().listview("refresh");
    if (currentPageId == 'billing-activity-page')
        $('#paymentactivitylist').listview("refresh");

});


function viewFullSite() {
    setCookie('fullsite', true);
    window.location.replace('http://stg-www.bge.com/');
}

function pageTranslate(selectedPage) {

    if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
        if (selectedPage == 'myprograms')
        // $.mobile.changePage('/'+ globalpath +'/Pages/myprograms.html', { transition: "slide" });
            GetPrograms();
        else if (selectedPage == 'myprofile')
        //$.mobile.changePage('myprofile.html', { transition: "slide" });
            getUserProfile();
        else if (selectedPage == 'billing')
            validateCustomerAccount();
        // $.mobile.changePage('billing.html', { transition: "slide" });
        else if (selectedPage == 'myaccountp')
            $.mobile.changePage('myaccount.html', {
                transition: "slide"
            });
        else if (selectedPage == 'sem')
        //$.mobile.changePage('/'+ globalpath +'/Pages/sem.html', { transition: "slide" });
            GetOpowerComp();
        else if (selectedPage == 'outages')
        //$.mobile.changePage('/'+ globalpath +'/Pages/outages.html', { transition: "slide" });
            GetOutages();
        else if (selectedPage == 'ser')
            showSERHistoricalData();
        //$.mobile.changePage('/'+ globalpath +'/Pages/ser.html', { transition: "slide" });
        else if (selectedPage == 'mynotifications')
        //$.mobile.changePage('/'+ globalpath +'/Pages/notifications.html', { transition: "slide" });
            getPersonNotifications();
        else if (selectedPage == 'bgepaybill')
            $.mobile.changePage('billing.html', {
                transition: "slide"
            });
        else if (selectedPage == 'myenergyuse')
            $.mobile.changePage('myenergyusage.html', {
                transition: "slide"
            });
        else if (selectedPage == 'summarybill')
            $.mobile.changePage('summary-of-bill.html', {
                transition: "slide"
            });
        else if (selectedPage == 'home')
            $.mobile.changePage('index.html', {
                transition: "slide"
            });
        else if (selectedPage == 'makeapayment')
            $.mobile.changePage('makepayment.html', {
                transition: "slide"
            });
        else if (selectedPage == 'gap')
            $.mobile.changePage('gap.html', {
                transition: "slide"
            });
        else if (selectedPage == 'aboutus')
            $.mobile.changePage('locations-pnumbers.html', {
                transition: "slide"
            });

        //setNavBar(navMap[selectedPage]);
    } else if (selectedPage == 'home')
        $.mobile.changePage('index.html', {
            transition: "slide"
        });
    else if (selectedPage == 'makeapayment')
        $.mobile.changePage('makepayment.html', {
            transition: "slide"
        });
    else if (selectedPage == 'aboutus')
        $.mobile.changePage('locations-pnumbers.html', {
            transition: "slide"
        });
    else {
        $.mobile.changePage('signin.html', {
            transition: "slide"
        });
    }

    //setNavBar('#' + $('.ui-page-active').attr('id') + ' ' + navMap[selectedPage]);
    $(".bgepanel").panel("close");

}

/*PRASAD OUTAGES , SEM , OUTAGES , My Programs & VIEW BILL*/

var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
var noOfDaysBeforeArray = new Array("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15");
var currentusername;

//below function for testing purpose only
function username() {

    currentusername = $('#userid').val();
    //alert(currentusername);
}

//Page initiation

$(document).on('pagebeforeshow', '#includehf', function (event) {

    //$('.ui-footer').load('/'+ globalpath +'/footer.html');

});


//highlighing the Navigation Menu item depending on the page

function setNavBar(selectedNav) {
    $('#navmenulist li').removeClass('current');
    $(selectedNav).addClass('current');
    //$('#navoutages').addClass('current');
}

// Read Messages.xml file into local variable
function GetMessages() {
    /*if (jQuery.isEmptyObject(CANPMessages)) {*/
    $.ajax({
        type: "POST",
        async: false,
        url: "/_layouts/Bge.Canp/AnonymousService.asmx/GetMessages",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: SaveCANPMessages
    });
    /* }*/
}

function SaveCANPMessages(msg) {
    /* if (!jQuery.isEmptyObject(msg.d) && !jQuery.isEmptyObject(msg.d.messageData) && !jQuery.isEmptyObject(msg.d.messageData.Messagelist)) {*/
    //CANPMessages = msg.d.messageData.Messagelist;
    //GMessages = msg.d.messageData.Messagelist;
    viewModel.getFromLocal();

    viewModel.canpMessages(ko.mapping.fromJS(msg.d.messageData.Messagelist)());
    //viewModel.canpMessages(msg.d.messageData.Messagelist);
    viewModel.saveToLocal();
    CANPMessages = msg.d.messageData.Messagelist;

    /*  }*/
}

function findMessage(id) {
    if (!jQuery.isEmptyObject(CANPMessages)) {
        for (var message in CANPMessages) {
            if (CANPMessages[message].id === id) {
                return CANPMessages[message].content;
            }
        }
        return "We are currently experiencing technical issues. Please try again later";
    } else {
        return "We are currently experiencing technical issues. Please try again later";
    }
}

// HTML Resource Manager test
function TestHtmlResMgr() {
    $(".TestBoxJs").css("background-color", "green");
}

//Account Summary functions --
function FetchAccountSummary() {
    CurrentAccountSummary = null;
    $.ajax({
        type: "POST",
        headers: {
            "cache-control": "no-cache"
        },
        url: "/_layouts/Bge.Canp/SecureServices.asmx/GetAccountSummary",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: function (msg) {
            if (msg.d.ErrorCode == null) {

                viewModel.getFromLocal();
                viewModel.accountSummary = msg.d;
                viewModel.saveToLocal();
                CurrentAccountSummary = viewModel.accountSummary;

                GetDisconnect();

                getAccountAlertsMsgSP();

            }

        }

    });
}

$(document).on('pageshow', '#myenergyusage-page', function (event) {
    $('#uiPnlMyEnergyUse2').listview('refresh');
});

//prasad sem
var hbar1 = 0;
var hbar2 = 0;
var hbar3 = 0;
var hbar4 = 0;
var elecCompData;
var gasCompData;
var hoodCompData;
var oPowerErrorMessage;
var mErrorMessage;
var amiflag = false;
function GetOpowerComp() {
    $.mobile.showPageLoadingMsg();
    // $.mobile.loadPage('sem.html', { prefetch: "true"});
    if (jQuery.isEmptyObject(OpowerData)) {
        $.ajax({
            type: "POST",
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetOpowerData",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            timeout: CanpAjaxTO,
            global: false,
            success: OpowerCompPopulate,
            error: OpowerCompError,
            complete: OpowerCompComplete
        });
    } else {
        OpowerCompPopulate(OpowerData);
        $.mobile.changePage('sem.html', {
            transition: "slide"
        });
    }
    // var msg={"d":{"__type":"Bge.Canp.Ui.AjaxData.OpowerData","IsAMI":true,"HoodComparison":{"Elec":{"You":409,"Neighbors":604.0116,"EfficientNeighbors":422,"StartDate":"\/Date(1350964800000)\/","EndDate":"\/Date(1353301200000)\/","NumNeighbors":93,"NumEfficientNeighbors":19},"Gas":{"You":36,"Neighbors":52.5417671,"EfficientNeighbors":33,"StartDate":"\/Date(1350964800000)\/","EndDate":"\/Date(1353301200000)\/","NumNeighbors":94,"NumEfficientNeighbors":19},"Combined":{"You":733,"Neighbors":1082.36194,"EfficientNeighbors":777.2,"StartDate":"\/Date(1350964800000)\/","EndDate":"\/Date(1353301200000)\/","NumNeighbors":93,"NumEfficientNeighbors":19}},"BillComparisonElec":{"FailureExplanation":"NOT_ENOUGH_USAGE_DATA","MeterUnit":0,"CurrencySymbol":"$","TemperatureUnit":"FAHRENHEIT","AnalysisResults":null,"Reference":{"Charges":60.11,"Usage":409,"StartDate":"\/Date(1350964800000)\/","EndDate":"\/Date(1353301200000)\/","AverageTemperature":48.1071434,"RatePlan":null},"Compared":null},"BillComparisonGas":{"FailureExplanation":null,"MeterUnit":1,"CurrencySymbol":"$","TemperatureUnit":"FAHRENHEIT","AnalysisResults":[{"AnalysisName":0,"CostDifferenceExplained":2.95384145},{"AnalysisName":1,"CostDifferenceExplained":4.554},{"AnalysisName":3,"CostDifferenceExplained":2.93}],"Reference":{"Charges":48.38,"Usage":36,"StartDate":"\/Date(1350964800000)\/","EndDate":"\/Date(1353301200000)\/","AverageTemperature":48.1071434,"RatePlan":"D"},"Compared":{"Charges":37.95,"Usage":28,"StartDate":"\/Date(1319515200000)\/","EndDate":"\/Date(1321592400000)\/","AverageTemperature":49.12,"RatePlan":"D"}},"ErrorCode":null,"ErrorMessage":null}}
    //OpowerCompPopulate(msg);
    //OpowerCompComplete();

}

function OpowerCompPopulate(msg) {
    $.mobile.showPageLoadingMsg();
    OpowerData = msg;
    mErrorMessage = null;
    if (jQuery.isEmptyObject(msg.d)) {
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('#sem_comparepast').addClass('hidden');
        $('#cpu').addClass('hidden');
        $('#shc').text('MY ENERGY USE');
        $('.sempageclass').addClass('hidden');
        $('#sem_nodata').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        $('#sem_nodatasimilar').addClass('hidden');
        $('#sem_nodatapast').addClass('hidden');
        $("#uiOpowerErrorTxt").html(findMessage('OPOWER_ERROR')); // Data Error
        mErrorMessage = "Error";
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('#sem_comparepast').addClass('hidden');
        $('#cpu').addClass('hidden')
        $('#shc').text('MY ENERGY USE');
        $('#sem_nodatasimilar').addClass('hidden');
        $('#sem_nodatapast').addClass('hidden');
        $('#sem_nodata').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        $("#uiOpowerErrorTxt").html(findMessage('OPOWER_ERROR')); // Data Error
        mErrorMessage = msg.d.ErrorMessage;
        return;
    }

    //if (msg.d.IsAMI==true && msg.d.IsCommercial == false) {
    if (msg.d.IsAMI) {
        amiflag = true;
        $('.sempageclass').removeClass('hidden');
        $('#uiGreyHeaderClass').removeClass('greyheaderclass');
        elecCompData = msg.d.BillComparisonElec;
        gasCompData = msg.d.BillComparisonGas;
        hoodCompData = msg.d.HoodComparison;
        oPowerErrorMessage = msg.d.oPowerMessage;

        /*if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
        //$(".serviceaddressclass").append('<span>Account #: <strong><label id="lblaccountid" > '+ CurrentAccountSummary.AccountId +'</label></span><address>'+ CurrentAccountSummary.MailAddress[0]+' <br>'+ CurrentAccountSummary.MailAddress[1]+' <br>'+ CurrentAccountSummary.MailAddress[2]+'</address><ul class="controls"><li><a href="/m/Pages/notifications.html" data-rel="back" data-transition="slide" data-direction"reverse"><span class="bullet">Notification Preferences</span></a></li></ul>');
        $('#lblaccountid').text(CurrentAccountSummary.AccountId);
        }
        if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length == 1 && CurrentAccountSummary.ServiceList[0].Address != "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiNoPremise').hide();
        $('#uiPremiseSingle').text(CurrentAccountSummary.ServiceList[0].Address);
        }
        else if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length > 1) {
        $('#uiPremiseSingle').hide();
        $('#uiPremise').show();
        $('#uiNoPremise').hide();
        var pselect = $('#uiPremiseSelect');
        pselect.empty();

        $.each(CurrentAccountSummary.ServiceList, function (idx) {
        pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
        });

        //displaying first item in the dropdown list (prasad)
        $('#uiPremiseSelect option:first-child').attr('selected', 'selected');
        $('#uiPremiseSelect').selectmenu('refresh');
        pselect.change(OnChangePremise);
        }*/

    } else {
        $('.sempageclass').addClass('hidden');
        $('#sem_nodata').addClass('hidden');
        $('#sem_nodatasimilar').addClass('hidden');
        $('#sem_nodatapast').addClass('hidden');
        $('#sem_nonami').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        $('#shc').text('MY ENERGY USE');
        $('#cpu').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('#sem_comparepast').addClass('hidden');
    }

    if (amiflag) {
        $.mobile.showPageLoadingMsg();
        showHoodComparison();
        showBillComparison();
    }

}
function OpowerCompError(xhr, ajaxOptions, thrownError) {
    $('.sempageclass').addClass('hidden');
    $('#sem_nonami').addClass('hidden');
    $('#sem_similarhomes').addClass('hidden');
    $('#sem_comparepast').addClass('hidden');
    $('#cpu').addClass('hidden');
    $('#sem_nodata').removeClass('hidden');
    $('#uiGreyHeaderClass').addClass('greyheaderclass');
    $('#sem_nodatasimilar').addClass('hidden');
    $('#sem_nodatapast').addClass('hidden');
    $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error

}
function OpowerCompComplete(xhr, status) {

    if (status == 'timeout') {
        $('.sempageclass').addClass('hidden');
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('#sem_comparepast').addClass('hidden');
        $('#cpu').addClass('hidden');
        $('#sem_nodata').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        $('#sem_nodatasimilar').addClass('hidden');
        $('#sem_nodatapast').addClass('hidden');
        $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR'));
    }
    /* else if (jQuery.isEmptyObject(mErrorMessage)) {
    if (amiflag) {
    $.mobile.showPageLoadingMsg();
    showHoodComparison();
    showBillComparison();
    }
    //(prasad) we are showing both hood comparison and bill comparions on the same page so need to load both content.
    }*/
    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage('sem.html', { transition: "slide" });
}
function daysBetween(first, second) {
    // Copy date parts of the timestamps, discarding the time parts. Month is 0 based
    var one = new Date(first.getFullYear(), first.getMonth() - 1, first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth() - 1, second.getDate());
    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;
    // Round down.
    return Math.floor(days) + 1;
}
function showHoodComparison(obj) {

    /* (!jQuery.isEmptyObject(mErrorMessage)) {
    $('.sempageclass').addClass('hidden');
    $('#sem_nonami').addClass('hidden');
    $('#sem_similarhomes').addClass('hidden');
    $('#sem_comparepast').addClass('hidden');
    $('#cpu').addClass('hidden');
    $('.sempageclass').addClass('hidden');
    $('#sem_nodata').removeClass('hidden');
    $("#uiOpowerErrorTxt").html(findMessage('OPOWER_ERROR')); // Data Error
    return;
    }*/
    //hide error


    $('#sem_nodata').addClass('hidden');
    $('#sem_nonami').addClass('hidden');
    $('.sempageclass').removeClass('hidden');
    $('#sem_similarhomes').removeClass('hidden');
    $('#sem_nodatasimilar').addClass('hidden');
    //$('#cpu').removeClass('hidden');

    if (!jQuery.isEmptyObject(hoodCompData))
        fillHoodComp();
    else {

        $('#sem_nodata').addClass('hidden');
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        //$('#sem_comparepast').addClass('hidden');
        //$('#cpu').addClass('hidden');
        $('.sempageclass').addClass('hidden');
        $('#sem_nodatasimilar').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        //$('#sem_nodatapast').addClass('hidden');
        $('#uiOpowerErrorTxtsimilar').html(findMessage('OPOWER_ERROR')); // Data Error
    }

}

function sortBars() {
    var items = $('.horizontalBarGraph').find('li');
    items.sort(function (a, b) {
        return (($(a).children("i").attr("barLength")) - ($(b).children("i").attr("barLength")))
    });
    $('.horizontalBarGraph').empty().html(items);
}

function fillHoodComp() {
    var commodity = hoodCompData.Combined;
    var commodityUnitsType = 'units';
    if (jQuery.isEmptyObject(commodity)) {
        commodity = hoodCompData.Elec;
        commodityUnitsType = 'kWh';
        if (jQuery.isEmptyObject(commodity)) {
            commodity = hoodCompData.Gas;
            commodityUnitsType = 'therms';
        }
    }
    if (jQuery.isEmptyObject(commodity)) {

        $('#sem_nodata').addClass('hidden');
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('.sempageclass').addClass('hidden');
        $('#sem_nodatasimilar').removeClass('hidden');
        $('#uiGreyHeaderClass').addClass('greyheaderclass');
        $('#uiOpowerErrorTxtsimilar').html(findMessage('OPOWER_ERROR')); // Data Error
    } else {

        var maxUsage = Math.max(commodity.EfficientNeighbors, commodity.Neighbors, commodity.You);

        //Bars
        var efficientNeighborsLength = (commodity.EfficientNeighbors / maxUsage) * 200;
        // var efficientNeighborsLength = ((commodity.EfficientNeighbors / maxUsage) * $(window).width()) - 150;
        if (efficientNeighborsLength < 50)
            efficientNeighborsLength = 50;
        var neighborsLength = (commodity.Neighbors / maxUsage) * 200;
        //var neighborsLength = ((commodity.Neighbors / maxUsage) * $(window).width()) - 150;
        if (neighborsLength < 50)
            neighborsLength = 50;
        var youLength = (commodity.You / maxUsage) * 200;
        //var youLength = ((commodity.You / maxUsage) * $(window).width()) - 150;
        if (youLength < 50)
            youLength = 50;

        $('#uiEfficientNeighbors').attr("barLength", efficientNeighborsLength);
        $('#uiAllNeighbors').attr("barLength", neighborsLength);
        $('#uiYourHouseHold').attr("barLength", youLength);

        sortBars();
        //$('.horizontalGraphArea').show();
        //$('#uiEfficientNeighbors').width(10);
        //$('#uiAllNeighbors').width(10);
        //$('#uiYourHouseHold').width(10);
        $('#uiEfficientNeighbors').animate({
            height: efficientNeighborsLength,
            avoidTransforms: true
        }, 1500, function () { });
        $('#uiAllNeighbors').animate({
            height: neighborsLength,
            avoidTransforms: true
        }, 1500, function () { });
        $('#uiYourHouseHold').animate({
            height: youLength,
            avoidTransforms: true
        }, 1500, function () { });
        //$('#uiEfficientNeighbors').text(Math.round(commodity.EfficientNeighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        //$('#uiAllNeighbors').text(Math.round(commodity.Neighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        //$('#uiYourHouseHold').text(Math.round(commodity.You) + ' ' + commodityUnitsType); //added to show the values inside the wood bars

        $('#uiEfficientNeighbors1').text(Math.round(commodity.EfficientNeighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        $('#uiAllNeighbors1').text(Math.round(commodity.Neighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        $('#uiYourHouseHold1').text(Math.round(commodity.You) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        //Percentage Calculation
        var effiencyPct = 0;
        var moreLess = "MORE";
        var compareWith = "similar";

        if (commodity.You > commodity.Neighbors) {
            effiencyPct = (commodity.You - commodity.Neighbors) / commodity.Neighbors * 100;
        } else if (commodity.You > commodity.EfficientNeighbors) {
            compareWith = "efficient";
            effiencyPct = (commodity.You - commodity.EfficientNeighbors) / commodity.EfficientNeighbors * 100;
        } else {
            compareWith = "efficient";
            effiencyPct = (commodity.EfficientNeighbors - commodity.You) / commodity.EfficientNeighbors * 100;
            moreLess = "LESS";
        }

        $('#uiEffiency').text(Math.round(effiencyPct) + '% ' + moreLess);

        $('#uiComparewith').text(compareWith);
        var startDate = new Date(parseInt(commodity.StartDate.substr(6, 13)));
        var endDate = new Date(parseInt(commodity.EndDate.substr(6, 13)));
        //$('#uiHoodDateRange').text(startDate.format("MMMM d") + " - " + endDate.format("MMMM d"));
        $('#uiHoodDateRange').text(months[startDate.getMonth()] + " " + startDate.getDate() + " - " + months[endDate.getMonth()] + " " + endDate.getDate());
    }

}

function showBillComparison() {

    //hide error
    $('#sem_nodata').addClass('hidden');
    $('#sem_nonami').addClass('hidden');
    //$('#sem_similarhomes').removeClass('hidden');
    $('#sem_comparepast').removeClass('hidden');
    $('#cpu').removeClass('hidden');

    if (!jQuery.isEmptyObject(mErrorMessage)) {
        $('#sem_nodata').removeClass('hidden');
        $('#sem_nonami').addClass('hidden');
        $('#sem_similarhomes').addClass('hidden');
        $('#sem_comparepast').addClass('hidden');
        $('#sem_nodatasimilar').addClass('hidden');
        $('#sem_nodatapast').addClass('hidden');
        $('#cpu').addClass('hidden');
        return;
    }

    if (!jQuery.isEmptyObject(gasCompData) && !jQuery.isEmptyObject(elecCompData)) {
        $('#utilityTypeText').addClass('hidden');
        $("#uiUtilityTypeSelect").removeClass('hidden');
        if (!jQuery.isEmptyObject(gasCompData.FailureExplanation) || !jQuery.isEmptyObject(elecCompData.FailureExplanation)) {

            //$('#sem_nodata').removeClass('hidden');
            //$('#uiOpowerError').addClass('active');
            $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error
            $('#sem_nonami').addClass('hidden');
            //$('#sem_similarhomes').addClass('hidden');
            $('#sem_comparepast').addClass('hidden');
            $('#cpu').addClass('hidden');
            return;
        } else {
            $('#utilityTypeText').hide();
            $("#uiUtilityTypeSelect").show();
            $('#utilityTypeText').addClass('hidden');
            $("#uiUtilityTypeSelect").removeClass('hidden');
            $('#sem_similarhomes').removeClass('hidden');
            $('#sem_comparepast').removeClass('hidden');

        }
    } else if (!jQuery.isEmptyObject(gasCompData)) {
        if (!jQuery.isEmptyObject(gasCompData.FailureExplanation)) {
            $('#sem_nonami').addClass('hidden');
            //$('#sem_similarhomes').addClass('hidden');
            $('#sem_comparepast').addClass('hidden');
            $('#cpu').addClass('hidden');
            return;
        } else {
            $('#utilityTypeText').show();
            $("#uiUtilityTypeSelect").hide();
            $('#utilityTypeText').removeClass('hidden');
            $("#uiUtilityTypeSelect").addClass('hidden');
            $('#utilityTypeText').text('Compare my gas  bill');
            //$('#sem_similarhomes').removeClass('hidden');
            $('#sem_comparepast').removeClass('hidden');

        }
    } else if (!jQuery.isEmptyObject(elecCompData)) {
        if (!jQuery.isEmptyObject(elecCompData.FailureExplanation)) {

            // $('#sem_nodata').removeClass('hidden');
            //$('#uiOpowerError').addClass('active');
            $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error

            $('#sem_nonami').addClass('hidden');
            // $('#sem_similarhomes').addClass('hidden');
            $('#sem_comparepast').addClass('hidden');
            $('#cpu').addClass('hidden');

            return;
        } else {
            $('#utilityTypeText').show();
            $("#uiUtilityTypeSelect").hide();
            $('#utilityTypeText').removeClass('hidden');
            $("#uiUtilityTypeSelect").addClass('hidden');
            $('#utilityTypeText').text('Compare my electricity bill');
            //$('#sem_similarhomes').removeClass('hidden');
            $('#sem_comparepast').removeClass('hidden');

        }

    } else {

        $('#sem_nodata').addClass('hidden');
        $('#sem_nonami').addClass('hidden');
        //$('#sem_similarhomes').removeClass('hidden');
        $('#sem_comparepast').addClass('hidden');
        $('#sem_nodatapast').removeClass('hidden');
        $("#uiOpowerErrorTxtpast").html(findMessage('OPOWER_ERROR')); // Data Error
        $('#cpu').removeClass('hidden')
        return;
    }

    changeUtilityType();

}

function showGasComp() {
    showCompBars(gasCompData, "Therms");
}
function showElecComp() {
    showCompBars(elecCompData, "kWh");
}
function showCompBars(data, units) {

    if (!jQuery.isEmptyObject(data)) {

        //(prasad)$('.calloutLeftArrow').show();
        // $('.verticalBarLandscape').show();
        if (data.Reference.AverageTemperature == 0 || data.Compared.AverageTemperature == 0) {
            data.Reference.AverageTemperature = 0;
            data.Compared.AverageTemperature = 0;
        }
        //SetCompBar($('#uiRefCharges'), $('#uiRefDays'), $('#uiRefUsage'), $('#uiRefTemp'), $('#uiRefDateRangeE'), data.Reference, units)
        SetCompBar($('#uiRefCharges'), data.Reference, units)
        //SetCompBar($('#uiCompCharges'), $('#uiCompDays'), $('#uiCompUsage'), $('#uiCompTemp'), $('#uiCompDateRangeE'), data.Compared, units)
        SetCompBar($('#uiCompCharges'), data.Compared, units)

        //SetCompBar1($('#uiRefCharges'), $('#uiRefDays'), $('#uiRefUsage'), $('#uiRefTemp'), $('#uiRefDateRangeE'));
        //SetCompBar11($('#uiCompCharges'), $('#uiCompDays'), $('#uiCompUsage'), $('#uiCompTemp'), $('#uiCompDateRangeE'));

        hbar1 = 80;
        hbar2 = 150;
        SetBarHeights(data.Reference.Charges, data.Compared.Charges);
        //SetBarHeights1(120.6, 95.43);

        animateBars();
    }

}
function SetCompBar(charges, data, units) {
    //set charges to 2 decimal places
    charges.text('$' + data.Charges.toFixed(2));
    var startMilli = parseInt(data.StartDate.substr(6, 13));
    var endMilli = parseInt(data.EndDate.substr(6, 13));
    var startDate = new Date(startMilli);
    var endDate = new Date(endMilli);
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var diffdays = Math.round((endMilli - startMilli) / millisecondsPerDay) + 1; // Include end date


    //$('#uiBillCompRange').text(startDate.format("MMM dd, yyyy") + " - " + endDate.format("MMM dd, yyyy"));
    $('#uiBillCompRange').text(months[startDate.getMonth()] + " " + startDate.getDate() + "," + startDate.getUTCFullYear() + " - " + months[endDate.getMonth()] + " " + endDate.getDate() + "," + endDate.getUTCFullYear());
}

function SetBarHeights(refData, CompData) {
    var diff = CompData - refData;
    var diffmargin = refData * 0.10;
    if (diff > 0)
        diffmargin = CompData * 0.10;

    if (diff > diffmargin) {
        $('#uiChargeDiff').text('$' + diff.toFixed(2) + " lower");
        $('#uiChargeCmp').text(' than');
        hbar1 = 200;
        var smallbar = (refData * 200 / CompData);
        //hbar1 = $(window).width() - 150;
        //var smallbar = (refData * ($(window).width() - 150) / CompData);
        if (smallbar < 80)
            smallbar = 80;
        hbar2 = smallbar;
    } else if (diff < -diffmargin) {
        diff = -diff;
        $('#uiChargeDiff').text('$' + diff.toFixed(2) + " higher");
        $('#uiChargeCmp').text(' than');
        hbar2 = 200;
        var smallbar = (CompData * 200 / refData);
        //hbar2 = $(window).width() - 150;
        //var smallbar = (CompData * ($(window).width() - 150) / refData);
        if (smallbar < 80)
            smallbar = 80;
        hbar1 = smallbar;
    } else {
        $('#uiChargeDiff').text(" about the same");
        $('#uiChargeCmp').text(' as');
        hbar2 = 200;
        var smallbar = (CompData * 200 / refData);
        //hbar2 = $(window).width() - 150;
        //var smallbar = (CompData * ($(window).width() - 150) / refData);
        if (smallbar < 80)
            smallbar = 80;
        hbar1 = smallbar;
        diff = Math.abs(diff);
    }
}

function changeUtilityType() {

    if ($("#utilityType").val() == "electricity" || $('#utilityTypeText').text() == "Compare my electricity bill") {
        showElecComp();
    } else {
        showGasComp();
    }

}

function animateBars() {
    //$('#elecbar1').width(10);
    //$('#elecbar2').width(10);
    //$('#elecbar1').animate({ width: hbar1, avoidTransforms: true }, 1500, function () { });
    //$('#elecbar2').animate({ width: hbar2, avoidTransforms: true }, 1500, function () { });

    $('#elecbar1').animate({
        height: hbar1,
        avoidTransforms: true
    }, 1500, function () { });
    $('#elecbar2').animate({
        height: hbar2,
        avoidTransforms: true
    }, 1500, function () { });

}

// Premise change functions --
//prasad premise
function OnChangePremise() {

    OnChangePremiseAjax();
}
function OnChangePremiseAjax() {
    var jsonData = {
        "pId": $('#uiPremiseSelect').val()
    };
    var data = JSON.stringify(jsonData);
    $.ajax({
        type: "POST",
        async: false,
        url: "/_layouts/Bge.Canp/SecureServices.asmx/ChangePremise",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: PremiseChanged,
        error: PremiseError,
        complete: PremiseComplete
    });
}
function PremiseChanged(msg) {

    if ($('.ui-page-active').attr('id') == 'myprograms-page') {
        viewModel.canpPrograms(null);
        GetPrograms();
    } else if ($('.ui-page-active').attr('id') == 'ser-page') {
        SERData = null;
        showSERHistoricalData();
    } else if ($('.ui-page-active').attr('id') == 'sem-page') {
        OpowerData = null;
        GetOpowerComp();
    } else if ($('.ui-page-active').attr('id') == 'outages-page') {
        OutageData = null;
        GetOutages();
    }

}

function PremiseError(xhr, ajaxOptions, thrownError) {
    $.mobile.hidePageLoadingMsg();
}
function PremiseComplete(xhr, status) {
    // take away wait symbol and display error message if any
    $.mobile.hidePageLoadingMsg();
}

// Disconnect Notice functions ---
function GetDisconnect() {
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/GetDisconnect",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: function (msg) {
            if (msg.d.Amount != 0 && msg.d.DDate != null) {
                viewModel.getFromLocal();
                viewModel.discAmount = msg.d.Amount;
                viewModel.disconnectnotice(true);
                viewModel.saveToLocal();
            }
            //getAccountAlertsMsgSP();
            $.mobile.changePage('myaccount.html', {
                transition: "slide"
            });

        }
    });
}

//Report an Outage function ---
function ReportAnOutage() {
    $(".OutageDisp").css("visibility", "visible");
    $("#uiReportOutageLoading").show();
    $("#btnReportOutage").hide();
    $('#divETR').hide();
    $('#divStLightOutages').show();
    $('#divEmergencies').show();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/ReportAnOutageData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: RportAnOutageSuccess,
        error: RportAnOutageError
    });
}

function RportAnOutageSuccess(msg) {

    $("#uiReportOutageLoading").hide();

    if (jQuery.isEmptyObject(msg.d)) {
        $(".NoOutage").show();
        $("#uiStatus").text("There was an error submitting your outage. Please call 877.778.2222 to report an outage.");
        $("#uiOutageHeader").text("<b>Error reporting your outage</b>");
        $(".OutageDisp").hide();
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $(".NoOutage").show();
        $("#uiStatus").text(msg.d.ErrorMessage);
        $("#uiOutageHeader").text("<b>Error reporting your outage</b>");
        $(".OutageDisp").hide();
        return;
    }
    OutageReportUpdate(true, msg.d.ETRDescription);
}

function RportAnOutageError(xhr, ajaxOptions, thrownError) {
    $("#uiReportOutageLoading").hide();
    $(".OutageDisp").hide();
    $(".NoOutage").show();
    $("#uiStatus").text("There was an error submitting your outage. Please call 877.778.2222 to report an outage.");
    $("#uiOutageHeader").text("Error reporting your outage");
}

function OutageReportUpdate(returnValue, etrMsg) {
    $('#divETR').show();
    $('#divStLightOutages').show();
    $('#divEmergencies').show();
    if (returnValue == true) {
        $('.NoOutage').show();
        $('#uiStatus').text('Estimated Time of Restoration is : ' + etrMsg);
        $('.OutageDisp').hide();
    } else {
        $('.OutageDisp').hide();
        $(".NoOutage").show();
        $("#uiStatus").text('<b>Please note:</b> if you reported an outage within the past fifteen minutes it may not yet be reflected on this site.');
    }
}

//Outages,Programs,sem,viewbill
// Program Enrollments functions --
function GetPrograms() {

    $.mobile.showPageLoadingMsg();
    if ((viewModel.canpPrograms() == null || viewModel.canpPrograms().length == 0) || viewModel.accountSummary.NumberAccounts > 1) {
        $.ajax({
            type: "POST",
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetPrograms",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            async: true,
            global: false,
            success: PrgmPopulate,
            error: PrgmError,
            complete: PrgmComplete
        });
    } else {

        $.mobile.changePage('myprograms.html', {
            transition: "slide"
        });
    }
    setGrayHeader();

}
function PrgmPopulate(msg) {
    $.mobile.showPageLoadingMsg();
    if (!jQuery.isEmptyObject(msg.d) && msg.d.ProgramList != null) {
        viewModel.getFromLocal();
        var mappedPrograms = ko.mapping.fromJS(msg.d.ProgramList);
        viewModel.canpPrograms(mappedPrograms());
        viewModel.saveToLocal();

    } else {
        ShowLearMoreLink();

    }

    $.mobile.changePage('myprograms.html', {
        transition: "slide"
    });

}

function PrgmError(xhr, ajaxOptions, thrownError) {
    ShowLearMoreLink();
}
function PrgmComplete(xhr, status) {

    if (status == 'timeout' || status != 'success') {
        //show learn more about peakrewards link
        ShowLearMoreLink();
    }
    $.mobile.hidePageLoadingMsg();

    $.mobile.changePage('myprograms.html', {
        transition: "slide"
    });

}

function generatePopup(id, heading, link) {
    $('#ProgramsPopups').append('<div data-role="popup" id="' + id + '" data-overlay-theme="a" style="width:250px; max-width:250px;"  data-dismissible="false" ><div data-role="content" style="padding:15px;" class="ui-corner-bottom"><p class="centeralign">' + heading + '</p><a href="' + link + '" target=_blank data-role="button" data-theme="d">OK</a><a href="#" data-role="button" data-rel="back" data-theme="c">CANCEL</a> </div></div>');
    $('#ProgramsPopups').trigger('popup').trigger('create');
}

function ShowLearMoreLink() {
    $('#uiPrograms').hide();
    $('#uiProgramsDefault').empty();
    //generatePopup('mainpeakrewards', findMessage('PEAKREWARDSLEARN_PROGRAM_NAME'), findMessage('PEAKREWARDSLEARN_PROGRAM_URL'));
    $('#uiProgramsDefault').append('<li class="lvheight"><a href="#mainpeakrewards" data-rel="popup">' + findMessage('PEAKREWARDSLEARN_PROGRAM_NAME') + '</a></li>');
    $('#uiProgramsDefault').append('<li class="lvheight"><a data-rel="popup" href="#mainsmartenergy">Energy Efficiency</a></li>');
    $('#uiProgramsDefault').listview('refresh');

}
// Planned outage functions --
function GetOutages() {
    //Hide any previous errors
    $.mobile.showPageLoadingMsg();
    // $.mobile.loadPage('outages.html', { prefetch: "true"});
    if (jQuery.isEmptyObject(OutageData)) {
        $.ajax({
            type: "POST",
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetOutages",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            timeout: CanpAjaxTO,
            global: false,
            success: OutagePopulate,
            error: OutageError,
            complete: OutageComplete
        });
    } else {
        OutagePopulate(OutageData);
        $.mobile.hidePageLoadingMsg();
        $.mobile.changePage('outages.html', {
            transition: "slide"
        });
    }

}

function DisplayOutageError() {

    //    $("#uiOutagesBlock").addClass('hidden');
    //    $("#uiPlannedOutagePnl").addClass('hidden');
    //    $("#uiOutageErrorMsg").html(findMessage('ERROR_MSG_OUTAGES'));

    $("#planOutagesLabel").addClass('hidden');
    $("#uiPlannedOutagePnl").addClass('hidden');
    $("#errorMessage").html(findMessage('ERROR_MSG_OUTAGES'));
    $('.outagepageclass').addClass('hidden');
    $('#errorBlock').removeClass('hidden');
    $('#uiGreyHeaderClass').addClass('greyheaderclass');
    $('.greyheaderclass').css('height', '90px');

}

function OutagePopulate(msg) {
    $('#uiGreyHeaderClass').removeClass('greyheaderclass');
    OutageData = msg;
    $.mobile.showPageLoadingMsg();
    userOutages = msg.d;
    if (jQuery.isEmptyObject(msg.d)) {
        DisplayOutageError();
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        DisplayOutageError();
        return;
    }

    if (jQuery.isEmptyObject(CurrentAccountSummary)) {
        //GetAccountSummary();
        FetchAccountSummary();
    }
    if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
        //$(".serviceaddressclass").append('<span>Account #: <strong><label id="lblaccountid" > '+ CurrentAccountSummary.AccountId +'</label></span><address>'+ CurrentAccountSummary.MailAddress[0]+' <br>'+ CurrentAccountSummary.MailAddress[1]+' <br>'+ CurrentAccountSummary.MailAddress[2]+'</address><ul class="controls"><li><a href="/m/Pages/notifications.html" data-rel="back" data-transition="slide" data-direction"reverse"><span class="bullet">Notification Preferences</span></a></li></ul>');
        $('#lblaccountid').text(CurrentAccountSummary.AccountId);
    }
    if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length == 1 && CurrentAccountSummary.ServiceList[0].Address != "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiNoPremise').hide();
        $('#uiPremiseSingle').text(CurrentAccountSummary.ServiceList[0].Address);
    } else if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length > 1) {
        $('#uiPremiseSingle').hide();
        $('#uiPremise').show();
        $('#uiNoPremise').hide();
        var pselect = $('#uiPremiseSelect');
        pselect.empty();

        $.each(CurrentAccountSummary.ServiceList, function (idx) {
            pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
        });

        //displaying first item in the dropdown list (prasad)
        $('#uiPremiseSelect option:first-child').attr('selected', 'selected');
        $('#uiPremiseSelect').selectmenu('refresh');
        pselect.change(OnChangePremise);
    } else if (CurrentAccountSummary.ServiceList[0].Address == "No Data") {
        $('#uiPremiseSingle').hide();
        $('#uiPremise').hide();
        $('#uiNoPremise').text('no premise');
        $('#uiNoPremise').show();
    }

    $('#uiNoPlannedOutageMsg').html(findMessage('NO_PLANNED_ELECTRIC_OUTAGES'));

    if (msg.d.Status != null) {
        $('#uiAsOf').text(msg.d.AsOf);
        $('#uiStatus').text(msg.d.Status);
    } else {

        $('#uiOutageErrorMsg').html(findMessage('NO_ELECTRIC_OUTAGES'));
        $('#uiOutageErrorMsg').removeClass('hidden');
        $('#uiOutagesBlock').addClass('hidden');

    }
    if (msg.d.OutageList != null && msg.d.OutageList.length > 0) {
        $('#divNoPlannedOutage').addClass("hidden");
        $('#uiPlannedOutagePnl').removeClass("sub-content");
        $('#uiPlannedOutagePnl').removeClass("border-container");
        $('#uiPlannedOutagePnl').removeClass("bg-container");
        $('#uiPlannedOutage').removeClass("hidden");
        $('#uiPlannedOutage').empty();
        $.each(msg.d.OutageList, function (idx) {
            /*$("#uiPlannedOutage").append('<li><h4><a>' + this.outageNumber + '</a><h4><address>'
            + this.outageStatus + '</address><span>' + this.plannedStartDateTime + '</span> <strong> to </strpmg><span>' + this.plannedEndDateTime + '</span></li>');
            */

            /*$("#uiPlannedOutage").append('<li><div class="ui-grid-a"><div class="ui-block-a acct-number" style="text-align:left;height:10px" >Order#:</div><div class="ui-block-b" style="text-align:right" ><address>' + this.outageNumber + '</address></div>'
            + '<div class="ui-block-a acct-number" style="text-align:left;height:10px">When:</div>' +
            +'<div class="ui-block-b address" style="text-align:right" ><address>'
            + this.plannedStartDateTime + '<strong> to </strong>' + this.plannedEndDateTime + '</address></div>'
            + '<div class="ui-block-a acct-number" style="text-align:left;height:10px">Status:</div>'
            + '<div class="ui-block-b address" style="text-align:right" ><address>' + this.outageStatus + '</address></div>'
            + '</div></li>');*/
            /* $("#uiPlannedOutage").append('<li><div class="ui-grid-a"><div class="ui-block-a" style="text-align:left;height:10px" >Order#:</div><div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.outageNumber + '</div>'
            + '<div class="ui-block-a" style="text-align:left;height:10px">When:</div>' +
            +'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >'
            + this.plannedStartDateTime + '<strong> to </strong>' + this.plannedEndDateTime + '</div>'
            + '<div class="ui-block-a" style="text-align:left;height:10px">Status:</div>'
            + '<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.outageStatus + '</div>'
            + '</div></li>');*/

            $('#uiPlannedOutage').append('<li><div class="ui-grid-a">' +
				'<div class="ui-block-a" style="text-align:left;height:10px" >Order Number:</div>' +
				'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.outageNumber + '</div>' +
				'<div class="ui-block-a" style="text-align:left;height:10px">Status:</div>' +
				'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.outageStatus + '</div>' +
				'<div class="ui-block-a" style="text-align:left;height:10px">When:</div>' +
				'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.plannedStartDateTime + '<strong> to </strong>' + this.plannedEndDateTime + '</div>' +
				'</div>' +
				'</li>');

        });

    }
    if ($('#uiPlannedOutage li').length != 0) {
        $('#uiPlannedOutage').listview('refresh');
    }
    //$.mobile.hidePageLoadingMsg();
    //$.mobile.changePage('/'+ globalpath +'/Pages/outages.html', { transition: "slide" });
}
function OutageError(xhr, ajaxOptions, thrownError) {

    DisplayOutageError();
}
function OutageComplete(xhr, status) {

    if (status == 'timeout' || status != 'success') {
        DisplayOutageError();
    }

    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage('outages.html', {
        transition: "slide"
    });
}

//gets called going from GAP to Account summary page
function ChangeAccount(accountId, premiseId) {
    var postData = {
        "accountId": accountId,
        "premiseId": premiseId
    };

    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/ChangeAccountPremise',
        type: 'POST',
        async: false,
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(postData),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            FetchAccountSummary();
        },
        error: function (xhr, textStatus, errorThrown) {
            alert(textStatus);
        }
    });

}

//Global Accounts Page
$(document).on('pageinit', '#gap-page', function (event) {

    GetAccountsOnPage('false', '');

    var thread = null;
    $('#Searchbox').keyup(function () {
        clearTimeout(thread);
        $this = $(this);
        thread = setTimeout(function () {
            GetAccountsOnPage('true', $this.val());
        }, 500);
    });
});

function GetAccountsOnPage(search, searchFilter) {
    var postData = {
        "_search": search,
        "rows": '5',
        "page": '1',
        "sidx": '',
        "sord": 'asc',
        "filters": '{\"groupOp\":\"AND\",\"rules\":[{\"field\":\"AccountId\",\"op\":\"bw\",\"data\":\"' + searchFilter + '\"}]}'
    };
    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/GetAccountsOnPage',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(postData),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            GetAllAccountSummary = data.d;
            //loop and fill
            if (data.d != null) {
                $('#address-list').empty();
                $.each(data.d.AccountList, function (idx) {
                    var gaselectricimage = '<div class="service-type"><i class="sprites gas"></i><i class="sprites electric"></i></div>';

                    if (jQuery.isEmptyObject(this.ServiceType)) {
                        gaselectricimage = "";
                    } else
                        if (this.ServiceType == 'Electric') {
                            gaselectricimage = '<div class="service-type"><i class="sprites electric"></i></div>';
                        }

                    if (!jQuery.isEmptyObject(this.Address)) {

                        $("#address-list").append('<li> <a href=#?' + this.AccountId + ' onclick="ChangeAccount(\'' + this.AccountId + '\',\'\'); return false;"  data-transition="slide"><span>Account #:<label class="boldclass"> ' + this.AccountId + ' </label></span><div class="boldclass">' + this.Address.split(':')[0] + ' <br> ' + this.City + ',MD</div>' + gaselectricimage + '</a></li>').trigger('create');
                    } else {

                        $("#address-list").append('<li> <a href=#?' + this.AccountId + ' onclick="ChangeAccount(\'' + this.AccountId + '\',\'\'); return false;"  data-transition="slide"><span>Account #:<label class="boldclass">' + this.AccountId + '</label></span><div class="boldclass">No Address</div>' + gaselectricimage + '</a></li>').trigger('create');

                    }

                });
                $("#address-list").listview('refresh');

            }

        },
        error: function (xhr, textStatus, errorThrown) {
            alert(textStatus);
        }
    });
}

//get viewBill URL
function getViewBillURL() {
    $.ajax({
        url: "/_layouts/Bge.Canp/SecureServices.asmx/GetViewBillURL",
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            //postwith('http://stage-webservices-omf.bge.com/CSS/BillDisplay/PDFBillDisplay.ashx','9A8DskiWbHhWaP3jB2rWw1xCjQ6Veedt3MZeMq2N13s=');
            if (jQuery.isEmptyObject(data.ErrorMessage)) {
                postwith(data.d.ViewBillUrl, data.d.ViewBillSecKey);
            }
        },
        error: function (xhr, textStatus, errorThrown) { },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}

function postwith(url, bi) {
    var myForm = document.createElement("form");
    myForm.method = "post";
    myForm.action = url;
    myForm.target = "_self";

    var myInput = document.createElement("input");
    myInput.name = "BillInfo";
    myInput.value = bi;
    myForm.appendChild(myInput);

    document.body.appendChild(myForm);
    myForm.submit();
    document.body.removeChild(myForm);
}

// prasad BillLookup

var currentBalance;
var currentDueDate;
var userEnteredAccount;
$(document).on('pageinit', '#bgebilllookup-page', function (event) {

    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#customer-identifier");
    var validator_billlookup = $form.validate({
        submitHandler: function (form) {
            if (!($form.find("input[name=account_number1]").val().length > 9)) {
                $('#account-error').text("Invalid Information Please check the information you have provided and try again.");
                $('#account-error').show();
                return false;
            }
            if (!($form.find("input[name=account_number2]").val().length > 9)) {
                $('#account-error').text("Invalid Information Please check the information you have provided and try again.");
                $('#account-error').show();
                return false;
            } else if ($form.find("input[name=account_number1]").val() != $form.find("input[name=account_number2]").val()) {
                $('#account-error').text("Account Mismatch. please re-enter the account.");
                $('#account-error').show();
                return false;
            } else {
                var accountNumber = {
                    "accountNumber": $form.find("input[name=account_number2]").val()
                };
                userEnteredAccount = $form.find("input[name=account_number2]").val();
                getCurrentBillInfo(accountNumber);
            }
        }
    });

});


function getCurrentBillInfo(accountNumber) {
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/getCurrentBillDetails',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(accountNumber),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: BillInfoPopulate,
        error: BillInfoError,
        complete: BillInfoComplete
    });
    //var msg={"d":{"__type":"Bge.Canp.Ui.AjaxData.BillDetails","currentAmountDue":null,"currentDueDate":null,"ErrorCode":"SUCCESS","ErrorMessage":null}}
    //BillInfoPopulate(msg);
}
function BillInfoPopulate(msg) {

    if (jQuery.isEmptyObject(msg.d)) {
        $('#account-error').text("Error please try again..");
        $('#account-error').show();
        $.mobile.hidePageLoadingMsg();
        return;
    }

    if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        //$('#account-error').text("getMesasgge from messages.xml");
        $('#account-error').text(msg.d.ErrorMessage);
        $('#account-error').show();
        $.mobile.hidePageLoadingMsg();

    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        //$('#account-error').text("get message from message.xml");
        $('#account-error').text(msg.d.ErrorMessage);
        $('#account-error').show();
        $.mobile.hidePageLoadingMsg();

    } else if (jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        currentBalance = msg.d.currentAmountDue;
        currentDueDate = msg.d.currentDueDate;
        $.mobile.changePage('summary-of-bill.html', {
            transition: "slide"
        });
        $.mobile.hidePageLoadingMsg();
    }
}

function BillInfoError(msg) {
    $('#account-error').text("get message from message.xml");
    $('#account-error').show();
}

function BillInfoComplete(msg) { }

// prasad SER historical data functions --



/*$(document).on('pageinit', '#ser-page', function (event) {
setGrayHeader();
});*/

function showSERHistoricalData() {
    $.mobile.showPageLoadingMsg();
    //$.mobile.loadPage('ser.html', {prefetch: "true"});
    if (jQuery.isEmptyObject(SERData)) {
        $.ajax({
            type: "POST",
            async: true,
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetBGESERSavingsSummary",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            global: false,
            success: SERSavingsPopulate,
            error: SERSavingsError,
            complete: SERSavingsComplete
        });
    } else {
        SERSavingsPopulate(SERData);
        $.mobile.changePage('ser.html', {
            transition: "slide"
        });
    }

    //var msg={"d":{"__type":"Bge.Canp.Ui.AjaxData.SERSavingsSummary","SavingsSeason":"2013","SavingsDay":"April 11","SavingsDayEarnings":"$0.88","SavingsDayKWH":"0.7 kWh","TotalSeasonSavings":"$0.88","BGESERSavingList":[{"SavingsDate":"April 09, 2013","TypicalUsage":2.3,"ActualUsage":5.9,"EnergySavings":0,"MoneySavings":"$0.00","CalculationMethod":"ACTUAL"},{"SavingsDate":"April 11, 2013","TypicalUsage":2.1,"ActualUsage":1.4,"EnergySavings":0.7,"MoneySavings":"$0.88","CalculationMethod":"ACTUAL"},{"SavingsDate":"TOTAL","TypicalUsage":4.39999962,"ActualUsage":7.3,"EnergySavings":0.7,"MoneySavings":"$0.88","CalculationMethod":null}],"ErrorCode":null,"ErrorMessage":null}}
    //SERSavingsPopulate(msg);
}

function DisplaySERSavingsError() {
    // take away wait symbol and display error message

    //$('#uiOpowerErrorTxt').html(findMessage('SER_PARTIAL_ERROR')); // Partial Data Error

    $('#uiNotEnrolledSER').addClass('hidden');
    $('#uiLastSavingDays').addClass('hidden');
    $('#uiEnergySavingsPnl').addClass('hidden');

    $('.serpageclass').addClass('hidden');
    $('#uiNoDataandError').removeClass('hidden');

}

function SERSavingsPopulate(msg) {
    SERData = msg;
    $.mobile.showPageLoadingMsg();
    if (jQuery.isEmptyObject(msg.d)) {
        DisplaySERSavingsError();
        return;
    } else if (msg.d.ErrorCode == "E00225") {
        //not enrolled in ser
        $('#uiNotEnrolledSER').removeClass('hidden');
        $('#uiLastSavingDays').addClass('hidden');
        $('#uiEnergySavingsPnl').addClass('hidden');
        $('.serpageclass').addClass('hidden');
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        DisplaySERSavingsError();
        return;
    }
    $('#uiGreyHeaderClass').removeClass('greyheaderclass');
    $('.serpageclass').removeClass('hidden');

    $('#uiSavingsDay').text(msg.d.SavingsDay);
    $('#uiTotalSavings').text(msg.d.TotalSeasonSavings);

    if (msg.d.SavingsDayKWH == "-1 kWh") {
        $('#noEnoughData').removeClass('hidden');
        $('#serwithdata').addClass('hidden');
        //error message with icon--TBD
    } else {
        $('#noEnoughData').addClass('hidden');
        $('#serwithdata').removeClass('hidden');

        $('#SMDetails').show();
        if (msg.d.SavingsDayKWH != "0 kWh" && msg.d.SavingsDayEarnings == "$0.00")
            $('#uisavingsMoney').text("*");
        else
            $('#uisavingsMoney').text(msg.d.SavingsDayEarnings);
        $('#uisavingsKWH').text(msg.d.SavingsDayKWH);
    }
    //$('#uiSavingsYear').text(msg.d.SavingsSeason);

    /* var strSavingsMsg = $('#uisavingsMsg').text();
    var n = strSavingsMsg.indexOf("available");
    if (n > 0) {
    $('#uisavingsMsg').css({ 'font-size': '12px' });
    $("#uiSavingsYear").append('&nbsp;');
    $("#uiSavingsDay").append('&nbsp;');
    }
    else
    $('#uisavingsMsg').css({ 'font-size': '20px' });
    */
    if (msg.d.BGESERSavingList != null && msg.d.BGESERSavingList.length > 0) {
        $('#uiLastSavingDays').removeClass('hidden');
        $('#uiEnergySavingsPnl').removeClass('hidden');
        if (msg.d.BGESERSavingList.length > 3)
            $('#uiLastSavingDays').text("RECENT ENERGY SAVINGS DAY RESULTS");
        else
            $('#uiLastSavingDays').text("ENERGY SAVINGS DAY RESULTS");

        $('#uiSERHistory').empty();
        var historyCount = 0;
        if (msg.d.BGESERSavingList[0].SavingsDate != 'TOTAL')
            msg.d.BGESERSavingList = msg.d.BGESERSavingList.reverse();

        $.each(msg.d.BGESERSavingList, function (idx) {

            if (historyCount < 3) {
                if (this.SavingsDate != "TOTAL") {
                    if (this.TypicalUsage == "0")
                        this.TypicalUsage = "*";
                    if (this.ActualUsage == "0")
                        this.ActualUsage = "*";
                    if (this.EnergySavings == "0")
                        this.EnergySavings = "*";
                    if (this.MoneySavings == "$0.00")
                        this.MoneySavings = "*";
                    $('#uiSERHistory').append('<li><div class="ui-grid-a">' +
						'<div class="ui-block-a" style="text-align:left;height:10px" >Savings Day:</div>' +
						'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.SavingsDate + '</div>' +
						'<div class="ui-block-a" style="text-align:left;height:10px">Energy Savings:</div>' +
						'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.EnergySavings + ' kWh' + '</div>' +
						'<div class="ui-block-a" style="text-align:left;height:10px">Credits:</div>' +
						'<div class="ui-block-b" style="text-align:right;font-weight:normal;" >' + this.MoneySavings + '</div>' +
						'</div>' +
						'</li>');

                    historyCount = historyCount + 1;

                    if (this.ActualUsage == "*")
                        $('#uiShowAsterix').removeClass('hidden');

                }

            }
        });

    }
    if ($('#uiSERHistory li').length != 0) {
        $('#uiSERHistory').listview('refresh');
    }

}

function SERSavingsError(xhr, ajaxOptions, thrownError) {
    DisplaySERSavingsError();
}

function SERSavingsComplete(xhr, status) {
    if (status == 'timeout') {
        DisplaySERSavingsError();
    }
    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage('ser.html', {
        transition: "slide"
    });
}

/*
prasad NOTIFICATIONS
*/

var selectedNotification;
var selectedNotificationAlerts;
var selectedNotificationOption;
var notifications;
var channels;
//var channelsTypes = { "EMAIL1": "EMAIL", "EMAIL2": "EMAIL", "SMS": "Text/SMS", "DIALER": "Primary", "ALTDIALER": "Alternate" };
var channelsTypes = {
    "EMAIL1": "Primary",
    "EMAIL2": "Secondary",
    "SMS": "Text/SMS",
    "DIALER": "Primary",
    "ALTDIALER": "Alternate"
};
var channelsOrder = new Array("EMAIL1", "EMAIL2", "SMS", "DIALER", "ALTDIALER");
var notificationGroups = {
    "SER": "Energy Savings Day",
    "PKR": "PeakRewards Events",
    "SEM": "Unusual Usage Alerts",
    "SEV": "Severe Weather Notifications",
    "BIP": "Billing and Payments"
};
//var notificationGroups = { "SER": "ENERGY SAVINGS DAY", "PKR": "PEAKREWARDS EVENTS", "SEM": "UNUSUAL USAGE ALERTS", "SEV": "SEVERE WEATHER NOTIFICATIONS", "BIP": "BILLING AND PAYMENTS" };
//var billPaymentsNotifications = new Array("Payments Alerts", "Account Change Alerts", "Recurring Payment Alerts");
var billPaymentsNotifications = new Array("Payments", "Account Change", "Recurring Payment");

$(document).on('pageshow', '#notification-page', function (event) {
    $(function () {

        $('.notificationsclick').click(function () {
            selectedNotification = this.id;
            localStorage['storedNotification'] = this.id;
            selectedNotificationAlerts = $(this).text();
            localStorage['storedNotificationAlerts'] = $(this).text();

            if (selectedNotification != null)
                $.mobile.changePage('notification-summary.html', {
                    transition: "slide"
                });
        });
    });

});

var noof_Days;
var optout;

/*$(document).on('pageshow', '#notificationsummary-page', function (event) {
if(notifications==null || jQuery.isEmptyObject(notifications)){
$.mobile.loadPage('notifications.html', { prefetch: "true" });
NotificationsData=null;
getPersonNotifications();
return;
}
});*/

function notificationsummaryBefore() {
    //getPersonNotifications();
    //setGrayHeader();
    if (notifications == null || jQuery.isEmptyObject(notifications)) {

        notifications = JSON.parse(localStorage['notifications']);
        noof_Days = notifications.NotificationDaysBeforeDueDate
    }
    $(".serviceaddressclass").empty();
    if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
        $(".serviceaddressclass").append('<strong><span>Account Number: </strong><label id="lblaccountid"> ' + CurrentAccountSummary.AccountId + '</label></span></br>');

        if (CurrentAccountSummary.MailAddress[0] != null) {
            $('#uiPremiseSingle').text(CurrentAccountSummary.MailAddress[0]);
            $(".serviceaddressclass").append('<span><label id="uiPremiseSingle" > ' + CurrentAccountSummary.MailAddress[0] + '</label></span>');
        }
    }

    if (jQuery.isEmptyObject(selectedNotification)) {
        selectedNotification = localStorage['storedNotification'];
    }
    if (jQuery.isEmptyObject(selectedNotificationAlerts)) {
        selectedNotificationAlerts = localStorage['storedNotificationAlerts'];
    }

    $('#uiUpdateError').addClass('hidden');
    if (selectedNotification != null) {

        if (!jQuery.isEmptyObject(selectedNotificationAlerts)) {
            if (selectedNotificationAlerts.indexOf('Alerts') == -1) {
                $('#notifsummaryheader').text('SET ' + selectedNotificationAlerts.toUpperCase() + ' ALERTS');
            } else {
                $('#notifsummaryheader').text('SET ' + selectedNotificationAlerts.toUpperCase());
            }
        }

        var i = 0;
        var notificationOptions = $('#notificationMulti');
        notificationOptions.empty();

        $('#uiNotificationChannels').empty();

        if (selectedNotification != "BIP") {
            $.each(notifications.NotificationPrefernces, function (idx) {

                if (notifications.NotificationPrefernces[idx].group == selectedNotification) {

                    var updatedLabelValue = notifications.NotificationPrefernces[idx].description;

                    if (updatedLabelValue.indexOf('Notify with') != -1)
                        updatedLabelValue = updatedLabelValue.replace('Notify with', '');
                    else if (updatedLabelValue.indexOf('Notify about') != -1)
                        updatedLabelValue = updatedLabelValue.replace('Notify about', '');

                    if (updatedLabelValue.indexOf('in my area') != -1)
                        updatedLabelValue = updatedLabelValue.replace('in my area', '');

                    if (selectedNotification == "SEM") {
                        if (updatedLabelValue.indexOf('Alerts') != -1)
                            updatedLabelValue = updatedLabelValue.replace('Alerts', '');
                    }

                    /*notificationOptions.append('<option value=' + notifications.NotificationPrefernces[idx].type + '>' + notifications.NotificationPrefernces[idx].description + '</option>');
                    $('#notificationSingle').text(notifications.NotificationPrefernces[idx].description);
                    $('#notificationSingle').val(notifications.NotificationPrefernces[idx].type);*/

                    notificationOptions.append('<option value=' + notifications.NotificationPrefernces[idx].type + '>' + updatedLabelValue + '</option>');
                    $('#notificationSingle').text(updatedLabelValue);
                    $('#notificationSingle').val(notifications.NotificationPrefernces[idx].type);
                    i++;
                }
            });
        } else {

            for (var j = 0; j < billPaymentsNotifications.length; j++) {
                notificationOptions.append('<option value=' + billPaymentsNotifications[j] + '>' + billPaymentsNotifications[j] + '</option>');
                $('#notificationSingle').text(billPaymentsNotifications[j]);
                i++;
            }

        }

        if (i > 1) {
            $('#notificationSingle').addClass('hidden');
            $('#notimulti').removeClass('hidden');
            $('#notificationMulti option:first-child').attr('selected', 'selected');
            $('#notificationMulti').selectmenu('refresh');
            selectedNotificationOption = $('#notificationMulti').val();

        } else {
            $('#notificationSingle').removeClass('hidden');
            $('#notimulti').addClass('hidden');
            selectedNotificationOption = $('#notificationSingle').text();
        }

        changeNotificationChannels();

    }
}

$(document).on('pageinit', '#notificationsummary-page', function (event) {
    //setGrayHeader();

    var $currentPage = $(event.target);

    var $form = $currentPage.find("form#notificationsummary-form");

    var validator_outage = $form.validate({
        submitHandler: function (form) {

            //notification update

            var notificationData = new Array();
            var channelsData = new Array();
            var count = 0;
            if (selectedNotification == 'BIP') {
                $('.updateChannel').each(function () {

                    var keyValue;
                    //alert(this.id);
                    if (this.checked) {
                        keyValue = this.id + ":" + 'A';
                        notificationData[count] = keyValue;

                    } else {
                        keyValue = this.id + ":" + 'I';
                        notificationData[count] = keyValue;
                    }
                    count++;
                });
            } else {
                var channelcount = 0;
                //alert("selection is not Billing & Payment");
                $('.updateChannel').each(function () {
                    var keyValue1;

                    if (this.checked) {
                        keyValue1 = this.id + ":" + 'A';

                        notificationData[channelcount] = keyValue1;

                    } else {
                        keyValue1 = this.id + ":" + 'I';
                        notificationData[channelcount] = keyValue1;

                    }

                    channelcount++;
                });

            }

            if ($('#uiNoOfDaysBefore').val() != noof_Days && !jQuery.isEmptyObject($('#uiNoOfDaysBefore').val()))
                noof_Days = $('#uiNoOfDaysBefore').val();
            //optoutdefault
            var optOutValue;
            if ($('#optoutdefault').is(':checked')) {
                optOutValue = true;
            } else {
                optOutValue = false;
            }

            var notificationMetadata = {
                "GroupName": selectedNotification,
                "TypeName": $('#notificationMulti option:selected').val(),
                "NotificationFormData": notificationData,
                "noofdays": noof_Days,
                "optout": optOutValue

            };

            updateNotifications(notificationMetadata);
        }
    });

});

function changeNotificationChannels() {
    //channels
    // selectedNotificationOption = $('#notificationMulti').val();


    if ($.isEmptyObject(selectedNotificationOption) && !$.isEmptyObject(localStorage['storedNotificationOption'])) {
        selectedNotificationOption = localStorage['storedNotificationOption'];
    } else {
        selectedNotificationOption = $('#notificationMulti option:selected').text();
        localStorage['storedNotificationOption'] = $('#notificationMulti option:selected').text();
    }

    //alert(selectedNotificationOption);

    $('#uiNotificationChannels').empty();
    $('#uiNotificationChannelsEmail').empty();
    $('#uiNotificationChannelsSMS').empty();
    $('#uiNotificationChannelsPhone').empty();

    if (selectedNotification != "BIP") {
        $('#fieldsetBP').addClass('hidden');
        //$('#fieldsetEmail').removeClass('hidden');
        //$('#fieldsetSMS').removeClass('hidden');
        //$('#fieldsetPhone').removeClass('hidden');

        $.each(notifications.NotificationPrefernces, function (idx) {

            if (notifications.NotificationPrefernces[idx].group == selectedNotification) {

                var truncatedSelectedOption = notifications.NotificationPrefernces[idx].description;
                if (truncatedSelectedOption.indexOf('Notify with') != -1)
                    truncatedSelectedOption = truncatedSelectedOption.replace('Notify with', '');
                else if (truncatedSelectedOption.indexOf('Notify about') != -1)
                    truncatedSelectedOption = truncatedSelectedOption.replace('Notify about', '');

                if (truncatedSelectedOption.indexOf('in my area') != -1)
                    truncatedSelectedOption = truncatedSelectedOption.replace('in my area', '');

                if (selectedNotification == "SEM") {
                    if (truncatedSelectedOption.indexOf('Alerts') != -1)
                        truncatedSelectedOption = truncatedSelectedOption.replace('Alerts', '');
                }

                if (truncatedSelectedOption == selectedNotificationOption) {

                    /*for (var i = 0; i < channelsOrder.length; i++) {
                    $.each(notifications.NotificationPrefernces[idx].channels, function (idxx) {

                    if (channelsOrder[i] == notifications.NotificationPrefernces[idx].channels[idxx].channel_type)

                    if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {

                    $('#uiNotificationChannels').append('<li> <div style="margin-top:18px;"><input type="checkbox" disabled checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + ' style="left:90%;position:relative;" class="custom updateChannel" /><label for=channel' + idxx + '>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '</label></div></li>');
                    }
                    else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                    $('#uiNotificationChannels').append('<li> <div style="margin-top:18px;"><input type="checkbox" checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + ' style="left:90%;position:relative;" class="custom updateChannel" /><label for=channel' + idxx + '>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '</label></div></li>');
                    }
                    else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                    $('#uiNotificationChannels').append('<li> <div style="margin-top:18px;"><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + ' style="left:90%;position:relative;" class="custom updateChannel" /><label for=channel' + idxx + '>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '</label></div></li>');
                    }
                    });
                    }*/

                    var emailFound = false;
                    for (var i = 0; i < 2; i++) {

                        $.each(notifications.NotificationPrefernces[idx].channels, function (idxx) {

                            if (channelsOrder[i] == notifications.NotificationPrefernces[idx].channels[idxx].channel_type) {
                                emailFound = true;
                                var channelvalue = null;
                                $.each(notifications.channelsValues, function (idxxx) {

                                    if (channelsOrder[i] == notifications.channelsValues[idxxx].channel_type)
                                        channelvalue = notifications.channelsValues[idxxx].channel_value;
                                });

                                if (jQuery.isEmptyObject(channelvalue))
                                    channelvalue = "";

                                if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                    $('#uiNotificationChannelsEmail').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;text-overflow: ellipsis;overflow: hidden;max-width: 160px!important;font-weight:normal!important;">' + channelvalue + '</div></label></fieldset></div></li>');
                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                    if (optout)
                                        $('#uiNotificationChannelsEmail').append('<li><div class="noborder"><fieldset><label><input type="checkbox"  name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;text-overflow: ellipsis;overflow: hidden;max-width: 160px!important;font-weight:normal!important;">' + channelvalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsEmail').append('<li><div class="noborder"><fieldset><label><input type="checkbox" checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;text-overflow: ellipsis;overflow: hidden;max-width: 160px!important;font-weight:normal!important;">' + channelvalue + '</div></label></fieldset></div></li>');
                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                                    if (channelvalue != '')
                                        $('#uiNotificationChannelsEmail').append('<li><div class="noborder"><fieldset><label><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;text-overflow: ellipsis;overflow: hidden;max-width: 160px!important;font-weight:normal!important;">' + channelvalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsEmail').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;text-overflow: ellipsis;overflow: hidden;max-width: 160px!important;font-weight:normal!important;">' + channelvalue + '</div></label></fieldset></div></li>');

                                }
                            }
                        });
                    }

                    if (emailFound == true)
                        $('#fieldsetEmail').removeClass('hidden');
                    var smsFound = false;
                    for (var i = 2; i < 3; i++) {

                        $.each(notifications.NotificationPrefernces[idx].channels, function (idxx) {

                            if (channelsOrder[i] == notifications.NotificationPrefernces[idx].channels[idxx].channel_type) {
                                smsFound = true;
                                var SMSvalue = null;
                                $.each(notifications.channelsValues, function (idxxx) {

                                    if (channelsOrder[i] == notifications.channelsValues[idxxx].channel_type)
                                        SMSvalue = notifications.channelsValues[idxxx].channel_value;
                                });

                                if (jQuery.isEmptyObject(SMSvalue))
                                    SMSvalue = "";
                                if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                    //$('#uiNotificationChannelsSMS').append('<li> <label style="margin-left:-20px;"><input style="margin-left:-20px;" type="checkbox" disabled checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '</label><span style="float:right;">' + SMSvalue + '</span></li>');
                                    $('#uiNotificationChannelsSMS').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + SMSvalue + '</div></label></fieldset></div></li>');

                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                    if (optout)
                                        $('#uiNotificationChannelsSMS').append('<li><div class="noborder"><fieldset><label><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + SMSvalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsSMS').append('<li><div class="noborder"><fieldset><label><input type="checkbox" checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + SMSvalue + '</div></label></fieldset></div></li>');

                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                                    //$('#uiNotificationChannelsSMS').append('<li> <label style="margin-left:-20px;"><input style="margin-left:-20px;" type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '</label><span style="float:right;">' + SMSvalue + '</span></li>');
                                    if (SMSvalue != '')
                                        $('#uiNotificationChannelsSMS').append('<li><div class="noborder"><fieldset><label><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + SMSvalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsSMS').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + SMSvalue + '</div></label></fieldset></div></li>');

                                }
                            }
                        });
                    }
                    if (smsFound == true)
                        $('#fieldsetSMS').removeClass('hidden');
                    var phoneFound = false;
                    for (var i = 3; i < 5; i++) {

                        $.each(notifications.NotificationPrefernces[idx].channels, function (idxx) {

                            if (channelsOrder[i] == notifications.NotificationPrefernces[idx].channels[idxx].channel_type) {
                                phoneFound = true;
                                var phonevalue = null;
                                $.each(notifications.channelsValues, function (idxxx) {

                                    if (channelsOrder[i] == notifications.channelsValues[idxxx].channel_type)
                                        phonevalue = notifications.channelsValues[idxxx].channel_value;
                                });

                                if (jQuery.isEmptyObject(phonevalue))
                                    phonevalue = "";

                                if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {

                                    $('#uiNotificationChannelsPhone').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + phonevalue + '</div></label></fieldset></div></li>');

                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                    if (optout)
                                        $('#uiNotificationChannelsPhone').append('<li><div class="noborder"><fieldset><label><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + phonevalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsPhone').append('<li><div class="noborder"><fieldset><label><input type="checkbox" checked name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + phonevalue + '</div></label></fieldset></div></li>');
                                } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                                    if (phonevalue != '')
                                        $('#uiNotificationChannelsPhone').append('<li><div class="noborder"><fieldset><label><input type="checkbox" name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + phonevalue + '</div></label></fieldset></div></li>');
                                    else
                                        $('#uiNotificationChannelsPhone').append('<li><div class="noborder disabledClass"><fieldset><label><input type="checkbox" disabled name=channel' + idxx + ' id=' + notifications.NotificationPrefernces[idx].channels[idxx].channel_type + '  class="custom updateChannel"/>' + channelsTypes[notifications.NotificationPrefernces[idx].channels[idxx].channel_type] + '<div style="float:right;font-weight:normal!important;">' + phonevalue + '</div></label></fieldset></div></li>');

                                }
                            }
                        });
                    }
                    if (phoneFound == true)
                        $('#fieldsetPhone').removeClass('hidden');
                }
            }

        });
    } else {

        $('#fieldsetBP').removeClass('hidden');
        $('#fieldsetEmail').addClass('hidden');
        $('#fieldsetSMS').addClass('hidden');
        $('#fieldsetPhone').addClass('hidden');

        var startPosition = 0;
        var endPosition = 0;
        for (var k = 0; k < billPaymentsNotifications.length; k++) {

            if (billPaymentsNotifications[k] == selectedNotificationOption) {

                if (k == 0) {
                    startPosition = 1;
                    endPosition = 4;
                    $('#uiMandatoryAsterix').addClass('hidden');
                    $('#uiNotificationsButtons').removeClass('hidden');
                    $('#uiBPNotificationsButtons').addClass('hidden');
                } else if (k == 1) {
                    startPosition = 5;
                    endPosition = 9;
                    $('#uiMandatoryAsterix').removeClass('hidden');
                    $('#uiNotificationsButtons').addClass('hidden');
                    $('#uiBPNotificationsButtons').removeClass('hidden');

                } else {
                    startPosition = 10;
                    endPosition = 12;
                    $('#uiMandatoryAsterix').removeClass('hidden');
                    $('#uiNotificationsButtons').addClass('hidden');
                    $('#uiBPNotificationsButtons').removeClass('hidden');

                }

            }
        }

        $.each(notifications.channelsValues, function (idxxx) {

            if ("EMAIL1" == notifications.channelsValues[idxxx].channel_type)
                $('#emailIdforChannel').text(notifications.channelsValues[idxxx].channel_value);
        });

        for (var m = startPosition; m <= endPosition; m++) {

            $.each(notifications.NotificationPrefernces, function (idx) {

                if (notifications.NotificationPrefernces[idx].group == "BIP" && notifications.NotificationPrefernces[idx].type == ('BIP_TYPE' + m)) {

                    $.each(notifications.NotificationPrefernces[idx].channels, function (idxx) {

                        var bpNotificationTrunOption = notifications.NotificationPrefernces[idx].description;

                        if (bpNotificationTrunOption.indexOf('Notify when a') != -1)
                            bpNotificationTrunOption = bpNotificationTrunOption.replace('Notify when a', '');
                        else if (bpNotificationTrunOption.indexOf('Notify when') != -1)
                            bpNotificationTrunOption = bpNotificationTrunOption.replace('Notify when', '');
                        else if (bpNotificationTrunOption.indexOf('Notify x') != -1)
                            bpNotificationTrunOption = bpNotificationTrunOption.replace('Notify x', '');

                        if (notifications.NotificationPrefernces[idx].type == 'BIP_TYPE1') {

                            if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                $('#uiNotificationChannels').append('<li class="display-inline"><div class="noborder no-label disabledClass"><fieldset><label><input type="checkbox" disabled checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom ui-hide-label updateChannel"/> </label></fieldset></div><div class=billingpayments><select id="uiNoOfDaysBefore" data-icon="false"></select></div><div style="padding-left:5px;font-size:11px;text-transform: capitalize;font-weight:normal!important;">' + bpNotificationTrunOption + '</div></li>');

                            } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                if (optout)
                                    $('#uiNotificationChannels').append('<li class="display-inline"><div class="noborder no-label"><fieldset><label><input type="checkbox" name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom ui-hide-label updateChannel"/> </label></fieldset></div><div class=billingpayments><select id="uiNoOfDaysBefore" data-icon="false" ></select></div><div style="padding-left:5px;font-size:11px;text-transform: capitalize;font-weight:normal!important;">' + bpNotificationTrunOption + '</div></li>');
                                else
                                    $('#uiNotificationChannels').append('<li class="display-inline"><div class="noborder no-label"><fieldset><label><input type="checkbox" checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom ui-hide-label updateChannel"/> </label></fieldset></div><div class=billingpayments><select id="uiNoOfDaysBefore" data-icon="false"></select></div><div style="padding-left:5px;font-size:11px;text-transform: capitalize;font-weight:normal!important;">' + bpNotificationTrunOption + '</div></li>');
                            } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                                $('#uiNotificationChannels').append('<li class="display-inline"><div class="noborder no-label"><fieldset><label><input type="checkbox" name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom ui-hide-label updateChannel"/> </label></fieldset></div><div class=billingpayments><select id="uiNoOfDaysBefore" data-icon="false"></select></div><div style="padding-left:5px;font-size:11px;text-transform: capitalize;font-weight:normal!important;">' + bpNotificationTrunOption + '</div></li>');

                            }
                            var pselectNoOfDays = $('#uiNoOfDaysBefore');
                            pselectNoOfDays.empty();

                            for (var i = 0; i < noOfDaysBeforeArray.length; i++) {
                                pselectNoOfDays.append('<option value=' + noOfDaysBeforeArray[i] + '>' + noOfDaysBeforeArray[i] + '</option>');
                            }
                            $('#uiNoOfDaysBefore').selectmenu();
                            $('#uiNoOfDaysBefore').trigger('create');
                            $('#uiNoOfDaysBefore').val(noof_Days);
                            $('#uiNoOfDaysBefore').selectmenu('refresh');


                        } else {

                            if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'Y' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                //$('#uiNotificationChannels').append('<li>  <input  type="checkbox" disabled checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/> <label for=BIP_TYPE'+m+'><span>' + notifications.NotificationPrefernces[idx].description + '</span></label></li>');
                                $('#uiNotificationChannels').append('<li><div class="noborder disabledClass notifBPLabels" ><fieldset><label style="text-transform: capitalize;font-weight:normal!important;"><input  type="checkbox" disabled checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/><font color = "red" >*</font>' + bpNotificationTrunOption + '</label><fieldset><div></li>');
                            } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'A') {
                                //$('#uiNotificationChannels').append('<li>  <input type="checkbox" checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/><label for=BIP_TYPE'+m+'><span>' + notifications.NotificationPrefernces[idx].description + '</span></label></li>');
                                if (optout)
                                    $('#uiNotificationChannels').append('<li><div class="noborder" ><fieldset><label style="text-transform: capitalize;font-weight:normal!important;"><input  type="checkbox" name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/>' + bpNotificationTrunOption + '</label><fieldset><div></li>');
                                else
                                    $('#uiNotificationChannels').append('<li><div class="noborder" ><fieldset><label style="text-transform: capitalize;font-weight:normal!important;"><input  type="checkbox" checked name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/>' + bpNotificationTrunOption + '</label><fieldset><div></li>');

                            } else if (notifications.NotificationPrefernces[idx].channels[idxx].required == 'N' && notifications.NotificationPrefernces[idx].channels[idxx].status == 'I') {
                                //$('#uiNotificationChannels').append('<li>  <input type="checkbox" name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + '  class="custom updateChannel"/><label for=BIP_TYPE'+m+'><span>' + notifications.NotificationPrefernces[idx].description + '</span></label></li>');
                                $('#uiNotificationChannels').append('<li><div class="noborder" ><fieldset><label style="text-transform: capitalize;font-weight:normal!important;"><input  type="checkbox" name=BIP_TYPE' + m + ' id=BIP_TYPE' + m + ' class="custom updateChannel"/>' + bpNotificationTrunOption + '</label><fieldset><div></li>');


                            }

                        }

                    });
                }
            });
        }

    }
    $('[data-role=listview]').listview('refresh');
    /* $('#uiNotificationChannelsSMS').listview('refresh');
    $('#uiNotificationChannels').listview('refresh');
    $('#uiNotificationChannels').listview('refresh');*/

    if (optout) {
        if (!$('#optoutdefault').is(':checked'))
            $('#optoutdefault').click();
        //$('#optoutdefault').attr('checked','checked');
        //$('#optoutdefault').attr('checked',true);
        $('#optoutdefault').trigger('create');

    }
    $('#notificationsummary-page').trigger('create');
}

function getPersonNotifications() {
    //var msg={"d":{"__type":"Bge.Canp.Ui.AjaxData.Notifications","NotificationPrefernces":[{"channels":[{"channel_type":"SMS","status":"I","required":"N"},{"channel_type":"EMAIL1","status":"I","required":"N"},{"channel_type":"EMAIL2","status":"I","required":"N"},{"channel_type":"DIALER","status":"I","required":"N"},{"channel_type":"ALTDIALER","status":"I","required":"N"}],"group":"SER","description":"Notify about Energy Savings Day","type":"SER_TYPE1"},{"channels":[{"channel_type":"EMAIL2","status":"I","required":"N"},{"channel_type":"EMAIL1","status":"I","required":"N"},{"channel_type":"ALTDIALER","status":"I","required":"N"},{"channel_type":"SMS","status":"I","required":"N"},{"channel_type":"DIALER","status":"I","required":"N"}],"group":"SER","description":"Notify with Energy Savings Day results","type":"SER_TYPE2"},{"channels":[{"channel_type":"EMAIL2","status":"I","required":"N"},{"channel_type":"SMS","status":"I","required":"N"},{"channel_type":"EMAIL1","status":"I","required":"N"}],"group":"PKR","description":"Notify about PeakRewards Air Conditioning cycling events","type":"PKR_TYPE1"},{"channels":[{"channel_type":"EMAIL1","status":"I","required":"N"},{"channel_type":"SMS","status":"I","required":"N"},{"channel_type":"EMAIL2","status":"I","required":"N"}],"group":"PKR","description":"Notify about PeakRewards Electric Water Heater cycling events","type":"PKR_TYPE2"},{"channels":[{"channel_type":"ALTDIALER","status":"I","required":"N"},{"channel_type":"EMAIL2","status":"I","required":"N"},{"channel_type":"EMAIL1","status":"I","required":"N"},{"channel_type":"SMS","status":"I","required":"N"},{"channel_type":"DIALER","status":"I","required":"N"}],"group":"SEM","description":"Notify about Unusual Usage Alerts","type":"SEM_TYPE1"},{"channels":[{"channel_type":"EMAIL2","status":"I","required":"N"},{"channel_type":"EMAIL1","status":"I","required":"N"},{"channel_type":"ALTDIALER","status":"I","required":"N"},{"channel_type":"DIALER","status":"I","required":"N"},{"channel_type":"SMS","status":"I","required":"N"}],"group":"SEV","description":"Notify about severe weather in my area","type":"SEV_TYPE1"},{"channels":[{"channel_type":"EMAIL1","status":"I","required":"N"}],"group":"BIP","description":"Notify x days before a payment is due","type":"BIP_TYPE1"},{"channels":[{"channel_type":"EMAIL1","status":"I","required":"N"}],"group":"BIP","description":"Notify when a payment has been made","type":"BIP_TYPE2"},{"channels":[{"channel_type":"EMAIL1","status":"I","required":"N"}],"group":"BIP","description":"Notify when a payment is scheduled","type":"BIP_TYPE3"},{"channels":[{"channel_type":"EMAIL1","status":"I","required":"N"}],"group":"BIP","description":"Notify when a recurring payment is created","type":"BIP_TYPE4"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when my BGE bill is ready","type":"BIP_TYPE5"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a change is made to my information","type":"BIP_TYPE6"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a payment is unsuccessful","type":"BIP_TYPE7"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a bank account validation is successful","type":"BIP_TYPE8"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a bank account validation is unsuccessful","type":"BIP_TYPE9"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a recurring payment is scheduled","type":"BIP_TYPE10"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when total amount due is greater than my recurring payment maximum amount","type":"BIP_TYPE11"},{"channels":[{"channel_type":"EMAIL1","status":"A","required":"Y"}],"group":"BIP","description":"Notify when a recurring payment is unsuccessful.","type":"BIP_TYPE12"}],"channelsValues":[{"channel_type":"EMAIL1","channel_value":"yours@constellation.com"},{"channel_type":"EMAIL2","channel_value":null},{"channel_type":"SMS","channel_value":"(410)-470-1484"},{"channel_type":"DIALER","channel_value":null},{"channel_type":"ALTDIALER","channel_value":null}],"NotificationPreferncesGroups":["SER","PKR","SEM","SEV","BIP"],"todayDate":null,"source":null,"loginUserId":null,"ErrorCode":null,"ErrorMessage":null}}
    //NotificationPopulate(msg);
    $.mobile.showPageLoadingMsg();
    //$.mobile.loadPage('notifications.html', { prefetch: "true" });
    if (jQuery.isEmptyObject(NotificationsData)) {
        $.ajax({
            type: "POST",
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetNotifications",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            timeout: CanpAjaxTO,
            global: false,
            success: NotificationPopulate,
            error: NotificationError,
            complete: NotificationComplete
        });
    } else {

        NotificationPopulate(NotificationsData);
        $.mobile.changePage('notifications.html', { transition: "slide" });
        $.mobile.hidePageLoadingMsg();
    }
}

function NotificationPopulate(msg) {
    NotificationsData = msg;
    $.mobile.showPageLoadingMsg();
    notifications = msg.d;
    localStorage['notifications'] = JSON.stringify(msg.d);
    if (notifications.NotificationDaysBeforeDueDate != null && notifications.NotificationDaysBeforeDueDate > 1) {
        noof_Days = notifications.NotificationDaysBeforeDueDate;
    } else {
        noof_Days = 1;
    }
    if (notifications.NotificationOptOpt != null) {
        optout = notifications.NotificationOptOpt;
    } else {
        optout = false;
    }
    if (jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#uiPersonNotifications').removeClass('hidden');
        //$('#uiMandatoryAsterix').removeClass('hidden');
        $('#uiNoNotifications').addClass('hidden');
        fillNotifications();
    } else {
        $('#uiPersonNotifications').addClass('hidden');
        //$('#uiMandatoryAsterix').addClass('hidden');
        $('#uiNoNotifications').removeClass('hidden');
    }
}
function NotificationError(xhr, ajaxOptions, thrownError) {
    $('#uiPersonNotifications').addClass('hidden');
    //$('#uiMandatoryAsterix').addClass('hidden');
    $('#uiNoNotifications').removeClass('hidden');
    $.mobile.hidePageLoadingMsg();
}
function NotificationComplete(xhr, status) {
    if (status == 'timeout' || status != 'success') {
        $('#uiPersonNotifications').addClass('hidden');
        //$('#uiMandatoryAsterix').addClass('hidden');
        $('#uiNoNotifications').removeClass('hidden');
    }
    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage('notifications.html', {
        transition: "slide"
    });
}

function fillNotifications() {
    if (!jQuery.isEmptyObject(notifications)) {

        //get the groups/notification groups

        $('#uiPersonNotifications').empty();
        $.each(notifications.NotificationPreferncesGroups, function (idx) {
            if (viewModel.accountSummary != null && viewModel.accountSummary.isPeakRewardsCustomer && notificationGroups[notifications.NotificationPreferncesGroups[idx]] == 'PeakRewards Events') {
                $('#uiPersonNotifications').append('<li class="lvheight"><a href=notification-summary.html class=notificationsclick id=' + notifications.NotificationPreferncesGroups[idx] + ' data-transition=slide>' + notificationGroups[notifications.NotificationPreferncesGroups[idx]] + '</a></li>').trigger('create');
            } else if (viewModel.accountSummary != null && viewModel.accountSummary.IsSER != null && notificationGroups[notifications.NotificationPreferncesGroups[idx]] == 'Energy Savings Day') {
                $('#uiPersonNotifications').append('<li class="lvheight"><a href=notification-summary.html class=notificationsclick id=' + notifications.NotificationPreferncesGroups[idx] + ' data-transition=slide>' + notificationGroups[notifications.NotificationPreferncesGroups[idx]] + '</a></li>').trigger('create');
            } else if (viewModel.accountSummary != null && viewModel.accountSummary.IsAMI && notificationGroups[notifications.NotificationPreferncesGroups[idx]] == 'Unusual Usage Alerts') {
                $('#uiPersonNotifications').append('<li class="lvheight"><a href=notification-summary.html class=notificationsclick id=' + notifications.NotificationPreferncesGroups[idx] + ' data-transition=slide>' + notificationGroups[notifications.NotificationPreferncesGroups[idx]] + '</a></li>').trigger('create');
            } else if (notificationGroups[notifications.NotificationPreferncesGroups[idx]] != 'Unusual Usage Alerts' && notificationGroups[notifications.NotificationPreferncesGroups[idx]] != 'Energy Savings Day' && notificationGroups[notifications.NotificationPreferncesGroups[idx]] != 'PeakRewards Events') {
                $('#uiPersonNotifications').append('<li class="lvheight"><a href=notification-summary.html class=notificationsclick id=' + notifications.NotificationPreferncesGroups[idx] + ' data-transition=slide>' + notificationGroups[notifications.NotificationPreferncesGroups[idx]] + '</a></li>').trigger('create');
            }
        });


        //$('#uiPersonNotifications').append('<li class="lvheight"><a data-rel="popup" href="#optoutNotifications">Unsubscribe from all Optional Notifications</a></li>');
        $('#uiPersonNotifications').listview('refresh');
    }
}

function updateNotifications(notificationMedadata) {
    $.mobile.showPageLoadingMsg();
    $.support.cors = true;
    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#notificationsummary-form");
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/UpdateNotifications",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(notificationMedadata),
        async: false,
        timeout: CanpAjaxTO,
        global: false,
        success: UpdatePopulate,
        error: UpdateError,
        complete: UpdateComplete
    });
}

function UpdatePopulate(msg) {
    $.mobile.showPageLoadingMsg();
    if (jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#uiUpdateError').addClass('hidden');
        $.mobile.changePage('notification-confirm.html', {
            transition: "slide"
        });

    } else {
        $('#uiUpdateError').removeClass('hidden');
        $("#optoutNotifications").popup("close");
    }

}
function UpdateError(xhr, ajaxOptions, thrownError) {

    $('#uiUpdateError').removeClass('hidden');
    $.mobile.hidePageLoadingMsg();

}
function UpdateComplete(xhr, status) {

    if (status == 'timeout' || status != 'success') {
        $('#uiUpdateError').removeClass('hidden');
    }
    $.mobile.hidePageLoadingMsg();

}

function setGrayHeader() {
    if (jQuery.isEmptyObject(CurrentAccountSummary))
        FetchAccountSummary();

    $(".serviceaddressclass").empty();
    if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
        $(".serviceaddressclass").append('<strong><span>Account Number: </strong><label id="lblaccountid"> ' + CurrentAccountSummary.AccountId + '</label></span></br>');

        if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length == 1 && CurrentAccountSummary.ServiceList[0].Address != "No Data") {
            $('#uiPremiseSingle').text(CurrentAccountSummary.ServiceList[0].Address);
            $(".serviceaddressclass").append('<span><label id="uiPremiseSingle" > ' + CurrentAccountSummary.ServiceList[0].Address + '</label></span>');
        } else if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length > 1) {
            $(".serviceaddressclass").append('<div data-role="fieldcontain" style="display:inline"><span for=uiPremiseSelect>Address :</span><select data-native-menu="false" id="uiPremiseSelect" name="uiPremiseSelect"></select></div>');
            var pselect = $('#uiPremiseSelect');
            pselect.empty();
            $.each(CurrentAccountSummary.ServiceList, function (idx) {
                pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
            });
            $('#uiPremiseSelect option:first-child').attr('selected', 'selected');
            $('#uiPremiseSelect').selectmenu();
            $('#uiPremiseSelect').selectmenu('refresh');
            $('.serviceaddressclass').trigger('create');
            pselect.change(OnChangePremise);
        } else if (CurrentAccountSummary.ServiceList[0].Address == "No Data") {
            $('.greyheaderclass').css('height', '30px')
        }
    }

}

function updateOptOutNotifcations() {
    var notificationDataforOptout = new Array();
    var notificationMetadataforOptout = {
        "GroupName": "",
        "TypeName": "",
        "NotificationFormData": notificationDataforOptout,
        "noofdays": 1,
        "optout": true

    };

    updateNotifications(notificationMetadataforOptout);

}

function validateCustomerAccount() {
    $.support.cors = true;
    $.mobile.showPageLoadingMsg();
    //var $currentPage = $(event.target);
    viewModel.getFromLocal();
    // if (jQuery.isEmptyObject(viewModel.CSSBlocked())) {
    // if (viewModel.CSSBlocked() == null) {
    //var $form = $currentPage.find("form#notificationsummary-form");
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/ValidateCustomerAccount",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        timeout: CanpAjaxTO,
        global: false,
        success: function (msg) {
            if (!jQuery.isEmptyObject(msg.d) && (msg.d.dataArea.AccountBlockedCSS == "" && !(msg.d.dataArea.AccountBlockedCSS == 'CSSACCOUNTBLOCKED'))) {
                viewModel.CSSBlocked(false);
            } else if (msg.d.dataArea.AccountBlockedCSS == 'CSSACCOUNTBLOCKED') {
                viewModel.CSSBlocked(true);
            }
            //viewModel.CSSBlocked(true);
            viewModel.saveToLocal();
            $.mobile.changePage('billing.html', {
                transition: "slide"
            });
        },
        error: function (msg) { },
        complete: function (msg) {
            $.mobile.hidePageLoadingMsg();
        }
    });

    /*} else {
    $.mobile.changePage('billing.html', {
    transition: "slide"
    });
    }*/

}

$(document).on('pageshow', '#billing-page', function (event) {
    $('#uiBilling').listview('refresh');
});
$(document).on('pageshow', '#myprograms-page', function (event) {
    $('#uiPrograms').listview('refresh');
});


function sessionExpired() {
    $.mobile.showPageLoadingMsg();
    var validSession = false;

    var submitdata = new Object();
    submitdata.rand = Math.ceil(Math.random() * 999999);
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/IsValidSession",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(submitdata),
        dataType: "json",
        async: false,
        timeout: CanpAjaxTO,
        global: false,
        success: function (msg) {
            if (!jQuery.isEmptyObject(msg.d.ErrorCode) || msg.d.ErrorCode != null) {
                validSession = true;
                cleanup();
            }
        },
        error: function (msg) {
            validSession = true;
            cleanup();
        }
    });
    return validSession;
}


function validateSession(target_url) {
    $.mobile.showPageLoadingMsg();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/IsValidSession",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        timeout: CanpAjaxTO,
        global: false,
        success: function (msg) {
            if (!jQuery.isEmptyObject(msg.d.ErrorCode) || msg.d.ErrorCode != null) {
                cleanup();
                $.mobile.changePage('signin.html', { transition: "slide" });
            }
            else {
                if (!jQuery.isEmptyObject(target_url) && target_url != null)
                    $.mobile.changePage(target_url, { transition: "slide" });
            }
        },
        error: function (msg) {
            cleanup();
            $.mobile.changePage('signin.html', { transition: "slide" });

        },
        complete: function (msg) {
            $.mobile.hidePageLoadingMsg();
        }
    });
}
