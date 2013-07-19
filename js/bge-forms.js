// Make sure BGE namespace exists
if (BGE == null)
    var BGE = {};

BGE.Form = {};
var globalpath = "mobile";
var visa;
E_regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
SE_regex = /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
p_regex = (/^$|\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);
A_regex = /[0-9,]+/;
Bankaccount_regex = (/^\d{4,17}$/);
recpayment_regex = /^\d{1,6}(\.\d{1,2})?$/;
///^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/;
minmumpay = 0.1;
numberofpayments_regex = /^[1-9][0-9]*$/;
var resi_min = 0.01;
var resi_max = 9999.99;
var com_min = 0.01;
var com_max = 99999.99;


var enableFederation = false;

var currentYear = "";
currentYear = (new Date()).getFullYear();

function setCookieEx(c_name, value, exdays) {
    var currentDate = new Date();
    var exdate = new Date(currentDate.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var c_value = escape(value) + ((exdays == null) ? "" : ";expires=" + exdate.toUTCString()) + ";domain=.bge.com;path=/";
    //var c_value = escape(value) + ((exdays == null) ? "" : ";expires=" + exdate.toUTCString()) + ";cookie_domain=.Ceg.Corp.Net;path=/";
    document.cookie = c_name + "=" + c_value;

}

function setCookie(c_name, value) {
    var currentDate = new Date();
    var exdays = 1;
    var exdate = new Date(currentDate.getTime() + (10 * 60 * 1000));
    var c_value = escape(value) + ((exdays == null) ? "" : ";expires=" + exdate.toUTCString()) + ";domain=.bge.com;path=/";
    //var c_value = escape(value) + ((exdays == null) ? "" : ";expires=" + exdate.toUTCString()) + ";cookie_domain=.Ceg.Corp.Net;path=/";
    document.cookie = c_name + "=" + c_value;

}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}
var alertMessage;
var accountalertMessage;


/************/

function validateRouting(value) {

    if (value.length == 0) {
        return false;
    }

    var intValue = parseInt(value);

    if (intValue == Number.NaN) {
        return false;
    }
    if (intValue <= 0) {
        return false;
    }

    var splitVal = value.split("");
    if (splitVal.lenght < 9 || splitVal[0] > 3)
        return false;

    var sum = (splitVal[0] * 3) + (splitVal[1] * 7) + (splitVal[2] * 1) + (splitVal[3] * 3) + (splitVal[4] * 7) + (splitVal[5] * 1) + (splitVal[6] * 3) + (splitVal[7] * 7) + (splitVal[8] * 1);

    if ((sum % 10) != 0)
        return false;

    return true;

}

/******************/



/****************************************
* miscellaneous
***************************************/

function closespeedpay() {
    $("#mainspeedpayNotif").popup("close");
}

/******************************
*
*	Sign In
*
******************************/

function checkLogin() {

    if (sessionExpired())
        $.mobile.changePage('signin.html', { transition: "slide" });
    else
        $.mobile.changePage('myaccount.html', { transition: "slide" });

    /*viewModel.getFromLocal();
    CurrentAccountSummary = viewModel.accountSummary;
    if (!$.isEmptyObject(CurrentAccountSummary)) {
    $.mobile.changePage('myaccount.html', {
    transition: "slide"
    });
    } else {
    $.mobile.changePage('signin.html', {
    transition: "slide"
    });
    }*/
}


$(document).on('pageinit', 'div[data-role=page]', function (event) {
    setCookie('fullsite', true);
    var currentPageId = $(event.target).attr('id');

    /*if ($(event.target).attr('authpage') && $(event.target).attr('id') != 'bge-signin' && $(event.target).attr('id')!='bge-index' && $('.ui-page-active').attr('id')!='bge-index' && $('.ui-page-active').attr('id')!='bge-signin') {
    //validateSession();
    if (sessionExpired()) {
    $.mobile.changePage('signin.html', { transition: "slide" });
    event.preventDefault();
    return;
    }

    }*/


    if ($.isEmptyObject(viewModel)) {
        viewModel = new CANPViewModel();
        statusModel = new StatusViewModel();
    }
    viewModel.getFromLocal();
    initJQMControls();
    //ko.applyBindings(viewModel, document.getElementById(currentPageId));
    try {
        ko.applyBindings(viewModel, document.getElementById(currentPageId));
    } catch (exception) {
        //$.mobile.changePage('signin.html', { transition: "slide" });
    }

    CurrentAccountSummary = viewModel.accountSummary;
    if (!$.isEmptyObject(CurrentAccountSummary)) {
        clearTimeout(visa);
        visa = setTimeout(function () {
            FedLogout();
        }, 1800000);

        //setAccountAlertsMsgSP();
        $('.notif-alert .close-icon-sm').on('click', function () {
            $('.notify-alert').fadeOut(300);
            NotifClosed = true;
            viewModel.alertClosed(true);
            viewModel.saveToLocal();
        });

    }

    if (currentPageId == 'billing-automated-page' || currentPageId == 'billing-editautomated-page') {

        //clears the total amount on edit pmt    
        $('#editpayAmount').click(function () {
            viewModel.selectedrecurringPayment().threshold('');
        });
        //clears the total amount on pmt 
        $('#sbpayAmount').click(function () {
            $('#amtntexceed').val('');
            viewModel.selectedrecurringPayment().threshold('');
        });

        $('#xpayments').click(function () {
            viewModel.selectedrecurringPayment().effectivePeriod('maxPayments');
            $('#untildate').val('');
            viewModel.selectedrecurringPayment().endDate('');
            $("input[name='effDate']").checkboxradio("refresh");
        });

        $('#untildate').click(function () {
            viewModel.selectedrecurringPayment().effectivePeriod('endDate');
            viewModel.selectedrecurringPayment().numberOfPayments('');
            $('#xpayments').val('');
            $("input[name='effDate']").checkboxradio("refresh");
        });

        $('#untilendDate').click(function () {
            $('#xpayments').val('');
            viewModel.selectedrecurringPayment().numberOfPayments('');
        });

        $('#untilcanceled').click(function () {
            $('#xpayments').val('');
            viewModel.selectedrecurringPayment().numberOfPayments('');
            $('#untildate').val('');
            viewModel.selectedrecurringPayment().endDate('');
        });

        $('#amtnexceed').click(function () {
            viewModel.selectedrecurringPayment().amountType('upto amount');
            $("input[type='radio']").checkboxradio("refresh");
        });
        $('#amtntexceed').click(function () {
            viewModel.selectedrecurringPayment().amountType('upto amount');
            $("input[name='payAmount']").checkboxradio("refresh");
        });

        $('#dldaysbefor').click(function () {
            viewModel.selectedrecurringPayment().dateType('before due');
            $("input[type='radio']").checkboxradio("refresh");
        });

    }

    if (currentPageId == 'billing-sch-page' || currentPageId == 'billing-editsch-page') {



        //clears the specific amount on schedule page
        $('#camountDue').click(function () {
            $('#amtSpecificPayment').val('');
        });

        //clears the specific amount on edit schedule page 
        $('#editcamountDue').click(function () {
            $('#amtSpecific').val('');
        });

        $('#liduecheck').click(function () {
            $('#epayDate').val('');
            $('#payDate').val('');
            viewModel.selectedPayment().dateType('dueDate');
            $("input[type='radio']").checkboxradio("refresh");
        });


        $('#payDate').click(function () {
            viewModel.selectedPayment().dateType('specifiedDate');
            $("input[type='radio']").checkboxradio("refresh");
        });

        $('#epayDate').click(function () {
            viewModel.selectedPayment().dateType('specifiedDate');
            $("input[type='radio']").checkboxradio("refresh");
        });

        $('#amtSpecificPayment').click(function () {
            viewModel.selectedPayment().amountType('specifiedAmount');
            $("input[type='radio']").checkboxradio("refresh");
        });

        $('#amtSpecific').click(function () {
            viewModel.selectedPayment().amountType('specifiedAmount');
            $("input[type='radio']").checkboxradio("refresh");
        });

    }

    if (currentPageId == 'billing-schfinal-page') {
        try {
            ko.applyBindings(statusModel, document.getElementById(currentPageId));
        } catch (exception) {
            //$.mobile.changePage('signin.html', { transition: "slide" });

        }
    }


});

$(document).on('pageshow', '#bge-signin', function (event) {
    //cleanup();
    /*if (!jQuery.isEmptyObject(CurrentAccountSummary)) {
    $.mobile.changePage('myaccount.html', {
    transition: "slide"
    });
    }*/
    clearTimeout(visa);
    $('#sign-in-form').submit(function () {
        FedLogin();
        return false;
    });
    $('#bgeuid').val(getCookie('bgeme'));
    if (checkNull(getCookie('bgeme'))) {
        //$('input[name=rememberme]').attr('checked', true);
        $('input[name=rememberme]').attr('checked', true).checkboxradio('refresh');
    }


});
function FedLogin() {
    var loginRequest = {
        "userid": $('#bgeuid').val(),
        "password": $('#bgepwd').val(),
        "encryptMode": 2
    };
    $.mobile.showPageLoadingMsg();
    $('#sign-in-error').hide();
    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/FederatedLogin',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(loginRequest),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            viewModel.getFromLocal();
            viewModel.webuserId = data.d.WebUserId;            
            viewModel.loginErrorCode(data.d.ErrorCode);
            viewModel.saveToLocal();
            if (data.d.ErrorCode != null && data.d.ErrorCode == 'E00700' || data.d.ErrorCode == 'E00715') {
                $('#sign-in-error').show();
                $('#sign-in-error').text(data.d.ErrorMessage);
                $.mobile.hidePageLoadingMsg();
                return;
            }
            if (data.d.ErrorCode != null) {
                $('#signinerrorpop').popup('open');
                $.mobile.hidePageLoadingMsg();
                return;
            } else {
                if ($('input[name=rememberme]').is(':checked')) {
                    setCookieEx('bgeme', $('#bgeuid').val(), 30);

                }
                if (enableFederation) {
                    $('<iframe />', {
                        name: 'ADFSLogutFame',
                        id: 'ADFSLogutFame',
                        width: 0,
                        height: 0,
                        src: data.d.STSURL
                    }).appendTo('body');

                    $('#ADFSLogutFame').one('load', function () {
                        FetchAccountSummary();
                    });
                } else {
                    FetchAccountSummary();
                }

            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert(textStatus);
        }
    });

}

function FedLogout() {

    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/Logout',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.d.ErrorCode != null) {
                alert(data.d.ErrorMessage);

            } else {

                cleanup();
                $(".bgepanel").panel("close");

                if (enableFederation) {
                    $('<iframe />', {
                        name: 'ADFSLogoutFame',
                        id: 'ADFSLogoutFame',
                        width: 0,
                        height: 0,
                        src: data.d.STSURL
                    }).appendTo('body');

                }

            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert(textStatus);
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('signin.html', {
                transition: "slide"
            });
        }
    });

}

function cleanup() {
    /*if (!$.isEmptyObject(CurrentAccountSummary)) {*/
    CurrentAccountSummary = null;
    OutageData = null;
    OpowerData = null;
    SERData = null;
    ProgramsData = null;
    NotificationsData = null;
    localStorage.clear();
    //viewModel = new CANPViewModel();
    viewModel.clean();
    $('.notif-alert').hide();
    $('.lisignout').hide();
    clearTimeout(visa);
    GetMessages();
    /*$.mobile.changePage('index.html', {
    transition: "slide"
    });*/
    /* } */

}

/******************************
*
*	Report Outage Page
*
******************************/

var numberType;
var selectedValue;
var reportedAddress;

//enabling and disabling the fields
$(document).on('pageshow', '#report-outage-page', function (event) {

    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#report-outage-form");
    if (stripAlpha($form.find("input[name=phone_number]").val()).length > 0) {
        $form.find("input[name=account_number]").attr("disabled", "disabled");
    } else {
        $form.find("input[name=account_number]").removeAttr("disabled");
    }
    if (checkNull($form.find("input[name=account_number]").val()).length > 0) {
        $form.find("input[name=phone_number]").attr("disabled", "disabled");
    } else {
        $form.find("input[name=phone_number]").removeAttr("disabled");
    }

});

/******************************
*
*	Helpers
*
******************************/

function stripAlpha(source) {
    var stripped = new String(source);
    stripped = stripped.replace(/[^0-9]/g, '');

    return stripped;
}

function checkNull(source) {
    if (typeof source == "undefined" || source == null)
        return "";
    else
        return source;
}

/******************************
*
*	Masking
*
******************************/

