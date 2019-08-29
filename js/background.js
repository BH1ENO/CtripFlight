'use strict';
var tabID;


//callback begin
function logResponse(response){
	if(response){
		console.log('msg received:' + response);
	} else{
		console.log('content no response');
	}
}


//3.send msg to content, after next page loaded.(chrome.runtime.sendMessage cannot send message to content scripts)
// add listener so callback executes only if page loaded. otherwise calls instantly
function waitLoaded(tab1) {
	var listener = function(tabId, changeInfo, tab) {
		if (tabID == tab1.id && changeInfo.status === 'complete') {
			// remove listener, so only run once
			chrome.tabs.onUpdated.removeListener(listener);

			//next
			chrome.tabs.sendMessage(tabID,{To:'content', value:'next'}, logResponse);
		}
	}

	chrome.tabs.onUpdated.addListener(listener);
}
//callback end


//receive message and navigate to next page
function msgListener(request, sender, sendResponse){
	//message to background?
	if(request.Cmd != 'next' && request.Cmd != 'msg') {
		return;
	}


	//response
	sendResponse('msg received:' + request.value);


	//Show notification
	if (request.Cmd == 'msg'){
		showTip('Done', request.value);
		
		return;
	}


	//1.get next URL from content
	var nextURL = request.value;
	
	//2  get current tab and navigate to next URL from message
	chrome.storage.local.get(
		'tabID', 
		function navigateNextURL(data){
			tabID = data.tabID;
			
			chrome.tabs.update(tabID, {url: nextURL, active: true}, waitLoaded);
		}
	);
}
	
chrome.runtime.onMessage.addListener(msgListener);


//enable popup only in *.ctrip.com
chrome.runtime.onInstalled.addListener(function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'ctrip.com'}})
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});



//show notification
function showTip(title,msg){
	chrome.notifications.create(
		null, 
		{
		type: 'basic',
		iconUrl: '/images/logo_128.png',
		title: title,
		message: msg
		}
	);
}


//send message
function sendMessage(message, callback)
{
	chrome.runtime.sendMessage(	message, logResponse);
}
