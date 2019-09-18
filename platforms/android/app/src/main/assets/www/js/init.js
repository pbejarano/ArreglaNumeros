'use strict';
var self;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
    console.log("INICIO APP");
    self.Utils = new Utils();
    self.Main = new Main();

    setTimeout(self.Main.Init.bind(self.Utils), 1000);
}
(function() {

/*
|------------------------------------------------------------------------------
| Initialize Framework7
| For more parameters visit https://framework7.io/docs/init-app.html
|------------------------------------------------------------------------------
*/

window.myApp = new Framework7({
	cache: false,
	init: false,
	material: true,
	modalTitle: 'Arregla Números',
	notificationCloseButtonText: 'OK',
	scrollTopOnNavbarClick: true
});
window.myApp.showIndicatorFlag = true;
/*
|------------------------------------------------------------------------------
| Initialize Main View
|------------------------------------------------------------------------------
*/

window.mainView = myApp.addView('.view-main', { 
	domCache: true,
	uniqueHistory: true
});

/*
|------------------------------------------------------------------------------
| Assign Dom7 Global Function to a variable $$ to prevent conflicts with other
| libraries like jQuery or Zepto.
|------------------------------------------------------------------------------
*/

window.$$ = Dom7;

})();




/*
|------------------------------------------------------------------------------
| Function performed on every AJAX request
|------------------------------------------------------------------------------
*/

$$(document).on('ajaxStart', function (e) {
	if(myApp.showIndicatorFlag){
		myApp.showIndicator();
	}
});

$$(document).on('ajaxComplete', function (e) {
	myApp.hideIndicator();
});

/*
|------------------------------------------------------------------------------
| Set last saved color and layout theme
|------------------------------------------------------------------------------
*/