/*$(document).on('pageinit', 'div[data-role=page]', function (event) {

$("input.telephone").each(function (index) {

$(this).attr("maxlength", 14);

$(this).bind("keypress", function (event) {

$input = $(this);

// The value of the input
var val = $(this).val();


// The actual key pressed
var keyPressed = String.fromCharCode(event.keyCode);

// Only accept numbers
if (stripAlpha(keyPressed).length == 0) {
return false
}

// Add masking text
else if (val.length == 0 && val.charAt(0) != "(") {
val = "(" + val;
}
else if (val.length == 4 && val.charAt(4) != ")") {
val = val + ") ";
}
else if (val.length == 9 && val.charAt(9) != "-") {
val = val + "-";
}

$(this).val(val);

// Android hack to fix cursor issue
if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
setTimeout(function () {

$input.blur().focus();
}, 50);
}

});


// Clean input if no numbers
$(this).bind("blur", function (event) {
if (stripAlpha($(this).val()).length == 0)
$(this).val("");
});



});


}); */

/******************************
*
*	Report Outage Submit Handler on fuzzy account page (multiple accounts page)
*
******************************/
var CustomerDataOutage;
var SelectedAddressOutage;
var outageAddressIndex;
var ClickedOutageAddress;
var ETRMessage;
$(document).on('pageinit', '#fuzzy-account-pao-page', function (event) {
    $("#address-list").empty();

    if (typeof CustomerDataOutage == "undefined" || CustomerDataOutage == null)
        return;
    if (CustomerDataOutage.Message != null)
        $("#multi-account-message").text(CustomerDataOutage.Message);

    if (CustomerDataOutage.PhoneNumber != null) {
        $("#number-type").text("Phone Number:");
        $("#number-value").text(CustomerDataOutage.PhoneNumber);
    } else {
        $("#number-type").text("Account #:");
        $("#number-value").text(CustomerDataOutage.AccountNumber);
    }
    $.each(CustomerDataOutage.OutageData, function (idx) {
        var isDisabled = "";
        var outageStatusMsg = "";
        if (this.OutageStatus == "ACTIVE" || this.OutageStatus == "FUZZY") {
            isDisabled = "disabled";
            outageStatusMsg = this.ETRDescription;
            $("#address-list").append('<li class="no-arrow"><strong>Service Address: </strong><span style="font-weight:normal">' + this.Address.split(':')[0] + '</span><br/><p>' + outageStatusMsg + '</p></li>');
        } else if (this.OutageStatus == "NOT ACTIVE") {
            $("#address-list").append('<li><a class="anchorlist" id="add-' + idx + '" title="' + this.Address + '" href="#"  data-transition="slide"><strong>Service Address: </strong><span style="font-weight:normal">' + this.Address.split(':')[0] + '</span></a><br/><span style="font-weight:normal">' + outageStatusMsg + '</span></li>');
        }
    });
    $("#address-list").listview('refresh');

    $(function () {

        $('.anchorlist').click(function () {
            outageAddressIndex = this.id;
            ClickedOutageAddress = this.title.split(':')[0];
            $.mobile.changePage('report-outage-form.html', {
                transition: "slide"
            });
        });
    });

});

function OutagesClick() {
    if (!$.isEmptyObject(CurrentAccountSummary)) {
        getRAOAddress();
        return false;
    } else {
        $.mobile.hidePageLoadingMsg();
        $.mobile.changePage('report-an-outage.html', {
            transition: "slide"
        })
    }

}

function reportOutage() {
    $.support.cors = true;
    if (CustomerDataOutage.PhoneNumber == null)
        CustomerDataOutage.PhoneNumber = "";
    if (CustomerDataOutage.AccountNumber == null)
        CustomerDataOutage.AccountNumber = "";

    if (CustomerDataOutage.PhoneNumber != null && CustomerDataOutage.PhoneNumber != "") {
        numberType = "Phone Number:";
        selectedValue = CustomerDataOutage.PhoneNumber;
    } else {
        numberType = "Account Number:";
        selectedValue = CustomerDataOutage.AccountNumber;
    }

    var outageRequest = {
        "phoneNumber": CustomerDataOutage.PhoneNumber,
        "accountNumber": CustomerDataOutage.AccountNumber,
        "indexKey": outageAddressIndex
    };
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/AnonymousService.asmx/SubmitOutage',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(outageRequest),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.d.ReturnStatus == "ERROR") {
                //alert(data.d.ErrorMessage);
                $('#fuzzy-accounts-error').text(data.d.ErrorMessage);
                $('#popupError').popup("open")
            } else {
                //alert(data.d.ETRMessage);
                //$('#fuzzy-accounts-error').text(data.d.ETRMessage);
                //$('#popupError').popup("open");
                ETRMessage = data.d.ETRMessage;
                reportedAddress = data.d.Address;
                // $.mobile.changePage('/'+ globalpath +'/Pages/report-outage-success.html', { transition: "slide" });
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            alert(textStatus);
        },
        complete: function () {
            $.mobile.changePage('report-outage-success.html', {
                transition: "slide"
            });
        }
    });
}

/*gets the call from report-outage-success.html*/
$(document).on('pageinit', '#report-outage-success-pao-page', function (event) {
    if (!$.isEmptyObject(CurrentAccountSummary)) {
        $('#outagesuccess').append('<span><strong>Account Number:</strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</label></span><div><label>' + CurrentAccountSummary.ServiceList[0].Address + '</label></div>');
        $('.outages').hide();
        $('#etr-placeholder').text(ETRMessage);
    } else {
        $('#outagesuccess').hide();
        $('.authsr').hide();
        $("#number_type_ros").text(numberType);
        $("#selected_number_ros").text(selectedValue);
        $('#selected_address_ros').text(reportedAddress);
        $('#etr-placeholder').text(ETRMessage);
    }
});

/*gets the call from outage-form.html*/
$(document).on('pageinit', '#confirm-address-pao-page', function (event) {
    if (!$.isEmptyObject(CurrentAccountSummary)) {
        if (!authAccountNotFound) {
            $('.outages').hide();
            $('.authaccount').show();
            $('uiAccountNotFound').hide();
        } else {
            $('.outages').hide();
            $('.authaccount').hide();
            $('.uiAccountNotFound').show();
            $('#uiReportOutageButton').addClass('hidden')
        }
        if (CurrentAccountSummary.ServiceList != null && CurrentAccountSummary.ServiceList.length > 1) {
            // $("#outageserviceaddressclass").append('<span>Account #: <strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</label></strong></span><div>Address :<select id="multiPremiseSelect"></select></div>');
            $("#outageserviceaddressclass").append('<span><strong>Account Number: </strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</label></span></br>');
            $("#outageserviceaddressclass").append('<div data-role="fieldcontain" style="display:inline"><span for=multiPremiseSelect></span><select data-native-menu="false" id="multiPremiseSelect" name="multiPremiseSelect"></select></div>');
            var pselect = $('#multiPremiseSelect');
            pselect.empty();
            var addressFound = 0;
            /*$.each(CurrentAccountSummary.ServiceList, function (idx) {
            pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
            });*/
            $.each(CustomerDataOutage.OutageData, function (idx) {
                pselect.append('<option  id=add-' + idx + ' value="' + this.Address + '" etrdes="' + this.ETRDescription + '" >' + this.Address.split(':')[0] + '</option>');
                addressFound++;
            });

            $('#multiPremiseSelect option:first-child').attr('selected', 'selected');
            $('#multiPremiseSelect').selectmenu();
            $('#multiPremiseSelect').selectmenu('refresh');
            $('#outageserviceaddressclass').trigger('create');
            pselect.change(reportPremise);

        } else {
            $("#outageserviceaddressclass").append('<span><strong>Account Number: </strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</label></span><div><label> ' + CurrentAccountSummary.ServiceList[0].Address + ' </label></div>');
            outageAddressIndex = 'add-0';
        }


    } else {
        $('#outageserviceaddressclass').hide();
        if (CustomerDataOutage.PhoneNumber != null) {
            $("#number_type").text("Phone Number:");
            $("#selected_number").text(CustomerDataOutage.PhoneNumber);
        } else {
            $("#number_type").text("Account Number:");
            $("#selected_number").text(CustomerDataOutage.AccountNumber);
        }

        if (CustomerDataOutage.OutageData.length > 1) {
            $('#selected_address').text(ClickedOutageAddress);
            $('#pmultiaccount').show();
        } else {
            $('#selected_address').text(CustomerDataOutage.OutageData[0].Address);
            $('#psingleaccount').show();
            outageAddressIndex = 'add-0';
        }
    }

    if ($("#multiPremiseSelect option:selected").attr("etrdes") != null && $("#multiPremiseSelect option:selected").attr("etrdes") != "") {
        $('.authaccount').text($("#multiPremiseSelect option:selected").attr("etrdes"));
        $('#uiReportOutageButton').addClass('hidden')
    }

    $('#submit-outage-form').submit(function () {
        reportOutage();
        return false;
    });

});

function reportPremise() {
    outageAddressIndex = $("#multiPremiseSelect option:selected").attr("id");
    ClickedOutageAddress = $("#multiPremiseSelect option:selected").attr("value").split(':')[0];
    if ($("#multiPremiseSelect option:selected").attr("etrdes") != null && $("#multiPremiseSelect option:selected").attr("etrdes") != "") {
        $('.authaccount').text($("#multiPremiseSelect option:selected").attr("etrdes"));
    } else {
        $('#uiReportOutageButton').removeClass('hidden')
    }
    $.mobile.changePage('report-outage-form.html', {
        transition: "slide"
    });

}

/* gets the call from report-outage-summary*/
$(document).on('pagebeforeshow', '#outage-summary-pao-page', function (event) {
    if (jQuery.isEmptyObject(CustomerDataOutage)) {
        CustomerDataOutage = JSON.parse(localStorage['storedCustomerDataOutage']);
    }
    if (CustomerDataOutage) {
        if (!$.isEmptyObject(CurrentAccountSummary)) {
            $('.outages').hide()
            $('#outagesummary').append('<div><strong>Account Number: </strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</div></span><div><label>' + CurrentAccountSummary.ServiceList[0].Address + '</div></label></span>');
        } else {
            $('#outagesummary').hide();
            if (CustomerDataOutage.PhoneNumber != null) {
                $("#number_type").text("Phone Number:");
                $("#selected_number").text(CustomerDataOutage.PhoneNumber);
            } else {
                $("#number_type").text("Account Number:");
                $("#selected_number").text(CustomerDataOutage.AccountNumber);
            }
            $('#selected_address').text(CustomerDataOutage.OutageData[0].Address);
        }

        if (CustomerDataOutage.OutageData[0].ETRDescription == null)
            $('#outage_etr').text('Currently unable to process your request. Please call 877.778.2222 to report an outage.');
        else
            $('#outage_etr').text(CustomerDataOutage.OutageData[0].ETRDescription);

    } else {
        $.mobile.changePage('index.html', {
            transition: "slide"
        });
    }

});

$(document).on('pageinit', '#report-outage-page', function (event) {

    var $currentPage = $(event.target);

    var $form = $currentPage.find("form#report-outage-form");

    $form.find("input[name=account_number]").bind("keyup change blur", function (event) {
        if (checkNull($(this).val()).length > 0) {
            $form.find("input[name=phone_number]").attr("disabled", "disabled");
        } else {
            $form.find("input[name=phone_number]").removeAttr("disabled");
        }
    });

    $form.find("input[name=phone_number]").bind("keyup change blur", function (event) {
        if (checkNull(stripAlpha($(this).val())).length > 0) {
            $form.find("input[name=account_number]").attr("disabled", "disabled");
        } else {
            $form.find("input[name=account_number]").removeAttr("disabled");
        }
    });
});

