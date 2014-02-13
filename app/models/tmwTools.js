/*****************************************************************************
 * TrackMyWork - Timeout functions
 * 
 * (c) 2009, 2011 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

/* ===========================================================================
 * getWeekNumber
 * Thanks to "tommy skaue"
 * see http://www.codeproject.com/KB/cs/gregorianwknum.aspx
 * ===========================================================================
 */

function getWeekNumber(datePI)
{
    Mojo.Log.info("getWeekNumber(" + Mojo.Locale.getCurrentFormatRegion() + ")");
    
    var numberOfWeek = 0;

    if (Mojo.Locale.getCurrentFormatRegion() === "us") 
    {
        numberOfWeek = getWeekNumberUS(datePI);
    }
    else  
    {
        numberOfWeek = getWeekNumberISO(datePI);
    }
    
    return numberOfWeek;   
}

function getWeekNumberUS(datePI)
{
    Mojo.Log.info("getWeekNumberUS(" + ")");

    var numberOfWeek = 0;

    var datePlus8Days = new Date(datePI.getTime() + 6*86400000);
    var jan1St = new Date(datePI.getFullYear(), 0, 1);
    var doyJan1St = jan1St.getTime()  / 86400000;
    var sunCW1 = sunday(jan1St);
    
    var dow = datePI.getDay();
    var doyDate = (datePI.getTime() / 86400000) - doyJan1St;

    // last week of year
    if(datePI.getMonth() == 11 && datePlus8Days.getMonth() == 0)
    {
        numberOfWeek = 0;
        var jan1St = new Date(datePI.getFullYear() + 1, 0, 1);
    }
    else
    {        
        numberOfWeek = Math.floor(doyDate / 7) + 1;
    }
    
    var dow1Jan = jan1St.getDay();
    if(dow < dow1Jan)
    { 
        numberOfWeek ++;
    }
    
    return numberOfWeek;        
}


function getWeekNumberISO(datePI)
{
    Mojo.Log.info("getWeekNumberISO(" + datePI + ")");

    var numberOfWeek = 0;
    
    var thuDate   = thursday(datePI);
    var cWeekYear = thuDate.getFullYear();
    var thuCW1    = thursday(new Date(cWeekYear, 0, 4));
    
    Mojo.Log.info("thuDate = " + thuDate);
    Mojo.Log.info("thuCW1 = " + thuCW1);
    Mojo.Log.info("Diff in days:" + (thuDate.getTime() - thuCW1.getTime()) / 86400000);
    Mojo.Log.info("Diff in weeks:" + (thuDate.getTime() - thuCW1.getTime()) / 86400000 / 7);
    
    numberOfWeek = Math.floor(1.5 + (thuDate.getTime() - thuCW1.getTime()) /
         86400000/7) 

    Mojo.Log.info("kw = " + numberOfWeek);

    return numberOfWeek;        
}



function thursday(date) 
{ 
  var thu = new Date();
  thu.setTime(date.getTime() + (3-((date.getDay() + 6) % 7)) * 86400000);
  return thu;
}
  

function sunday(date) 
{ 
  var sun = new Date();
  sun.setTime(date.getTime() + (6-((date.getDay()+6) % 7)) * 86400000);
  return sun;
}
  


/* ===========================================================================
 * getCategoryNames
 * ===========================================================================
 */
function getCategoryNames(idListPI)
{
    Mojo.Log.info("getCategoryNames(" + idListPI + ")");
    
    var idList = idListPI.split(",");        
    var nameList = [];
    var result = "";

    
    for (var i = 0; i < prefsGL.categoriesList.length; i++) {
        var category = prefsGL.categoriesList[i];
        
        for (var id = 0; id < idList.length; id++) 
        {
            if (category.id == idList[id]) 
            {
                nameList.push(category.name)
            }
        }
    }
    
    if(nameList.length == prefsGL.categoriesList.length)
    {
        result = $L("All categories");
    }
    else if(nameList.length == 0)
    {
        result = $L("No categories");
    }
    else
    {
        result = nameList.join(", ");
    }
    
    return result;
}

