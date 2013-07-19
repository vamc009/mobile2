$(function() {

	setTimeout(function() { window.scrollTo(0, 0); }, 100);

	$(document).on('pageinit', 'div[data-role=page]', function() {
	    $(document).on('swipeleft swiperight', 'div[data-role=page]', function(e) {
	        if ($.mobile.activePage.jqmData('panel') !== 'open') {
	            if (e.type === 'swiperight') {
	                $('#panel').panel('open');
	            }
	        }
	    });
	});

    //Moved to bge.mobile.canp.js
	// Signin confirmation for User ID
//	$('a[data-message]').on('click', function(){
//	    $('#overlay, .redirect-window').fadeIn(300);
//	    $('.redirect-window p').text($(this).data('message'));
//	    $('.redirect-window a').attr('href', $(this).attr('href'));
//	    return false;
//	});


	//$(document).on('touchstart pageinit', 'a[data-message]', function(){
	//  return confirm($(this).data('message'));
	//});

	$('#pmt-accounts li').on('click', function () {
	    $('#overlay2, #pmt-accounts-dialog').fadeIn(300);
	});

	$('#pmt-activity li').on('click', function () {
	    $('#overlay2, #pmt-activity-dialog').fadeIn(300);
	});

	$('#overlay2').on('click', function () {
	    $('#overlay2, .pmt-dialog').fadeOut(300);
	});

	// Open Notification Bubble
	//$('#notifications').on('click', function(){
	//	$('.notification-message').fadeIn(300);
	//});

	// Close Notification Bubble
	//$('.close-icon').on('click', function(){
	//	$('.notification-message, #notif-alert').fadeOut(300);
	//});


	// Datepicker
	$(document).bind('mobileinit', function(){
		$.mobile.page.prototype.options.degradeInputs.date = true;
	});

	// Masked Phone Number
	//$('.phone').mask('(999) 999-9999');
	//$('.acct').mask('9999999999',{placeholder:''});

});




