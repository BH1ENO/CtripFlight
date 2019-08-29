'use strict';
var fileName = "flight.csv";


//callback begin
function logResponse(response){
	if(response){
		console.log('msg received:' + response);
	} else{
		console.log('content no response');
	}
}

function WriteData(data) {
	writeFile(data.saved, fileName);		
}

function saveNext(){
	var nextPage;
	var newURL;

	nextPage =  document.getElementsByClassName("schedule_down")[0];

	if(nextPage){
		nextPage =  document.getElementsByClassName("schedule_down")[0];
		newURL = nextPage.href.replace(/http/, "https");

		//sent next page url to background. Ask background to navigate to next page
		sendMessage({Cmd:'next', value:newURL}, logResponse);

	}else{
		//Finish. write data
		chrome.storage.local.get('saved', WriteData);		
		
		//show notification
		sendMessage({Cmd:'msg', value:'Result is saved to ' + fileName + '.'}, logResponse);
	}						
}
	
//callback end


//receive message and grab data
function msgListener(request, sender, sendResponse){
	if(request.To == 'content') {
		sendResponse('msg received:' + request.value);
		
		if (request.value == 'start' || request.value == 'next'){
			grabData();
		}
	}
}

chrome.runtime.onMessage.addListener(msgListener);


//grab data
function grabData(){
	var tmpData = "";
	
	//Title
	var url = window.location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1);
	document.title = filename;

	
    //Collect page data
    tmpData =  GetData(document);

	
	//saved data and find next 
	chrome.storage.local.get(
		'saved', 
		function(data) {
			tmpData = data.saved + tmpData;

			chrome.storage.local.set({'saved': tmpData}, saveNext);		
		}
	);		
}

	
//Get data from page
function GetData(docData){
    //Get table
    var tblData = docData.getElementsByClassName("fltlist_table")[0];
    var tblRows = tblData.rows;
    var lngRowLength;

    if (!tblRows && typeof(tblRows)!="undefined" && tblRows!=0){ 
        alert("Cannot find table: fltlist_table");
        return;
    }  

   lngRowLength = tblRows.length;
   //console.log(lngRowLength);

    //Traverse
    var aryData = [lngRowLength];
    var strTmp = "";
    var strData = "";
    for(var i=0; i<lngRowLength-1; i++){
        aryData[i] = new Array(7)
        
        aryData[i][0] = tblRows[i+1].cells[0].innerText;
        
        strTmp = tblRows[i+1].cells[1].innerText;
        aryData[i][1] = strTmp.slice(0,strTmp.indexOf("\n"));
        aryData[i][2] = strTmp.slice(strTmp.indexOf("\n")+1);

        
        strTmp = tblRows[i+1].cells[2].innerText;
        aryData[i][3] = strTmp.slice(0,strTmp.indexOf("\n"));
        aryData[i][4] = strTmp.slice(strTmp.indexOf("\n")+1);


        strTmp = tblRows[i+1].cells[6].innerText;
        aryData[i][5] = strTmp.slice(0,strTmp.indexOf("\n"));
        aryData[i][6] = strTmp.slice(strTmp.indexOf("\n")+1);
        
        
        //merge
        for(var j=0; j<7; j++){
            strData = strData + aryData[i][j] + ",";
        }
        
        strData = strData + "\r"       
    } 
    
    return strData;
}


//Write data
function writeFile(toSave,filename){
    //Create <a>
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';

    var strData =  "\ufeff" + "航线名,起飞,到达,起飞机场,到达机场,航空公司,航班号,\r" + toSave;
    
    var objFile = new Blob([strData],{type: 'text/csv,charset=UTF-8'});
    eleLink.href = (window.URL || window.webkitURL).createObjectURL(objFile);

    
    //Append <a>
    document.body.appendChild(eleLink);
    
    
    //Click <a>
    eleLink.click();

    
    //Remove <a>
    document.body.removeChild(eleLink);
}


//send message
function sendMessage(message, callback)
{
	chrome.runtime.sendMessage(	message, logResponse);
}