function SubmitROutage() {

    if (jQuery.isEmptyObject($('#report-outage-page #phone_number').val()) && jQuery.isEmptyObject($('#report-outage-page #account_number').val())) {
        $('#rOutage-Error').empty();
        $('#rOutage-Error').append('Please enter a phone number or BGE account number to procced.');
        $('#rOutage-Error').show();
    } else if (!A_regex.test($('#report-outage-page #account_number').val()) && !jQuery.isEmptyObject($('#report-outage-page #account_number').val())) {
        $('#rOutage-Error').empty();
        $('#rOutage-Error').append('Enter a valid account number');
        $('#account_number').empty
        $('#rOutage-Error').show();

    } else {
        $('#rOutage-Error').hide();
        $('#account-error, #system-error').hide();
        getRAOAddress();
        return false;
    }

}
var authAccountNotFound = false;
function getRAOAddress() {
    $.support.cors = true;

    if (!$.isEmptyObject(CurrentAccountSummary)) {
        var customerRequest = {
            "captchaAns": "null",
            "captchaEncCode": "null",
            "accountNumber": CurrentAccountSummary.AccountId,
            "phoneNumber": "null"
        };

    } else {
        var customerRequest = {
            "captchaAns": "null",
            "captchaEncCode": "null",
            "accountNumber": $('#account_number').val(),
            "phoneNumber": $('#phone_number').val()
        };
    }
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/AnonymousService.asmx/GetCustomerDataOutage',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(customerRequest),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {

            if (data.d.ReturnStatus == "ERROR" && data.d.ErrorCode == "ACCOUNT NOT FOUND") {
                $('#address').text(data.d.ErrorMessage);
                if (data.d.ErrorCode == "InvalidCaptcha") {
                    //	loadCaptchaTo($('#rao-captcha'));
                    //	$('#captcha-ans').val("");
                    //	$('#catptha-error').show();
                } else
                    if (data.d.ErrorCode == "ACCOUNT NOT FOUND") {
                        //loadCaptchaTo($('#rao-captcha'));
                        //$('#captcha-ans').val("");
                        $('#account-error').show();

                        //redirect to report-outage-form.html page to show the error message
                        if (!$.isEmptyObject(CurrentAccountSummary)) {
                            authAccountNotFound = true;
                            $.mobile.changePage('report-outage-form.html', {
                                transition: "slide"
                            });
                        }

                    }
            } else {
                authAccountNotFound = false;
                CustomerDataOutage = data.d;
                localStorage['storedCustomerDataOutage'] = JSON.stringify(data.d);
                CurrentOutageSummary = true;
                if (CustomerDataOutage.OutageData.length > 1) {
                    if ($.isEmptyObject(CurrentAccountSummary)) {
                        $.mobile.hidePageLoadingMsg();
                        $(".bgepanel").panel("close");
                        $.mobile.changePage('outage-fuzzy-account.html', {
                            transition: "slide"
                        });
                    } else {
                        $.mobile.hidePageLoadingMsg();
                        $(".bgepanel").panel("close");
                        $.mobile.changePage('report-outage-form.html', {
                            transition: "slide"
                        });
                    }
                } else if (CustomerDataOutage.OutageData.length == 1) {
                    if (CustomerDataOutage.OutageData[0].OutageStatus == "ACTIVE" || CustomerDataOutage.OutageData[0].OutageStatus == "FUZZY") {
                        $.mobile.hidePageLoadingMsg();
                        $(".bgepanel").panel("close");
                        $.mobile.changePage('report-outage-summary.html', {
                            transition: "slide"
                        });
                    } else {
                        $.mobile.hidePageLoadingMsg();
                        $(".bgepanel").panel("close");
                        $.mobile.changePage('report-outage-form.html', {
                            transition: "slide"
                        });
                    }
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#system-error').show();
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}

/* Global Alert Message (displays the alert message on header top left) */

function getAlertsMsgSP() {
    $.support.cors = true;
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/AnonymousService.asmx/GetGlobalAlertMessage',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        async: false,
        success: function (data, textStatus, xhr) {
            viewModel.getFromLocal();
            if (data.d.ErrorCode == "SUCCESS") {
                viewModel.globalAlert(ko.mapping.fromJS(data.d.Message)());
                //alertMessage = data.d.Message;
                //setAlertsMsgSP();
            } else if (data.d.ErrorCode == "ERROR") {
                //alertMessage = data.d.ErrorCode;
                //setAlertsMsgSP();
                viewModel.globalAlert(ko.mapping.fromJS(data.d.ErrorCode)());
            }
            viewModel.saveToLocal();

        },
        error: function (xhr, textStatus, errorThrown) {
            $('#result').html(textStatus);
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}
/* Alert Message for account */
function getAccountAlertsMsgSP() {
    $.support.cors = true;
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/SecureServices.asmx/GetAlertMessage',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        async: false,
        success: function (data, textStatus, xhr) {
            viewModel.getFromLocal();
            if (jQuery.isEmptyObject(data.d.ErrorCode) && jQuery.isEmptyObject(data.d.ErrorMessage)) {
                viewModel.accountalert(ko.mapping.fromJS(data.d.alertMessage)());
                NotifClosed = false;
                viewModel.alertClosed(false);
            } else if (data.d.ErrorCode == "ERROR") {
                viewModel.accountalert(ko.mapping.fromJS(data.d.ErrorCode)());
                NotifClosed = true;
                viewModel.alertClosed(true);
            }
            viewModel.saveToLocal();
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#result').html(textStatus);
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}
/******************************
*
*	Contact Us Identifier Page
*
******************************/

function ContactClick() {

    if (!$.isEmptyObject(CurrentAccountSummary)) {
        getAddress();
        return false;

    } else {
        $.mobile.hidePageLoadingMsg();
        $(".bgepanel").panel("close");
        $.mobile.changePage('contactus.html', {
            transition: "slide"
        })
    }

}
$(document).on('pageinit', '#contact-us-page', function (event) {

    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#customer-identifier");
    if (checkNull(stripAlpha($form.find("input[name=phone_number]").val())).length > 0) {
        $form.find("input[name=account_number]").attr("disabled", "disabled");
    } else {
        $form.find("input[name=account_number]").removeAttr("disabled");
    }
    if (checkNull($form.find("input[name=account_number]").val()).length > 0) {
        $form.find("input[name=phone_number]").attr("disabled", "disabled");
    } else {
        $form.find("input[name=phone_number]").removeAttr("disabled");
    }

    $('#general_entry').click(function () {
        recognized = false;
        $.mobile.changePage('contact-form.html', {
            transition: "slide"
        });
    });

});

function SubmitContactus() {
    if (jQuery.isEmptyObject($('#contact-us-page #phone_number').val()) && jQuery.isEmptyObject($('#contact-us-page #account_number').val())) {
        $('#Contactus-Error').empty();
        $('#Contactus-Error').append('Please enter a phone number or BGE account number to procced.');
        $('#Contactus-Error').show();
    } else if (!A_regex.test($('#contact-us-page #account_number').val()) && !jQuery.isEmptyObject($('#contact-us-page #account_number').val())) {
        $('#Contactus-Error').empty();
        $('#Contactus-Error').append('Enter a valid account number');
        $('#Contactus-Error').show();

    } else {
        $('#Contactus-Error').hide();
        getAddress();
        return false;

    }

}

$(document).on('pageinit', '#contact-us-page', function (event) {

    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#customer-identifier");
    /*var validator_contactuspage = $form.validate({
    rules: {
    account_number: { require_from_group: [1, ".customer-identifier"], digits: true, maxlength: 10, minlength: 10 },
    phone_number: { require_from_group: [1, ".customer-identifier"], phoneUS: true }
    },
    messages: {
    account_number: {
    maxlength: "Please enter exactly 10 digits.",
    minlength: "Please enter exactly 10 digits."
    }
    },
    highlight: function (element, errorClass) {
    $(element).removeClass("valid");
    $(element).addClass("error");
    },
    success: function (element, validClass) {
    $(element).removeClass("error");
    $(element).addClass("valid");

    },
    submitHandler: function (form) {
    getAddress();
    return false;
    }
    }); */

    $form.find("input[name=account_number]").bind("keyup change blur", function (event) {
        if (checkNull($(this).val()).length > 0) {
            $form.find("input[name=phone_number]").attr("disabled", "disabled");
        } else {
            $form.find("input[name=phone_number]").removeAttr("disabled");
        }
    });

    $form.find("input[name=phone_number]").bind("keyup change blur", function (event) {
        if (checkNull(stripAlpha($(this).val())).length > 0) {
            $form.find("input[name=account_number]").attr("disabled", "disabled");
        } else {
            $form.find("input[name=account_number]").removeAttr("disabled");
        }
    });
});

/******************************prasad form
*
*	Contact Us Form
*
******************************/

var enteredAccountNumber; //user Entered Account Number
var enteredPhoneNumber; //user entered phone number
var selectedAddress; // user selected account from fuzzy list
var selectedAddressIndex; //to retrieve the encrypted Address
var recordsFound = 0; // addresses found with the account/phone entered by customer
var recognized; // recognized customer or un-recognized
var ConCustomerData; // encrypted addresses from the webservice
var cleanedDisplayAddress = []; // striped address from the webservice

//declare form and it's attributes
var formAttributes;

$(document).on('pageinit', '#contact-form-page', function (event) {
    var $currentPage = $(event.target);
    if (!$.isEmptyObject(CurrentAccountSummary)) {
        var AboutSelectedAccountData = {
            "con_entered_account": CurrentAccountSummary.AccountId,
            "con_entered_phone": enteredPhoneNumber,
            "con_selected_address": CurrentAccountSummary.MailAddress[0]
        };
        $('.your-account-details').hide();
        $('.habtu').hide();
        $('.precords').hide();
    } else {
        var AboutSelectedAccountData = {
            "con_entered_account": enteredAccountNumber,
            "con_entered_phone": enteredPhoneNumber,
            "con_selected_address": selectedAddress
        };
        $('#contactserviceaccount').hide();
        $('.pauth').hide();
    }
    BGE.Form.setupAboutYou($currentPage.find("#contact-form:first"), AboutSelectedAccountData);

    var testLocationData = {
        "streetAddress": "123 Main St.",
        "city": "Baltimore",
        "zip": "12345"
    };

    BGE.Form.setupLocationOfProblem($currentPage.find("#contact-form:first"), testLocationData);

    BGE.Form.setupContactForm($currentPage.find("#contact-form:first"));
    $('.form_manualentry').click(function () {
        recognized = false;

        var $currentPage = $(event.target);
        var $form = $currentPage.find("form#contact-form");
        $form.find(".unrecognized").show();
        $form.find(".recognized").hide();
        $form.find(".unrecognized_message").hide();

    });

});

$('#contact-us-page').on('pageremove', function (event) {
    var $currentPage = $(event.target);
    $currentPage.find("#contact-form:first").find("select[name=purposeofcommunication]").die("change");

});

/******************************
*
*	Form Component Setup
*
******************************/

BGE.Form.setupLocationOfProblem = function ($form, data) {
    $form.find("input[name=location_problem]").on("change", function () {
        if ($(this).val() == "location-is-service-address") {
            $form.find("input[name='street_address']").val(data.streetAddress);
            $form.find("input[name='city']").val(data.city);
            $form.find("input[name='state']").val("Maryland");
            $form.find("input[name='zip']").val(data.zip);
            $form.find(".enter-location-details").hide();
        } else {
            $form.find("input[name='street_address']").val("");
            $form.find("input[name='city']").val("");
            $form.find("input[name='state']").val("Maryland");
            $form.find("input[name='zip']").val("");
            $form.find(".enter-location-details").show();

        }
    });

}

//prasad recognized
BGE.Form.setupAboutYou = function ($form, data) {

    if (recognized == true) {

        if (!$.isEmptyObject(CurrentAccountSummary)) {
            $("#contactserviceaccount").append('<div><strong>Account Number: </strong><label id="lblaccountid" > ' + CurrentAccountSummary.AccountId + '</label></div><div><label>' + CurrentAccountSummary.MailAddress[0] + '</label></div>');
        } else {
            $('#con_entered_account').text(data.con_entered_account);
            $('#con_entered_phone').text(data.con_entered_phone);
            $('#con_selected_address').text(data.con_selected_address);
        }

        $('#email').val(data.email);

        if (data.con_entered_phone == null || data.con_entered_phone == "") {
            $form.find(".your-phone-info").hide();
        }
        if (data.con_entered_account == null || data.con_entered_account == "") {
            $form.find(".your-account-info").hide();
        }

        $form.find(".unrecognized").hide();
    } else {
        $form.find(".recognized").hide();
    }

}

BGE.Form.setupLightDetails = function ($form) {

    // Toggle the phone number for the request special access button
    $form.find("input[name=requires-special-access]").on("change", function () {

        if ($(this).is(":checked")) {
            $form.find(".phone-number-for-access-container").show();
        } else {
            $form.find(".phone-number-for-access-container").hide();
            $form.find(".phone-number-for-access").val("");
        }
    });

}
//prasad validations
BGE.Form.setupContactForm = function ($form) {

    var validator = $form.validate({
        onkeyup: false,
        onclick: false,
        rules: {
            first_name: {
                required: true
            },
            last_name: {
                required: true
            },
            email: {
                email: true,
                required: true
            },
            email_ureg: {
                required: true
            },
            street_address: {
                required: true
            },
            city: {
                required: true
            },
            zip: {
                required: true,
                digits: true,
                maxlength: 5,
                minlength: 5
            },
            location_problem: {
                required: true
            },
            phone_number_for_access: {
                required: true,
                phoneUS: true
            },
            account_number: {
                digits: true,
                maxlength: 10,
                minlength: 10
            },
            comments: {
                required: true
            },
            phone: {
                required: true,
                phoneUS: true
            }
        },
        highlight: function (element, errorClass) {
            $(element).removeClass("valid");
            $(element).addClass("error");
        },
        success: function (element, validClass) {
            $(element).removeClass("error");
            $(element).addClass("valid");
        },
        messages: {
            zip: {
                maxlength: "Please enter exactly 5 digits.",
                minlength: "Please enter exactly 5 digits."
            },
            account_number: {
                maxlength: "Please enter exactly 10 digits.",
                minlength: "Please enter exactly 10 digits."
            }
        },
        submitHandler: function (form) {

            //prasad submit
            var emailInput;
            var CustomerAddressEncrypt;
            var $pocDrop = $form.find("select[name=purpose_of_communication]");
            var FormTypeID = $pocDrop.val();
            var FormName = $pocDrop.find(":selected").text();
            var formData = new Array();
            var count = 0;
            if ($pocDrop.val() == "CULO") {
                if (recognized) {

                    if ($("#contact-form input[name='location_problem']:checked").val() == 'location-is-different-address') {
                        formData[count] = {
                            "FieldName": "Different_location",
                            "Fieldvalue": "Yes"
                        };
                        count++;

                        $('.altAddress').each(function () {
                            if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                                formData[count] = {
                                    "FieldName": this.id,
                                    "Fieldvalue": this.value
                                };
                                count++;
                            } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                                if (this.checked) {
                                    formData[count] = {
                                        "FieldName": this.id,
                                        "Fieldvalue": this.value
                                    };
                                    count++;
                                }
                            }

                        });
                    }
                } else {
                    $('.altAddress').each(function () {
                        if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                            formData[count] = {
                                "FieldName": this.id,
                                "Fieldvalue": this.value
                            };
                            count++;
                        } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                            if (this.checked) {
                                formData[count] = {
                                    "FieldName": this.id,
                                    "Fieldvalue": this.value
                                };
                                count++;
                            }
                        }

                    });

                }
                $('select.lightoutage,input.lightoutage').each(function () {
                    if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                        formData[count] = {
                            "FieldName": this.id,
                            "Fieldvalue": this.value
                        };
                        count++;
                    } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                        if (this.checked) {
                            formData[count] = {
                                "FieldName": this.id,
                                "Fieldvalue": this.value
                            };
                            count++;
                        }
                    }
                });

            } else if ($pocDrop.val() == "CUVT") {

                if (recognized) {

                    if ($("#contact-form input[name='location_problem']:checked").val() == 'location-is-different-address') {
                        formData[count] = {
                            "FieldName": "Different_location",
                            "Fieldvalue": "Yes"
                        };
                        count++;

                        $('.altAddress').each(function () {
                            if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                                formData[count] = {
                                    "FieldName": this.id,
                                    "Fieldvalue": this.value
                                };
                                count++;
                            } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                                if (this.checked) {
                                    formData[count] = {
                                        "FieldName": this.id,
                                        "Fieldvalue": this.value
                                    };
                                    count++;
                                }
                            }
                        });
                    }
                } else {
                    $('.altAddress').each(function () {
                        if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                            formData[count] = {
                                "FieldName": this.id,
                                "Fieldvalue": this.value
                            };
                            count++;
                        } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                            if (this.checked) {
                                formData[count] = {
                                    "FieldName": this.id,
                                    "Fieldvalue": this.value
                                };
                                count++;
                            }
                        }
                    });

                }

            }

            //default comments
            if ($('#comments').val() != null && $('#comments').val() != "") {
                formData[count] = {
                    "FieldName": "comments",
                    "Fieldvalue": $('#comments').val()
                };
                count++;
            }

            //un-recognized
            if (recognized == false) {
                $('.unreginfo').each(function () {
                    if (this.id && this.value != null && this.value != "" && this.type != 'radio') {
                        formData[count] = {
                            "FieldName": this.id,
                            "Fieldvalue": this.value
                        };
                        count++;
                    } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                        if (this.checked) {
                            formData[count] = {
                                "FieldName": this.id,
                                "Fieldvalue": this.value
                            };
                            count++;
                        }
                    }
                });

                emailInput = $('#email_ureg').val();

            }

            //recognized
            if (recognized == true) {
                $('.reginfo').each(function () {
                    if (this.id && this.value != null && this.value != "" && this.type != 'radio' && this.id != 'email') {
                        formData[count] = {
                            "FieldName": this.id,
                            "Fieldvalue": this.value
                        };
                        count++;
                    } else if (this.id && this.value != null && this.value != "" && this.type == 'radio') {
                        if (this.checked) {
                            formData[count] = {
                                "FieldName": this.id,
                                "Fieldvalue": this.value
                            };
                            count++;
                        }
                    }
                });
                emailInput = $('#email').val();

                if (selectedAddressIndex != null && selectedAddressIndex != "") {
                    CustomerAddressEncrypt = ConCustomerData[selectedAddressIndex.substring(selectedAddressIndex.indexOf("-") + 1, selectedAddressIndex.length)];
                } else {
                    CustomerAddressEncrypt = ConCustomerData[0];
                }

            }

            //display names updated in cifms tool - 1/4/2013

            for (var i = 0; i < formData.length; i++) {
                if (formData[i].FieldName == 'first_name') {
                    formData[i].FieldName = "FirstName";
                } else if (formData[i].FieldName == 'last_name') {
                    formData[i].FieldName = "LastName";
                } else if (formData[i].FieldName == 'comments') {
                    formData[i].FieldName = "Comments";
                } else if (formData[i].FieldName == 'email_ureg') {
                    formData[i].FieldName = "EmailAddress";
                } else if (formData[i].FieldName == 'phone') {
                    formData[i].FieldName = "Phone";
                } else if (formData[i].FieldName == 'email') {
                    formData[i].FieldName = "email";
                } else if (formData[i].FieldName == 'account_number') {
                    formData[i].FieldName = "AccountNumber";
                }

            }

            if (CustomerAddressEncrypt != null && CustomerAddressEncrypt != "") {
                var formMetadata = {
                    "FormTypeId": FormTypeID,
                    "FormName": FormName,
                    "emailAddress": emailInput,
                    "FormData": formData,
                    "CustomerAddressData": CustomerAddressEncrypt
                };
            } else {
                var formMetadata = {
                    "FormTypeId": FormTypeID,
                    "FormName": FormName,
                    "emailAddress": emailInput,
                    "FormData": formData
                };

            }

            //send the data to webservice
            var formData = {
                "frmData": formMetadata
            };

            if (FormTypeID != null && FormTypeID != "") {

                //submitContactUsForm(formMetadata);
                submitContactUsForm(formData);
            } else {
                referenceNumber = null;
                $.mobile.changePage('contact-success.html', {
                    transition: "slide"
                });

            }

        }

    });

    // Setup show/hide logic for the contact form.

    var $pocDrop = $form.find("select[name=purpose_of_communication]");

    if (checkNull($pocDrop.val()).length > 0) {
        $form.find(".form-section-comments").show();
        $form.find("div.ui-submit").show();
    } else {
        $form.find(".form-section-comments").hide();
        $form.find("textarea[name=comments]").val("");
        $form.find("div.ui-submit").hide();
    }

    $pocDrop.on("change", function () {

        if (checkNull($pocDrop.val()).length > 0) {
            $form.find(".form-section-comments").show();
            $form.find("div.ui-submit").show();
        } else {
            $form.find(".form-section-comments").hide();
            $form.find("textarea[name=comments]").val("");
            $form.find("div.ui-submit").hide();
        }

        // Clear validation messages
        validator.resetForm();

        // Reset the form
        BGE.Form.resetContactForm($form);

        if ($pocDrop.val() == "CULO") {
            $form.find(".form-section-light-details").show();
            $form.find(".form-section-location-of-problem").show();

            if (recognized == false) {
                $form.find(".locationproblem").hide();
                $form.find("input[name='street_address']").val("");
                $form.find("input[name='city']").val("");
                $form.find("input[name='state']").val("Maryland");
                $form.find("input[name='zip']").val("");
                $form.find(".enter-location-details").show();
            }

        } else if ($pocDrop.val() == "CUVT") {
            $form.find(".form-section-location-of-problem").show();
            if (recognized == false) {
                $form.find(".locationproblem").hide();
                $form.find("input[name='street_address']").val("");
                $form.find("input[name='city']").val("");
                $form.find("input[name='state']").val("Maryland");
                $form.find("input[name='zip']").val("");
                $form.find(".enter-location-details").show();
            }
        } else if ($pocDrop.val() == "non-hazardous concerns") {
            $form.find(".form-section-location-of-problem").show();
        }

    });

    var $tolCheck = $form.find("input[name=type_of_light]");

    $tolCheck.on("change", function () {
        var tolCheckVal = $form.find("input[name=type_of_light]:checked").val().toLowerCase();

        if (tolCheckVal == "other") {

            $form.find("input[name=other_description]").show();
        } else {

            $form.find("input[name=other_description]").hide();
        }

    });

    var $rsaCheck = $form.find("input[name=requires_special_access]");

    $rsaCheck.on("change", function () {
        if ($rsaCheck.is(":checked")) {
            $form.find(".phone-number-for-access-container").show();
        } else {
            $form.find(".phone-number-for-access-container").hide();
            $form.find(".phone-number-for-access").val("");
        }
    });

};

