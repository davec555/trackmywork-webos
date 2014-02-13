/*****************************************************************************
 * TrackMyWork - Timeout functions
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/



function formatDate(datePI)
{
	function addLeadingZero(number) 
	{ 
		return (number < 10? "0"+number: number);  
	};

	result = null;
	
	if(datePI != null)
	{
		result = 
			(addLeadingZero(datePI.getUTCMonth()+1) + "/" + 
			addLeadingZero(datePI.getUTCDate()) + "/" + 
			addLeadingZero(datePI.getUTCFullYear()) + " " +
			addLeadingZero(datePI.getUTCHours()) + ":" + 
			addLeadingZero(datePI.getUTCMinutes()) + ":00");
	}
	
	return result;
}


function timeoutClear()
{
	alert("AppAssistant.timeoutClear");
	this.clear = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: "clear",
		parameters: {
			"key": Mojo.Controller.appInfo.id
		}
	});
}

function calcNextCall()
{
	alert("AppAssistant.calcNextCall()");
	var now = new Date();
	now.setSeconds(0, 0);
	
	var startDay = new Date(now);
	startDay.setHours(prefsGL.standardDayBegin.getHours());
	startDay.setMinutes(prefsGL.standardDayBegin.getMinutes());
	
	var endDay = new Date(now);
	endDay.setHours(prefsGL.standardDayEnd.getHours());
	endDay.setMinutes(prefsGL.standardDayEnd.getMinutes());
	
	var startBreak = new Date(startDay.getTime()+
		(prefsGL.breakAfterHours*60+prefsGL.breakAfterMinutes) * 60*1000);
	
	var endBreak = new Date(startBreak.getTime() + 
	    ((prefsGL.breakDurationInHours*60+prefsGL.breakDurationInMinutes) * 60*1000));
	
	alert("#################################################");
	Mojo.Log.info("start Day: %s", startDay);
	Mojo.Log.info("  end Day: %s", endDay);
	Mojo.Log.info("start Brk: %s", startBreak);
	Mojo.Log.info("  end Brk: %s", endBreak);
	alert("#################################################");

	if(now < startDay)
	{
		result = new Date(startDay);	
	}
	else if(now < startBreak)
	{
		result = new Date(startBreak);	
	}
	else if(now < endBreak)
	{
		result = new Date(endBreak);	
	}
	else if(now < endDay)
	{
		result = new Date(endDay);	
	}
	else
	{
		// add one day
		result = new Date(startDay.getTime() + 24*60*60*1000);			
	}
	
	alert("Day of result:" + result.getDay())
	Mojo.Log.info("RESULT: %s, day=%d", result, result.getDay());
	
    // FIXME: wieder raus
    return result;
	// On friday, after work-end
	if(result.getDay() == 6 && now.getDay() == 5)
	{
		result = new Date(startDay.getTime() + 3*24*60*60*1000);	
	}
	// on saturday add two days
	else if(now.getDay() == 6)
	{
		result = new Date(startDay.getTime() + 2*24*60*60*1000);					
	}
	// On sunday add one day
	else if(now.getDay() == 0)
	{
		result = new Date(startDay.getTime() + 24*60*60*1000);					
	}
	
	Mojo.Log.info("RESULT: %s, day=%d", result, result.getDay());
	
	// FIXME: Nur Test
	// result = new Date(now.getTime()+100000);

	return result
}


function timeoutStart() 
{
	alert("AppAssistant.timeoutStart()");
		
	var nextCall = this.calcNextCall();
	var dateString = this.formatDate(nextCall);

	this.nextWakeup = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: "set",
		parameters: {
			"wakeup": true,
			"key": Mojo.Controller.appInfo.id,
			"at": dateString,
			"uri": "palm://com.palm.applicationManager/launch",
			"params": {
                "id": Mojo.Controller.appInfo.id,
                "params": 
				{ 
					"wakeupCall": 1 
				}
			}
		},
		onSuccess: function(response) {
			if (response) {
				Mojo.Log.info("timeoutSet.onSuccess %j", response);
			} else {
				Mojo.Log.error("timeoutSet.onSuccess");
			}
		},
		onFailure: function(response) {
			Mojo.Log.error("timeoutSet.onFailure %j", response);
		}
	});
		
	if(tmwGL.nextCall != null) 
	{
		alert("      NextCall: "+ nextCall.getTime())
		alert("tmwgl.NextCall: "+ tmwGL.nextCall.getTime())		
	}
	
	if(tmwGL.nextCall == null || 
	   nextCall.getTime() != tmwGL.nextCall.getTime())
	{
		Mojo.Controller.getAppController().showBanner
			({messageText: $L("Next notification") + ": " + Mojo.Format.formatDate(nextCall, {
					date: 'short',
					time: 'short',
					countryCode: ''
				})}, 
			"", // launch arguments
			""); // Category
	}
		
	tmwGL.nextCall = new Date(nextCall);
}

