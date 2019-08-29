# CtripFlight Chrome extension

This is my first Chrome extension. Hope you like it.

This extension can grab landing/depature scheule of designated city from flights.ctrip.com.


This extension is enabled only in URLs match https://flights.ctrip.com/schedule/*-*map.html. For example: flights.ctrip.com/schedule/acx-inmap.html.


When click on the icon and click 'start'. It will grab all the data in current page, then find 'Next page' button to navigate to next page, grab data of next page, till to the last page.

After all data is grabbed, it will save the result into a csv file named 'flight.csv' (or 'flight(n).csv', if more than one time.)