BGE.Form.resetContactForm = function ($form) {

    var $pocDrop = $form.find("select[name=purpose_of_communication]");
    $form.find("input[type=text], input[type=email], input[type=tel]").each(function (index) {
        if (checkNull($(this).closest(".about-you")).length == 0) {
            $(this).val("");
        }
    });

    $form.find("input[type=checkbox], input[type=radio]").each(function (index) {
        if (checkNull($(this).closest(".about-you")).length == 0) {
            $(this).attr('checked', false).checkboxradio("refresh");
        }
    });

    $form.find("select").each(function (index) {
        //	if($(this).attr("name") != $pocDrop.attr("name")){
        //		$(this).selectmenu();
        //		$(this).val("").selectmenu('refresh');
        if (checkNull($(this).closest(".about-you")).length == 0) {
            if ($(this).attr("name") != $pocDrop.attr("name")) {
                $(this).selectmenu();
                $(this).val("").selectmenu('refresh');
            }

        }

    });

    // Set the state
    $form.find("input[name=state]").val("Maryland");

    // Set the radio buttons
    $form.find("input[name=location_problem]:first").prop("checked", true).checkboxradio("refresh");
    $form.find("input[name=type_of_light]:first").prop("checked", true).checkboxradio("refresh");

    // Hide all form sections
    $form.find(".form-section-light-details").hide();
    $form.find(".form-section-location-of-problem").hide();
    $form.find(".enter-location-details").hide();
    $form.find(".phone-number-for-access-container").hide();
    $form.find("input[name=other_description]").hide();

};

/******************************prasad fuzzy
*
*	Contact US forms Submit Handler
*
******************************/

$(document).on('pageinit', '#fuzzy-account-con-page', function (event) {
    //display the count
    $("#address-list").empty();
    recordsFound = 0;
    $.each(cleanedDisplayAddress, function (idx) {
        $("#address-list").append('<li><a class="anchoraccountlist" id="add-' + idx + '" title="' + cleanedDisplayAddress[recordsFound] + '" href="#"  data-transition="slide"><strong>Service Address: </strong><span style="font-weight:normal">' + cleanedDisplayAddress[recordsFound] + '</span></a><br/></li>');
        recordsFound++;
    });
    $("#address-list").listview('refresh');
    if (enteredPhoneNumber != null) {
        $('#con_fuzzy_entered_phone').text("Phone Number:  " + enteredPhoneNumber);
    }

    $(function () {

        $('.anchoraccountlist').click(function () {
            selectedAddress = this.title;
            selectedAddressIndex = this.id;
            //redirect to form page
            if (selectedAddress == 'Other')
                recognized = false;
            $.mobile.changePage('contact-form.html', {
                transition: "slide"
            });
        });

        //fuzzy to manual entry

        $('#fuzzy_manualentry').click(function () {
            recognized = false;
            $.mobile.changePage('contact-form.html', {
                transition: "slide"
            });
        });

    });

});

