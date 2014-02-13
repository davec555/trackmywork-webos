/*****************************************************************************
 * TrackMyWork - DockMode assistant
 * 
 * (c) 2009-2011 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function DockModeAssistant() 
{
	this.refreshData();
}

DockModeAssistant.prototype.setup = function() 
{
    // Every 10 seconds
    this.interval = this.controller.window.setInterval
        (this.refreshData.bind(this), 10000);
        
    /* add event handlers to listen to events from widgets */
    Mojo.Event.listen(this.controller.get('checkInOut'),
                      Mojo.Event.tap, 
                      this.inOutHandler.bind(this));
};

DockModeAssistant.prototype.activate = function(event) 
{
    tmwGL.db.getDashboardMessage(this.setMessage.bind(this));
    this.refreshData();
    
    this.controller.enableFullScreenMode(true);
    
    this.controller.get('scene').style.backgroundColor = "black";
    this.controller.get('scene').style.color = "white";
    
    document.getElementsByTagName("body").item(0).style.backgroundColor = "blue";
    document.getElementsByTagName("body").item(0).style.color = "red";
  
};


DockModeAssistant.prototype.setMessage = function(line1, line2) {
    Mojo.Log.info("DockmodeAssistant.prototype.setMessage");
        
    this.line1 = line1;
    this.line2 = line2;
    
    this.renderData();
};


DockModeAssistant.prototype.refreshData = function(event)
{
    var now = new Date();
    this.iconClass = "dock-img-" + (tmwGL.inOut === "in" ? "out" : "in");
    
    this.today = Mojo.Format.formatDate(now, {
        date: 'short',
        countryCode: ''
    });
    this.time = Mojo.Format.formatDate(now, {
        time: 'short',
        countryCode: ''
    });

    tmwGL.db.getDashboardMessage(this.setMessage.bind(this));
     
}

DockModeAssistant.prototype.renderData = function(event) 
{
    this.controller.get("checkInOut").className = this.iconClass;  
    var data = 
      {  
          "checkInOutClass": this.iconClass,      
          "date": this.today,
          "time": this.time,
          "one":  this.line1,
          "two":  this.line2
      }
      
      var content = Mojo.View.render({object: data, 
            template: 'DockMode/DockMode-template'});
      this.controller.get('content').innerHTML = content;
};




/* ===========================================================================
 * handleinBtn
 * ===========================================================================
 */
DockModeAssistant.prototype.inOutHandler = function()
{
    Mojo.Log.info("DockModeAssistant.inOutHandler");

    switch(tmwGL.inOut)
    {
        case 'out':
            this.handleInBtn();
            break;
        
        case 'in':
            this.handleOutBtn();
            break;
    }
};



/* ===========================================================================
 * handleinBtn
 * ===========================================================================
 */
DockModeAssistant.prototype.handleInBtn = function()
{
    Mojo.Log.info("DashboardAssistant.handleInBtn");
    if(tmwGL.inOut == 'out')
    {
        tmwGL.db.checkIn();
        this.inOrOutCB();
    }
};


/* ===========================================================================
 * handleOutBtn
 * ===========================================================================
 */
DockModeAssistant.prototype.handleOutBtn = function()
{
    Mojo.Log.info("DockModeAssistant.handleOutBtn");
    if(tmwGL.inOut == 'in')
    {
        tmwGL.db.checkOut();
        this.inOrOutCB();
    }
};



/* ===========================================================================
 * inOrOutCB
 * ===========================================================================
 */
DockModeAssistant.prototype.inOrOutCB = function()
{
    Mojo.Log.info("DockModeAssistant.inOrOutCB: " + tmwGL.inOut);

    this.iconClass = "dock-img-" + (tmwGL.inOut === "in" ? "out" : "in");
    this.controller.get("checkInOut").className = this.iconClass;  
    
    this.refreshData();

}



DockModeAssistant.prototype.deactivate = function(event) 
{
    Mojo.Log.info("DockModeAssistant.deactivate");

    clearInterval(this.interval);
    Mojo.Event.stopListening(this.controller.get('checkInOut'),
                             Mojo.Event.tap, 
                             this.inOutHandler.bind(this));
};

DockModeAssistant.prototype.cleanup = function(event) 
{

};
