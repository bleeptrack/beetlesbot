
    spreadshirt.create("smartomat", {
        shopId: 100315045, // your shop id
        platform: "EU",  // or NA
        
        width: "700px",    // width in px or %
        height: "700px",   // height in px or %
                       
        designUrl: shirturl,
        appearanceId: 1,
        target: document.body
        

        
        
    }, function(err, app) {
        if(err){
            alert(err);
        }
    });
    
    /*spreadshirt.create("smartomat", {
        shopId: 100315045, // your shop id
        platform: "EU",  // or NA
        width: "700px",    // width in px or %
        height: "700px"   // height in px or %
        // ... additional parameter (see below)
    }, function(err, app) {

        if (err) {
            // something went wrong
            console.log(err);
        } else {
            // cool I can control the application (see below)
            app.setAppearanceId(1);
            app.addImage(shirturl);
        }
    });*/