function getAddress() {
    $.support.cors = true;

    if (!$.isEmptyObject(CurrentAccountSummary)) {
        var customerRequest = {
            "captchaAns": null,
            "captchaEncCode": null,
            "accountNumber": CurrentAccountSummary.AccountId,
            "phoneNumber": "null"

        };

    } else {
        var customerRequest = {
            "captchaAns": null,
            "captchaEncCode": null,
            "accountNumber": $('#account_number').val(),
            "phoneNumber": $('#phone_number').val()

        };
    }
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/AnonymousService.asmx/GetCustomerDetails',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(customerRequest),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            ConCustomerData = data.d.CustomerAddressData;
            if (data.d.ReturnStatus == "ERROR") {
                $('#address').text(data.d.ErrorMessage);
                if (data.d.ErrorCode == "InvalidCaptcha") {
                    loadCaptchaTo($('#rao-captcha'));
                    $('#captcha-ans').val("");
                    $('#catptha-error').show();
                } else if (data.d.ErrorCode == "ACCOUNT NOT FOUND") {
                    enteredAccountNumber = $('#account_number').val();
                    enteredPhoneNumber = $('#phone_number').val();
                    recognized = false;
                    $.mobile.hidePageLoadingMsg();
                    $(".bgepanel").panel("close");
                    $.mobile.changePage('contact-form.html', {
                        transition: "slide"
                    });
                }
            } else {
                recognized = true;
                cleanedDisplayAddress = [];
                for (var i = 0; i < data.d.DisplayAddress.length; i++) {
                    if (data.d.DisplayAddress[i] !== "" && data.d.DisplayAddress[i] !== null) {
                        cleanedDisplayAddress.push(data.d.DisplayAddress[i]);
                    }
                }
                if (checkNull(cleanedDisplayAddress).length > 1) {
                    enteredPhoneNumber = $('#phone_number').val();
                    enteredAccountNumber = $('#account_number').val();
                    $.mobile.hidePageLoadingMsg();
                    $(".bgepanel").panel("close");
                    $.mobile.changePage('contact-fuzzy-account.html', {
                        transition: "slide"
                    });

                } else {
                    // only one records found (start)

                    $.each(cleanedDisplayAddress, function (idx) {
                        enteredAccountNumber = $('#account_number').val();
                        enteredPhoneNumber = $('#phone_number').val();
                        selectedAddress = cleanedDisplayAddress[0];
                    });
                    $.mobile.hidePageLoadingMsg();
                    $(".bgepanel").panel("close");
                    $.mobile.changePage('contact-form.html', {
                        transition: "slide"
                    });
                    // only one records found (end)
                }

            }
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#result').html(textStatus);
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}

/*****************************
* contactu us Sucess form
*****************************/

$(document).on('pageinit', '#con-success-page', function (event) {

    if (referenceNumber != null && referenceNumber != "" && referenceNumber != "ERROR") {
        $('#con-error-message').hide();
        $('#con_confirmation_number').text(referenceNumber);
        $('#con-success-message').show();
    } else {
        $('#con-success-message').hide();
        $('#con-error-message').show();

    }
});

var referenceNumber;
function submitContactUsForm(formMetadata) {
    $.support.cors = true;

    var $currentPage = $(event.target);
    var $form = $currentPage.find("form#contact-form");
    $.mobile.showPageLoadingMsg();
    $.ajax({
        url: '/_layouts/Bge.Canp/AnonymousService.asmx/SubmitContactUsForm',
        type: 'POST',
        headers: {
            "cache-control": "no-cache"
        },
        data: JSON.stringify(formMetadata),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.d.ErrorCode == "SUCCESS") {
                referenceNumber = data.d.refNumber;
                $.mobile.changePage('contact-success.html', {
                    transition: "slide"
                });
            } else if (data.d.ErrorCode == "ERROR") {
                referenceNumber = data.d.ErrorCode;
                $.mobile.changePage('contact-success.html', {
                    transition: "slide"
                });
            }
            referenceNumber = data.d.refNumber;
            $.mobile.changePage('contact-success.html', {
                transition: "slide"
            });

        },
        error: function (xhr, textStatus, errorThrown) {
            $('#result').html(textStatus);
        },
        complete: function () {
            $.mobile.hidePageLoadingMsg();
        }
    });
}

/*****************************
* index page
*****************************/

$(document).on('pagebeforeshow', '#bge-index', function (event) {

    $('.indexicons').show();
    $('.fullsite').hide();

});

/*****************************
* My Profile
*****************************/
var myprofile;
var updatedPEmail;
var updatedSEmail;
var updatedHPhone;
var updatedCPhone;
var updatedBPhone;
var deletedHPhone;
var deletedCPhone;
var deletedBPhone;
var DeletedPNS = new Array();
var DeletedEMS = new Array();
var ChangedPNS = new Array();
var ChangedEMS = new Array();
var hPhone = new Array();
var cPhone = new Array();
var bPhone = new Array();
function getUserProfile() {
    $.mobile.showPageLoadingMsg();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/SecureServices.asmx/GetUserProfileData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        timeout: CanpAjaxTO,
        global: false,
        success: function (data, textStatus, xhr) {
            MyProfilePopulate(data);
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('myprofile.html', {
                transition: "slide"
            });
        }
    });
}

function GetMaxSequence(phoneArray, Usage) {

    var cPhone = jQuery.grep(phoneArray, function (obj) {
        return obj.Usage === Usage;
    });
    if (cPhone.length == 0) {
        var pcontact = new PhoneContact();
        pcontact.Usage = Usage;
        return pcontact;
    }
    var sorted = cPhone.sort(function (a, b) {
        return a.SequenceNo > b.SequenceNo
    });
    return sorted.slice(-1)[0];

}
function MyProfilePopulate(msg) {
    myprofile = msg.d;
    if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#ProfileService-Error').show();
        $('#ProfileService-Error').empty();
        $('#ProfileService-Error').append('We are unable to process your request at this time. Please try later.');
        $('#myprofile-update').hide();

    } else {
        var contactDetails = new Object;
        if (!jQuery.isEmptyObject(myprofile.UserProfileDetails)) {
            var groupedPhoneArray = [];
            var phoneArray = myprofile.UserProfileDetails.PhoneNumber;

            groupedPhoneArray[0] = GetMaxSequence(phoneArray, "HOME");
            groupedPhoneArray[1] = GetMaxSequence(phoneArray, "CELL");
            groupedPhoneArray[2] = GetMaxSequence(phoneArray, "BUSINESS");

            contactDetails.PhoneNumber = groupedPhoneArray;

            var groupedEmailArray = [];
            groupedEmailArray[0] = myprofile.UserProfileDetails.Email[0];
            if (myprofile.UserProfileDetails.Email.length < 2) {
                groupedEmailArray[1] = new EmailContact();
                groupedEmailArray[1].Usage = "ALTERNATE";
            } else {
                groupedEmailArray[1] = myprofile.UserProfileDetails.Email[1];
            }

            contactDetails.Email = groupedEmailArray;
        }
        viewModel.contactDetails(ko.mapping.fromJS(contactDetails));

        viewModel.saveToLocal();
    }

}

