'use strict';


//get button
let btnStart = document.getElementById('btnStart');


//callback begin
function logResponse(response){
	if(response){
		console.log('msg received:' + response);
	} else{
		console.log('content no response');
	}
}


function saveTabID(tabs){
	var tabID = tabs[0].id;	
	
	chrome.storage.local.set({'tabID': tabID}, function(){})		
}


function sendStart(tabs){
	chrome.tabs.sendMessage(
		tabs[0].id, 
		{To:'content', value:'start'}, 
		logResponse
	);  
}
//Call back end

		
//Begin
btnStart.onclick = function() {
	//save current tab ID
	chrome.tabs.query({active: true, currentWindow: true}, saveTabID);

	
	//clear old data
	chrome.storage.local.set({'saved': ""},function(){});

	
	//chrome.runtime.sendMessage cannot send message to content scripts
	chrome.tabs.query({active: true, currentWindow: true}, sendStart);  
	
	
	//close 
	window.close(); 
};


//send message
function sendMessage(message, callback)
{
	chrome.runtime.sendMessage(	message, logResponse);
}