function UpdateProfileDetails() {
    //validations
    if (ko.mapping.fromJSON(localStorage.CustomerData).contactDetails() == ko.mapping.toJSON(viewModel.contactDetails()) || !SE_regex.test($('#secondaryEmail').val()) || !E_regex.test($('#primaryEmail').val()) || jQuery.isEmptyObject($('#primaryEmail').val()) || !p_regex.test(viewModel.contactDetails().PhoneNumber()[0].CompleteNumber()) || !p_regex.test(viewModel.contactDetails().PhoneNumber()[1].CompleteNumber()) || !p_regex.test(viewModel.contactDetails().PhoneNumber()[2].CompleteNumber())) {
        if (ko.mapping.fromJSON(localStorage.CustomerData).contactDetails() == ko.mapping.toJSON(viewModel.contactDetails())) {
            $('#pEmail-Error').empty();
            $('#pEmail-Error').append('No updates made');
            $('#pEmail-Error').show();
            return;
        }
        if (!E_regex.test(viewModel.contactDetails().Email()[0].Value())) {
            $('#pEmail-Error').empty();
            $('#pEmail-Error').append('Please enter a valid email');
            $('#pEmail-Error').show();
        }
        if (jQuery.isEmptyObject(viewModel.contactDetails().Email()[0].Value())) {
            $('#pEmail-Error').empty();
            $('#pEmail-Error').append('Email cannot be blank');
            $('#pEmail-Error').show();
        }
        if (!SE_regex.test(viewModel.contactDetails().Email()[1].Value())) {
            $('#pEmail-Error').empty();
            $('#pEmail-Error').append('Please enter a valid secondary email');
            $('#pEmail-Error').show();
        }
        if (!p_regex.test(viewModel.contactDetails().PhoneNumber()[0].CompleteNumber())) {
            $('#hPhone-Error').empty();
            $('#hPhone-Error').append('Enter a valid home phone number');
            $('#hPhone-Error').show();
        }
        if (!p_regex.test(viewModel.contactDetails().PhoneNumber()[1].CompleteNumber())) {
            $('#cPhone-Error').empty();
            $('#cPhone-Error').append('Enter a valid cell phone number');
            $('#cPhone-Error').show();
        }
        if (!p_regex.test(viewModel.contactDetails().PhoneNumber()[2].CompleteNumber())) {
            $('#bPhone-Error').empty();
            $('#bPhone-Error').append('Enter a valid business phone number');
            $('#bPhone-Error').show();
        }
        return;
        $.mobile.hidePageLoadingMsg();
    } else {
        var submitData = new Object();
        submitData.contactDetails = ko.mapping.toJS(viewModel.contactDetails())
        $.mobile.showPageLoadingMsg();
        $.ajax({
            type: "POST",
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/UpdateUserProfileData",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                if (data.d.ErrorCode == null && data.d.ErrorMessage == null) {
                    MyProfilePopulate(data)
                    statusModel.updateProfileDetailsError(false);
                    $.mobile.changePage('myprofileconfirm.html', {
                        transition: "slide"
                    });
                }
                else if (data.d.ErrorCode == 'E00420') {
                    $('#pEmail-Error').empty();
                    $('#pEmail-Error').append('Our records indicate the primary email address you entered is already in use. Please enter a new email address and try again.');
                    $('#pEmail-Error').show();
                    return;
                }
                else if (data.d.ErrorCode == 'E00421') {
                    $('#pEmail-Error').empty();
                    $('#pEmail-Error').append('Our records indicate the secondary email address you entered is already in use. Please enter a new email address and try again.');
                    $('#pEmail-Error').show();
                    return;
                }
                else if (data.d.ErrorCode == 'E00422') {
                    $('#pEmail-Error').empty();
                    $('#pEmail-Error').append('Our records indicate the primary & secondary email address you entered are already in use. Please enter a new email address and try again.');
                    $('#pEmail-Error').show();
                    return;
                }
                else {
                    statusModel.updateProfileDetailsError(true);
                    $.mobile.changePage('myprofileconfirm.html', {
                        transition: "slide"
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) { },
            complete: function () {
                $.mobile.hidePageLoadingMsg();
            }
        });
    }
}


$(document).on('pageinit', '#myprofile-page', function (event) {
    $(function () {
        $('.penedit').click(function () {
            $('#Profile-Error').hide();
            $('#Profile-Error').empty();
            $('#pEmail-Error').hide();
            $('#pEmail-Error').empty();
            $('#hPhone-Error').hide();
            $('#hPhone-Error').empty();
            $('#cPhone-Error').hide();
            $('#cPhone-Error').empty();
            $('#bPhone-Error').hide();
            $('#bPhone-Error').empty();
            $(this).hide();
            $(this).next().hide();
            $(this).next().next().show();
            $(this).next().next().children().show();
            $('#' + $(this).attr('foredit')).parent().show();
            $('#' + $(this).attr('foredit')).select();
        });

        $('.edittextclass').blur(function () {
            $(this).parent().hide();
            $(this).hide();
            $(this).parent().prev().show();
            $(this).parent().prev().prev().show();
        });

        $('.edittextclass').keypress(function (event) {
            if (event.keyCode == '13') {
                $(this).hide();
                $(this).parent().prev().show();
                $(this).parent().prev().prev().show();
            }
        });
    });

});

function initJQMControls() {
    ko.bindingHandlers.jqmRefreshList = {
        update: function (element, valueAccessor) {
            ko.utils.unwrapObservable(valueAccessor());
            $(element).listview("refresh");
        }
    }
    ko.bindingHandlers.jqmRefreshListItem = {
        update: function (element, valueAccessor) {
            ko.utils.unwrapObservable(valueAccessor());

            $(element).parent().parent().parent().parent().listview('refresh')
        }
    }

    ko.bindingHandlers.jqmRefreshSelect = {
        update: function (element, valueAccessor) {
            ko.utils.unwrapObservable(valueAccessor());

            $(element).selectmenu("refresh");
        }
    }

    ko.bindingHandlers.jqmRefreshCheck = {
        update: function (element, valueAccessor) {
            ko.utils.unwrapObservable(valueAccessor());

            $(element).checkboxradio("refresh");
        }
    }

}


////Knockout Model//////////////
var viewModel;
function PaymentAccount() {
    this.accountHolderName = ko.observable("");
    this.accountNumber = ko.observable("");
    this.id = ko.observable("");
    this.maskedAccountNumber = ko.observable("");
    this.nickName = ko.observable("");
    this.nocViewed = ko.observable(true);
    this.routingNumber = ko.observable("");
    this.status = ko.observable("");
    this.type = ko.observable("checking");
}

function Payment() {
    this.amount = ko.observable("1.00");
    this.amountType = ko.observable("amountDue");
    this.bankAccountId = ko.observable("");
    this.date = ko.observable("");
    this.dateProcessed = ko.observable("");
    this.dateSubmitted = ko.observable("");
    this.dateType = ko.observable("dueDate");
    this.encryptedTransactionId = ko.observable("");
    //this.payDate = ko.observable("");
    this.status = ko.observable("");
    this.transactionId = ko.observable("");
    this.userId = ko.observable("");
}

function recurringPayment() {
    this.threshold = ko.observable("");
    this.amountType = ko.observable("amount due");
    this.bankAccountId = ko.observable("");
    this.billingAccountNumber = ko.observable("");
    this.currentNumberOfPayments = ko.observable("")
    this.dateType = ko.observable("dueDate");
    this.daysBeforeDue = ko.observable("0");
    this.effectivePeriod = ko.observable("untilCanceled");
    this.endDate = ko.observable("");
    this.numberOfPayments = ko.observable("");
    this.startDate = ko.observable("");
    this.status = ko.observable("");
    this.paymentAccount = ko.observable(null);
}

function PhoneContact() {
    this.CompleteNumber = ko.observable("");
    this.SequenceNo = ko.observable("");
    this.Usage = ko.observable("");
}

function EmailContact() {
    this.Value = ko.observable("");
    this.Usage = ko.observable("");
}

function StatusViewModel() {
    var self = this;
    self.schedPaymentError = ko.observable(true);
    self.scheddelPaymentError = ko.observable(true);
    self.schededitPaymentError = ko.observable(true);
    self.automatedPaymentError = ko.observable(true);
    self.editPaymentError = ko.observable(true);
    self.deletePaymentError = ko.observable(true);
    self.paymentactivityError = ko.observable(true);
    self.queryPaymentAccountError = ko.observable(true);
    self.addPaymentAccountError = ko.observable(true);
    self.delPaymentAccountError = ko.observable(true);
    self.editPaymentAccountError = ko.observable(true);
    self.queryPaymentDetailsError = ko.observable(true);
    self.updateProfileDetailsError = ko.observable(true);
}

function CANPViewModel() {
    var self = this;
    self.payments = ko.observableArray([]);
    self.bankAccounts = ko.observableArray([]);
    self.selectedAccount = ko.observable(null);
    self.accountTypes = ko.observableArray(['saving', 'checking']);
    self.accountSummary = null;
    self.discAmount = 0;
    self.webuserId = null;
    self.canpMessages = ko.observable(null);
    self.globalAlert = ko.observable(null);
    self.accountalert = ko.observable(null);
    self.canpPrograms = ko.observableArray([]);
    self.loginErrorCode = ko.observable(null);
    self.disconnectnotice = ko.observable(false);
    self.disconnectAmount = ko.observable(null);
    self.selectedProgUrl = ko.observable(null);
    self.selectedProgName = ko.observable(null);
    self.selectedProgTarget = ko.observable(null);
    self.selectedPayment = ko.observable(null);
    self.selectedrecurringPayment = ko.observable(null);
    self.paymentDetails = ko.observable(null);
    self.alertClosed = ko.observable(true);
    self.contactDetails = ko.observable(null);
    self.CSSBlocked = ko.observable(null);
    self.daysBefore = ko.observableArray(['0', '1', '2', '3', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']);
    self.findGetMessage = function (id) {
        if (!jQuery.isEmptyObject(self.canpMessages())) {
            for (var message in self.canpMessages()) {
                if (this.canpMessages()[message].id() == id) {
                    return self.canpMessages()[message].content();
                }
            }
            return "We are currently experiencing technical issues. Please try again later";
        } else {
            return "We are currently experiencing technical issues. Please try again later";
        }
    }

    self.formatCurrency = function (value) {
        return "$" + parseFloat(value).toFixed(2);
    }

    self.findStatus = function (status) {
        return $.grep(viewModel.bankAccounts(), function (item) {
            return item.status() == status;
        });
    };
    self.findNocViewed = function (nocviewed) {
        return $.grep(viewModel.bankAccounts(), function (item) {
            return item.nocViewed() == nocviewed;
        });
    };
    self.clean = function () {
        self.payments = ko.observableArray([]);
        self.bankAccounts = ko.observableArray([]);
        self.selectedAccount = ko.observable(null);
        self.accountSummary = null;
        self.discAmount = 0;
        self.webuserId = null;
        self.canpMessages = ko.observable(null);
        self.globalAlert = ko.observable(null);
        self.accountalert = ko.observable(null);
        self.canpPrograms = ko.observableArray([]);
        self.loginErrorCode = ko.observable(null);
        self.disconnectnotice = ko.observable(false);
        self.disconnectAmount = ko.observable(null);
        self.selectedProgUrl = ko.observable(null);
        self.selectedProgName = ko.observable(null);
        self.selectedProgTarget = ko.observable(null);
        self.selectedPayment = ko.observable(null);
        self.selectedrecurringPayment = ko.observable(null);
        self.paymentDetails = ko.observable(null);
        self.alertClosed = ko.observable(true);
        self.contactDetails = ko.observable(null);
        self.CSSBlocked = ko.observable(null);
    }

    self.getFromLocal = function () {
        if (localStorage.length > 0) {
            localData = JSON.parse(localStorage['CustomerData']);
            self.accountSummary = localData.accountSummary;
            self.discAmount = localData.discAmount;
            self.webuserId = localData.webuserId;
            self.canpMessages(ko.mapping.fromJSON(localData.canpMessages)());
            self.globalAlert(ko.mapping.fromJSON(localData.globalAlert)());
            self.accountalert(ko.mapping.fromJSON(localData.accountalert)());
            self.bankAccounts(ko.mapping.fromJSON(localData.bankAccounts)());
            self.selectedAccount(ko.mapping.fromJSON(localData.selectedAccount));
            self.disconnectnotice(ko.mapping.fromJSON(localData.disconnectnotice)());
            self.disconnectAmount(ko.mapping.fromJSON(localData.disconnectAmount)());
            self.canpPrograms(ko.mapping.fromJSON(localData.canpPrograms)());
            self.selectedPayment(ko.mapping.fromJSON(localData.selectedPayment));
            self.selectedrecurringPayment(ko.mapping.fromJSON(localData.selectedrecurringPayment));
            self.payments(ko.mapping.fromJSON(localData.payments)());
            self.paymentDetails(ko.mapping.fromJSON(localData.paymentDetails));
            self.alertClosed(ko.mapping.fromJSON(localData.alertClosed)());
            self.contactDetails(ko.mapping.fromJSON(localData.contactDetails));
            self.CSSBlocked(ko.mapping.fromJSON(localData.CSSBlocked)());
        }

    }
    self.saveToLocal = function () {
        var localData = new Object();
        localData.accountSummary = self.accountSummary;
        localData.discAmount = self.discAmount;
        localData.webuserId = self.webuserId;
        localData.canpMessages = ko.mapping.toJSON(self.canpMessages);
        localData.globalAlert = ko.mapping.toJSON(self.globalAlert)
        localData.accountalert = ko.mapping.toJSON(self.accountalert);
        localData.bankAccounts = ko.mapping.toJSON(self.bankAccounts);
        localData.selectedAccount = ko.mapping.toJSON(self.selectedAccount);
        localData.disconnectnotice = ko.mapping.toJSON(self.disconnectnotice);
        localData.disconnectAmount = ko.mapping.toJSON(self.disconnectAmount);
        localData.canpPrograms = ko.mapping.toJSON(self.canpPrograms);
        localData.selectedPayment = ko.mapping.toJSON(self.selectedPayment);
        localData.selectedrecurringPayment = ko.mapping.toJSON(self.selectedrecurringPayment);
        localData.payments = ko.mapping.toJSON(self.payments);
        localData.paymentDetails = ko.mapping.toJSON(self.paymentDetails);
        localData.alertClosed = ko.mapping.toJSON(self.alertClosed);
        localData.contactDetails = ko.mapping.toJSON(self.contactDetails);
        localData.CSSBlocked = ko.mapping.toJSON(self.CSSBlocked);
        localStorage['CustomerData'] = JSON.stringify(localData);
    }

    self.initAccounts = function () {

        $.mobile.showPageLoadingMsg();
        viewModel.getFromLocal();
        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/GetPaymentAccounts",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    var mappedAccounts = ko.mapping.fromJS(allData.d.BankAccounts);
                    viewModel.bankAccounts(mappedAccounts());
                    viewModel.saveToLocal();
                    statusModel.queryPaymentAccountError(false);
                } else {
                    statusModel.queryPaymentAccountError(true);
                }
            },
            async: false,
            complete: function (allData) { $.mobile.hidePageLoadingMsg(); }

        });
    };


    self.removeAccount = function () {
        viewModel.bankAccounts.remove(this);
    }

    self.addAccount = function () {
        viewModel.selectedAccount(new PaymentAccount());
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-accounts-new.html', {
            transition: "slide"
        });
    }

    self.addPayment = function () {

        if (viewModel.bankAccounts().length != 0 && viewModel.findStatus('active').length > 0) {
            var payment = new Payment();
            payment.amount(viewModel.accountSummary.NetAmountDue);
            payment.amountType("amountDue");
            payment.date(viewModel.accountSummary.DueDate);
            payment.dateType("dueDate");
            viewModel.selectedPayment(payment);
            viewModel.saveToLocal();
            $.mobile.changePage('pmt-schedule.html', {
                transition: "slide"
            });
        } else {
            this.addAccount();
        }
    }

    self.delrecPayment = function () {
        $.mobile.changePage('pmt-automated-dconfirm.html', {
            transition: "slide"
        });

    }

    self.editrecPayment = function () {
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-edit-automated.html', {
            transition: "slide"
        });
    }

    self.editschedPayment = function () {
        viewModel.selectedPayment(viewModel.paymentDetails().paymentDetails);
        viewModel.selectedPayment().bankAccountId(viewModel.paymentDetails().paymentDetails.bankAccount.id());
        if (viewModel.selectedPayment().amountType() == 'amountDue')
            viewModel.selectedPayment().amount('');
        if (viewModel.selectedPayment().dateType() == 'dueDate')
            viewModel.selectedPayment().date('');
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-edit-schedule.html', {
            transition: "slide"
        });
    }

    self.editconfirmrecPayment = function () {
        $('#autoPayment-Error').hide();
        if (this.selectedrecurringPayment().amountType() == 'upto amount') {
            // regex does not matches
            if ($('#amtnexceed').val() != "" && recpayment_regex.test($('#amtnexceed').val()) && $('#amtnexceed').val() >= resi_min && $('#amtnexceed').val() <= resi_max && $('#amtnexceed').val() >= com_min && $('#amtnexceed').val() <= com_max) {
                this.selectedrecurringPayment().threshold($('#amtnexceed').val());
            } else {
                if ($('#amtnexceed').val() == "") {
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter total amount not to exceed field.');
                    return;
                }
                if (!recpayment_regex.test($('#amtnexceed').val())) { // regex matches
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter a valid amount.');
                    return;
                }

                if (viewModel.accountSummary.IsCommercial == false) {
                    if ($('#amtnexceed').val() < resi_min || $('#amtnexceed').val() > resi_max) { // regex matches
                        $('#autoPayment-Error').empty();
                        $('#autoPayment-Error').show();
                        $('#autoPayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99 for residential customers');
                        return;
                    }
                }
                else {
                    if ($('#amtnexceed').val() < com_min || $('#amtnexceed').val() > com_max) {
                        $('#autoPayment-Error').empty();
                        $('#autoPayment-Error').show();
                        $('#autoPayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,9999.99 for commercial customers ');
                        return;

                    }

                }

            }
        }
        if (this.selectedrecurringPayment().dateType() == 'dueDate') {
            this.selectedrecurringPayment().dateType('before due')
            this.selectedrecurringPayment().daysBeforeDue('0');
        } else if (this.selectedrecurringPayment().dateType() == 'before due') {
            this.selectedrecurringPayment().daysBeforeDue($('#dldaysbefor').val());
        }
        if (this.selectedrecurringPayment().effectivePeriod() == 'maxPayments') {
            if ($('#xpayments').val() != "" && numberofpayments_regex.test($('#xpayments').val())) {
                this.selectedrecurringPayment().numberOfPayments($('#xpayments').val());
            } else {
                if ($('#xpayments').val() == "") {
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter for number of payments');
                    return;
                }
                if (!numberofpayments_regex.test($('#xpayments').val())) { // regex matches
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('number of payments cannot be 0.');
                    return;
                }

            }
        }

        if (this.selectedrecurringPayment().effectivePeriod() == 'endDate') {
            if ($('#untildate').val() == "") {
                $('#autoPayment-Error').empty();
                $('#autoPayment-Error').show();
                $('#autoPayment-Error').append('Please enter a until date');
                return;
            }
        }
        for (i = 0; i < viewModel.bankAccounts().length; i++) {

            if (viewModel.bankAccounts()[i].id() == viewModel.selectedrecurringPayment().bankAccountId())
                viewModel.selectedAccount(viewModel.bankAccounts()[i])
        }

        viewModel.saveToLocal();
        $.mobile.changePage('pmt-automated-econfirm.html', {
            transition: "slide"
        });
    }


    self.recPayment = function () {
        var rPayment = new recurringPayment();
        rPayment.threshold('');
        rPayment.amountType('amount due');
        rPayment.bankAccountId('');
        rPayment.billingAccountNumber('');
        rPayment.currentNumberOfPayments('');
        rPayment.dateType('dueDate');
        rPayment.daysBeforeDue('0');
        rPayment.effectivePeriod('untilCanceled');
        rPayment.endDate('');
        rPayment.numberOfPayments('');
        rPayment.startDate('');
        rPayment.status('');
        rPayment.paymentAccount(null);
        viewModel.selectedrecurringPayment(rPayment);
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-automated.html', {
            transition: "slide"
        });

    }

    self.viewAccount = function (account) {
        viewModel.selectedAccount(account);
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-accounts-view.html', {
            transition: "slide"
        });
    }

    self.editAccount = function () {
        $.mobile.changePage('pmt-accounts-edit.html', {
            transition: "slide"
        });
    }

    self.resetAccount = function () {
        viewModel.initAccounts();
        $.mobile.changePage('pmt-accounts.html', {
            transition: "slide"
        });
    }

    self.createAccount = function () {
        $('#addAccounts-Error').hide();
        $('#addbankAccount-Error').hide();
        if ($.isEmptyObject($('#nickName').val()) || $.isEmptyObject($('#accountHolderName').val()) || $.isEmptyObject($('#routingNumber').val()) || $.isEmptyObject($('#accountNumber').val())) {
            $('#addAccounts-Error').show();
            $('#addAccounts-Error').empty();
            $('#addAccounts-Error').append('All fields are required.');
            return;
        }
        else if (!validateRouting($('#routingNumber').val()) || !Bankaccount_regex.test($('#accountNumber').val())) {
            if (!validateRouting($('#routingNumber').val())) {
                $('#addAccounts-Error').show();
                $('#addAccounts-Error').empty();
                $('#addAccounts-Error').append('Please enter a valid bank routing number.');
                return;
            }
            if (!Bankaccount_regex.test($('#accountNumber').val())) {
                $('#addbankAccount-Error').show();
                $('#addbankAccount-Error').empty();
                $('#addbankAccount-Error').append('Please enter a valid bank account number.');
                return;
            }
        }

        viewModel.saveToLocal();
        $.mobile.changePage('pmt-accounts-nconfirm.html', { transition: "slide" });

    }


    self.confirmCreateAccount = function () {
        $.mobile.showPageLoadingMsg();
        submitData = new Object();
        submitData.paymentAccount = self.selectedAccount();
        $.ajax({
            type: "POST",
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/CreatePaymentAccount",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    var mappedAccounts = ko.mapping.fromJS(allData.d.BankAccounts);
                    viewModel.bankAccounts(mappedAccounts());
                    viewModel.saveToLocal();
                    statusModel.addPaymentAccountError(false);
                } else {
                    statusModel.addPaymentAccountError(true);

                }
                $.mobile.changePage('pmt-accounts-nfinal.html', {
                    transition: "slide"
                });
            },
            async: true,
            error: function (xhr, textStatus, errorThrown) {
                statusModel.addPaymentAccountError(true);
                $.mobile.changePage('pmt-accounts-nfinal.html', {
                    transition: "slide"
                });
            },
            complete: function (allData) {
                $.mobile.hidePageLoadingMsg();
            }
        });
    }


    self.updateAccount = function () {
        $('#editAccounts-Error').hide();
        $('#editbankAccount-Error').hide();
        if ($.isEmptyObject($('#nickName').val()) || $.isEmptyObject($('#accountHolderName').val()) || $.isEmptyObject($('#routingNumber').val()) || $.isEmptyObject($('#accountNumber').val())) {
            $('#editAccounts-Error').show();
            $('#editAccounts-Error').empty();
            $('#editAccounts-Error').append('All fields are required.');
            return;
        } else if (!validateRouting($('#routingNumber').val()) || !Bankaccount_regex.test($('#accountNumber').val())) {
            if (!validateRouting($('#routingNumber').val())) {
                $('#editAccounts-Error').show();
                $('#editAccounts-Error').empty();
                $('#editAccounts-Error').append('Please enter a valid bank routing number.');
                return;
            }
            if (!Bankaccount_regex.test($('#accountNumber').val())) {
                $('#editbankAccount-Error').show();
                $('#editbankAccount-Error').empty();
                $('#editbankAccount-Error').append('Please enter a valid bank account number.');
                return;
            }
        }

        viewModel.saveToLocal();
        $.mobile.changePage('pmt-accounts-econfirm.html', { transition: "slide" });
    }


    self.confirmUpdateAccount = function () {
        $.mobile.showPageLoadingMsg();
        submitData = new Object();
        submitData.paymentAccount = self.selectedAccount();
        $.ajax({
            type: "POST",
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/EditPaymentAccount",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    var mappedAccounts = ko.mapping.fromJS(allData.d.BankAccounts);
                    viewModel.bankAccounts(mappedAccounts());
                    viewModel.saveToLocal();
                    statusModel.editPaymentAccountError(false);
                } else {
                    statusModel.editPaymentAccountError(true);
                }
                $.mobile.changePage('pmt-accounts-efinal.html', {
                    transition: "slide"
                });
            },
            async: true,
            error: function (xhr, textStatus, errorThrown) {
                statusModel.addPaymentAccountError(true);
                $.mobile.changePage('pmt-accounts-efinal.html', {
                    transition: "slide"
                });
            },
            complete: function (allData) {
                $.mobile.hidePageLoadingMsg();
            }
        });
    }


    self.deleteAccount = function () {
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-accounts-dconfirm.html', { transition: "slide" });

    }

    self.ConfirmDeleteAccount = function () {
        $.mobile.showPageLoadingMsg();
        submitData = new Object();
        submitData.uniqueId = self.selectedAccount().id();
        $.ajax({
            type: "POST",
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/DeletePaymentAccount",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    var mappedAccounts = ko.mapping.fromJS(allData.d.BankAccounts);
                    viewModel.bankAccounts(mappedAccounts());
                    viewModel.saveToLocal();
                    statusModel.delPaymentAccountError(false);
                } else {
                    statusModel.delPaymentAccountError(true);
                }
                $.mobile.changePage('pmt-accounts-dfinal.html', {
                    transition: "slide"
                });
            },
            async: true,
            error: function (xhr, textStatus, errorThrown) {
                statusModel.delPaymentAccountError(true);
                $.mobile.changePage('pmt-accounts-dfinal.html', {
                    transition: "slide"
                });
            },
            complete: function (allData) {
                $.mobile.hidePageLoadingMsg();
            }

        });
    }


    /*Payment transaction */

    self.getpaymentDetails = function (encryptedTransactionId) {
        var paymentTransID = {
            "encTransId": this.encryptedTransactionId()
        }
        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            data: JSON.stringify(paymentTransID),
            url: "/_layouts/Bge.Canp/SecureServices.asmx/QueryPaymentDetails",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            global: false,
            success: function (msg) {
                if (msg.d.ErrorCode == null && msg.d.ErrorMessage == null) {
                    viewModel.getFromLocal();
                    var mappedDetails = ko.mapping.fromJS(msg.d);
                    viewModel.paymentDetails(mappedDetails);
                    viewModel.saveToLocal();
                    statusModel.queryPaymentDetailsError(false);

                } else {
                    statusModel.queryPaymentDetailsError(true);
                }
                $.mobile.changePage('pmt-transaction.html', {
                    transition: "slide"
                });

            },
            error: function (xhr, textStatus, errorThrown) {
                statusModel.queryPaymentDetailsError(true);
                $.mobile.changePage('pmt-transaction.html', {
                    transition: "slide"
                });
            }
        });
    }

    self.cancelschedulePayment = function (encryptedTransactionId) {
        var paymentTransID = {
            "encTransId": this.paymentDetails().paymentDetails.encryptedTransactionId()
        }

        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            data: JSON.stringify(paymentTransID),
            url: "/_layouts/Bge.Canp/SecureServices.asmx/CancelPayment",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            global: false,
            success: function (msg) {
                if (msg.d.ErrorCode == null && msg.d.ErrorMessage == null) {

                    statusModel.scheddelPaymentError(false);

                } else {
                    statusModel.scheddelPaymentError(true);
                }

                $.mobile.changePage('pmt-schedule-dfinal.html', {
                    transition: "slide"
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                statusModel.scheddelPaymentError(true);
                $.mobile.changePage('pmt-schedule-dfinal.html', {
                    transition: "slide"
                });
            }
        });

    }

    /*Payment Activity */
    self.queryPayments = function () {
        $.mobile.showPageLoadingMsg();
        var strippedactivity = new Array()
        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/QueryAllPayments",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    if (allData.d.payments.length >= 5)
                        strippedactivity = (allData.d.payments).slice(Math.max(allData.d.payments.length - 5, 1));
                    else
                        strippedactivity = allData.d.payments;
                    viewModel.payments(ko.mapping.fromJS(strippedactivity)().reverse());
                    viewModel.saveToLocal();
                    statusModel.paymentactivityError(false);
                    $.mobile.changePage('pmt-activity.html', {
                        transition: "slide"
                    });
                } else {
                    statusModel.paymentactivityError(true);
                    $.mobile.changePage('pmt-activity.html', {
                        transition: "slide"
                    });
                }
            },
            async: true,
            error: function (xhr, textStatus, errorThrown) {
                statusModel.paymentactivityError(true);
                $.mobile.changePage('pmt-activity.html', {
                    transition: "slide"
                });
            },
            complete: function (allData) {
                $.mobile.hidePageLoadingMsg();
            }
        });
    }

    /* edit a schedule payment */
    self.submitEditPayment = function () {

        var amtDue = viewModel.accountSummary.NetAmountDue.replace('$', '')

        $('#schedulePayment-Errorr').hide();
        pay = new Payment();

        if (this.selectedPayment().amountType() == "amountDue") {
            if (viewModel.accountSummary.IsCommercial == false) {

                if (amtDue.indexOf('cr') != -1 || amtDue < resi_min || amtDue > resi_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99');
                    return;
                }
                else {
                    this.selectedPayment().amount(viewModel.accountSummary.NetAmountDue.replace('$', ''));
                }
            }
            else {
                if (amtDue.indexOf('cr') != -1 || amtDue < com_min || amtDue > com_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $99,999.99 for commercial');
                    return;

                }
                else {
                    this.selectedPayment().amount(viewModel.accountSummary.NetAmountDue.replace('$', ''));
                }

            }
        }
        else if (this.selectedPayment().amountType() == "discAmount") {
            this.selectedPayment().amount(this.discAmount);
            this.selectedPayment().amountType("specifiedAmount");
        } else if (this.selectedPayment().amountType() == "specifiedAmount") {
            this.selectedPayment().amountType("specifiedAmount");
            var samtDue = $('#amtSpecific').val();
            if ($('#amtSpecific').val() == "") {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Error').show();
                $('#schedulePayment-Error').append('Please specify an amount');
                return;
            }
            if (!recpayment_regex.test($('#amtSpecific').val())) {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Error').show();
                $('#schedulePayment-Error').append('Please specify an valid amount');
                return;

            }
            if (viewModel.accountSummary.IsCommercial == false) {
                if (samtDue < resi_min || samtDue > resi_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99 for residential customers');
                    return;
                }
            }
            else {
                var celiednetamountdue = Math.ceil(viewModel.accountSummary.NetAmountDue.replace('$', ''));

                if (samtDue < com_min || samtDue > com_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $99,999.99 for commercial customers');
                    return;

                }


            }
        }
        if (recpayment_regex.test($('#amtSpecific').val()) && $('#amtSpecific').val() != "") {
            this.selectedPayment().amount($('#amtSpecific').val().replace('$', ''));
        }

        if (this.selectedPayment().dateType() == "dueDate")
            this.selectedPayment().date(viewModel.accountSummary.DueDate);
        else {

            if ($('#epayDate').val() == "") {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Errorr').show();
                $('#schedulePayment-Error').append('Please enter a future date');
                return;
            }
            this.selectedPayment().date($('#epayDate').val());
        }
        for (i = 0; i < viewModel.bankAccounts().length; i++) {
            if (viewModel.bankAccounts()[i].id() == viewModel.selectedPayment().bankAccountId()) {
                viewModel.selectedAccount(viewModel.bankAccounts()[i]);
            }
        }

        viewModel.saveToLocal()

        $.mobile.changePage('pmt-schedule-econfirm.html', {
            transition: "slide"
        });
    }



    /* Submit a schdule payment */
    self.submitPayment = function () {

        $('#schedulePayment-Error').hide();
        pay = new Payment();
        var amtDue = viewModel.accountSummary.NetAmountDue.replace('$', '')

        if (this.selectedPayment().dateType() == "dueDate") {
            this.selectedPayment().date(viewModel.accountSummary.DueDate);
        } else {

            if ($('#payDate').val() == "") {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Error').show();
                $('#schedulePayment-Error').append('Please enter a pay date');
                return;
            }
            this.selectedPayment().date($('#payDate').val());

        }
        if (this.selectedPayment().amountType() == "amountDue") {
            if (viewModel.accountSummary.IsCommercial == false) {

                if (amtDue.indexOf('cr') != -1 || amtDue < resi_min || amtDue > resi_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99');
                    return;
                }
                else {
                    this.selectedPayment().amount(viewModel.accountSummary.NetAmountDue.replace('$', ''));
                }
            }
            else {
                if (amtDue.indexOf('cr') != -1 || amtDue < com_min || amtDue > com_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $99,999.99 for commercial');
                    return;

                }
                else {
                    this.selectedPayment().amount(viewModel.accountSummary.NetAmountDue.replace('$', ''));
                }

            }
        }
        else if (this.selectedPayment().amountType() == "discAmount") {
            this.selectedPayment().amount(this.discAmount);
            this.selectedPayment().amountType("specifiedAmount");
        } else if (this.selectedPayment().amountType() == "specifiedAmount") {
            this.selectedPayment().amountType("specifiedAmount");
            var samtDue = $('#amtSpecificPayment').val();
            if ($('#amtSpecificPayment').val() == "") {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Error').show();
                $('#schedulePayment-Error').append('Please specify an amount');
                return;
            }
            if (!recpayment_regex.test($('#amtSpecificPayment').val())) {
                $('#schedulePayment-Error').empty();
                $('#schedulePayment-Error').show();
                $('#schedulePayment-Error').append('Please specify an valid amount');
                return;

            }
            if (viewModel.accountSummary.IsCommercial == false) {
                if (samtDue < resi_min || samtDue > resi_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99 for residential');
                    return;
                }
            } else {
                var celiednetamountdue = Math.ceil(viewModel.accountSummary.NetAmountDue.replace('$', ''));


                if (samtDue < com_min || samtDue > com_max) {
                    $('#schedulePayment-Error').empty();
                    $('#schedulePayment-Error').show();
                    $('#schedulePayment-Error').append('Payment amount cannot be less than $0.01 and greater than $99,999.99 for commercial');
                    return;

                }

            }
            if (recpayment_regex.test($('#amtSpecificPayment').val()) && $('#amtSpecificPayment').val() != "") {
                this.selectedPayment().amount($('#amtSpecificPayment').val().replace('$', ''));
            }
        }

        for (i = 0; i < viewModel.bankAccounts().length; i++) {
            if (viewModel.bankAccounts()[i].id() == viewModel.selectedPayment().bankAccountId())
                viewModel.selectedAccount(viewModel.bankAccounts()[i])
        }

        viewModel.saveToLocal()

        $.mobile.changePage('pmt-schedule-confirm.html', {
            transition: "slide"
        });
    }



    /* Edit scheduled payment */
    self.editschedulePayment = function () {
        submitData = new Object();
        viewModel.selectedPayment().payDate('');
        submitData.payment = this.selectedPayment();
        $.ajax({
            url: '/_layouts/Bge.Canp/SecureServices.asmx/EditPayment',
            type: 'POST',
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            contentType: "application/json; charset=utf-8",
            dataType: 'JSON',
            success: function (allData) {

                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    viewModel.selectedPayment.transactionId = allData.d.transactionId;
                    viewModel.saveToLocal();
                    statusModel.schededitPaymentError(false);
                    $.mobile.changePage('pmt-schedule-efinal.html', {
                        transition: "slide"
                    });
                } else {
                    statusModel.schededitPaymentError(true);
                    $.mobile.changePage('pmt-schedule-efinal.html', {
                        transition: "slide"
                    });
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                statusModel.schededitPaymentError(true);
                $.mobile.changePage('pmt-schedule-efinal.html', {
                    transition: "slide"
                });
            }

        });
    }

    /* add Automate Payment */
    self.schedulePayment = function () {

        submitData = new Object();
        submitData.payment = this.selectedPayment();

        $.ajax({
            url: '/_layouts/Bge.Canp/SecureServices.asmx/SchedulePayment',
            type: 'POST',
            data: ko.mapping.toJSON(submitData),
            headers: {
                "cache-control": "no-cache"
            },
            contentType: "application/json; charset=utf-8",
            dataType: 'JSON',
            success: function (allData) {

                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {

                    viewModel.selectedPayment.transactionId = allData.d.transactionId;
                    viewModel.saveToLocal();
                    statusModel.schedPaymentError(false);
                } else {
                    statusModel.schedPaymentError(true);
                }
                $.mobile.changePage('pmt-schedule-final.html', {
                    transition: "slide"
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                statusModel.schedPaymentError(true);
                $.mobile.changePage('pmt-schedule-final.html', {
                    transition: "slide"
                });
            }
        });
    }

    /* querying recurring payment */
    self.queryrecurringPayment = function () {
        rp = new recurringPayment();
        viewModel.selectedrecurringPayment(rp);
        viewModel.saveToLocal();
        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/QueryRecurringPayment",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    viewModel.selectedrecurringPayment(ko.mapping.fromJS(allData.d.recurringPayment));
                    viewModel.saveToLocal();
                    statusModel.queryPaymentDetailsError(false);
                    $.mobile.changePage('pmt-view-recurring.html', {
                        transition: "slide"
                    });
                } else if (allData.d.ErrorCode == 'E00600') {
                    if (viewModel.bankAccounts().length != 0 && viewModel.findStatus('active').length > 0)
                        $.mobile.changePage('pmt-automated.html', {
                            transition: "slide"
                        });
                    else {
                        $.mobile.changePage('pmt-accounts-new.html', {
                            transition: "slide"
                        });
                    }
                }
            },
            async: false
        });
    }

    /* Submit recurring payment */

    self.submitrecurringPayment = function () {
        $('#autoPayment-Error').hide();
        if (this.selectedrecurringPayment().amountType() == 'upto amount') {
            // regex does not matches
            if ($('#amtntexceed').val() != "" && recpayment_regex.test($('#amtntexceed').val()) && $('#amtntexceed').val() >= resi_min && $('#amtntexceed').val() <= resi_max && $('#amtntexceed').val() >= com_min && $('#amtntexceed').val() <= com_max) {
                this.selectedrecurringPayment().threshold($('#amtntexceed').val());
            } else {
                if ($('#amtntexceed').val() == "") {
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter total amount not to exceed field.');
                    return;
                }
                if (!recpayment_regex.test($('#amtntexceed').val())) { // regex matches
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter a valid amount.');
                    return;
                }

                if (viewModel.accountSummary.IsCommercial == false) {
                    if ($('#amtntexceed').val() < resi_min || $('#amtntexceed').val() > resi_max) { // regex matches
                        $('#autoPayment-Error').empty();
                        $('#autoPayment-Error').show();
                        $('#autoPayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,999.99 for residential customers');
                        return;
                    }
                }
                else {
                    if ($('#amtntexceed').val() < com_min || $('#amtntexceed').val() > com_max) {
                        $('#autoPayment-Error').empty();
                        $('#autoPayment-Error').show();
                        $('#autoPayment-Error').append('Payment amount cannot be less than $0.01 and greater than $9,9999.99 for commercial customers ');
                        return;

                    }

                }

            }
        }
        if (this.selectedrecurringPayment().dateType() == 'dueDate') {
            this.selectedrecurringPayment().dateType('before due')
            this.selectedrecurringPayment().daysBeforeDue('0');
        } else if (this.selectedrecurringPayment().dateType() == 'before due') {
            this.selectedrecurringPayment().daysBeforeDue($('#dldaysbefor').val());
        }
        if (this.selectedrecurringPayment().effectivePeriod() == 'maxPayments') {
            if ($('#xpayments').val() != "" && numberofpayments_regex.test($('#xpayments').val())) {
                this.selectedrecurringPayment().numberOfPayments($('#xpayments').val());
            } else {
                if ($('#xpayments').val() == "") {
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('Please enter for number of payments');
                    return;
                }
                if (!numberofpayments_regex.test($('#xpayments').val())) { // regex matches
                    $('#autoPayment-Error').empty();
                    $('#autoPayment-Error').show();
                    $('#autoPayment-Error').append('number of payments cannot be 0.');
                    return;
                }

            }
        }

        if (this.selectedrecurringPayment().effectivePeriod() == 'endDate') {
            if ($('#untildate').val() == "") {
                $('#autoPayment-Error').empty();
                $('#autoPayment-Error').show();
                $('#autoPayment-Error').append('Please enter a until date');
                return;
            }
        }
        for (i = 0; i < viewModel.bankAccounts().length; i++) {
            if (viewModel.bankAccounts()[i].id() == viewModel.selectedrecurringPayment().bankAccountId())
                viewModel.selectedAccount(viewModel.bankAccounts()[i])
        }
        viewModel.saveToLocal();
        $.mobile.changePage('pmt-automated-confirm.html', {
            transition: "slide"
        });

    }



    /* add recurring paymenr */

    self.addrecurringPayment = function () {
        submitData = new Object();
        submitData.recurringPayment = this.selectedrecurringPayment();

        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            data: ko.mapping.toJSON(submitData),
            url: "/_layouts/Bge.Canp/SecureServices.asmx/AddRecurringPayment",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            global: false,
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    viewModel.selectedrecurringPayment(ko.mapping.fromJS(allData.d.recurringPayment));
                    statusModel.automatedPaymentError(false);
                    viewModel.saveToLocal();
                } else {
                    statusModel.automatedPaymentError(true);
                }
                $.mobile.changePage('pmt-automated-final.html', {
                    transition: "slide"
                });
            }
        });
    }

    /* edit recurring payment */

    self.editrecurringPayment = function () {
        submitData = new Object();
        submitData.recurringPayment = this.selectedrecurringPayment();

        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            data: ko.mapping.toJSON(submitData),
            url: "/_layouts/Bge.Canp/SecureServices.asmx/EditRecurringPayment",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: CanpAjaxTO,
            global: false,
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    viewModel.selectedrecurringPayment(ko.mapping.fromJS(allData.d.recurringPayment));
                    statusModel.editPaymentError(false);
                    viewModel.saveToLocal();
                } else {
                    statusModel.editPaymentError(true);
                }
                $.mobile.changePage('pmt-automated-efinal.html', {
                    transition: "slide"
                });
            }
        });
    }

    /* delete recurring payment */
    self.deleterecurringPayment = function () {
        $.ajax({
            type: "POST",
            headers: {
                "cache-control": "no-cache"
            },
            url: "/_layouts/Bge.Canp/SecureServices.asmx/DeleteRecurringPayment",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (allData) {
                if (allData.d.ErrorCode == null && allData.d.ErrorMessage == null) {
                    statusModel.deletePaymentError(false);
                } else {
                    statusModel.deletePaymentError(true);
                }
                $.mobile.changePage('pmt-automated-dfinal.html', {
                    transition: "slide"
                });
            },
            async: false

        });

    }

}