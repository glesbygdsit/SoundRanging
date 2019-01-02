var eventTypes = {
    setting : "setting",
    targetData : "targetData",
    clientInfo : "clientInfo"
}

module.exports = {
    handleEvent: function(socket, event) {
        if(!socket || !event){
            console.log("Error when receiving event data.");
            return;
        }
        
        var eventSplit = event.split('|');
        console.log(eventSplit + " - " + eventSplit.length);
        if(eventSplit.length != 2) {
            console.log("data received is not in correct format!");
            return;
        }
        
        var eventType = eventSplit[0];
        
        if(!eventTypes[eventType]) {
            console.log("Wrong type received. " + eventType + " is not defined!");
            return;
        }
        
        var eventData = eventSplit[1];
        
        
        switch (eventType) {
            case eventTypes.setting:
                handleSettings(socket, eventData);
                break;
            case eventTypes.targetData:
                handleTargetData(socket, eventData);
                break;
            case eventTypes.clientInfo:
                handleClientInfo(socket, eventData);
        }
    }
};


handleSettings = function(socket, evt) {
};

handleClientInfo = function(socket, evt) {
    socket.emit("clientInfoEvent", { type: eventTypes.clientInfo, address: socket.handshake.address, /*connectedClients: self.connectedDevices,*/ date: evt });
    console.log("msg '" + evt + "' sent!");
};

handleTargetData = function(socket, evt) {
    var targetValues = evt.split('#');

    targetValues.forEach(function(item) {
        console.log("targetData received (mic:time in microSec): " +item);
    });


    var data = bah(targetValues); // {'resultx': resultx, 'resulty' : resulty};

    socket.emit('testerEvent', { type: eventTypes.targetData, data: data });
    console.log('data sent:', data);
};


bah = function(reads) {

    // 0 : 315    microSek
    // 1 : 0      microSek
    // 2 : 315    microSek

    // Till mm (radie) = (tid / 2.9)





    // rita inte ut pX med "0"

    // var points = [];

    // $.each(reads, function(i, p) {
    //     points[points.length] = { 'mic' : p.mic, 'r' : p.val * width };
    // })
    console.log("bah: ", reads);
    var intersectPoints = [];
    
    // $.each(reads, function(i, read) {
    for (let i = 0; i < reads.length; i++) {
        const read = reads[i].split(':');
        const r = Number(read[1]) / 2.9;
        console.log("loop.. read: ", read);
        if(reads[i][0] === '0') {
            // bottomLeft 
            intersectPoints[intersectPoints.length] = {'x' : 0, 'y' : 297, 'r' : r};
        }
        else if(reads[i][0] === '1') {
            // middleLeft
            intersectPoints[intersectPoints.length] = {'x' : 210, 'y' : 297, 'r' : r};
        }
        else if(reads[i][0] === '2') {
            // bottomRight
            intersectPoints[intersectPoints.length] = {'x' : 420, 'y' : 297, 'r' : r};
        }
    }

    return getIntersectPoints(intersectPoints[0], intersectPoints[1], intersectPoints[2]);
};

getIntersectPoints = function(p0, p1, p2) {
    console.log("getIntersectPoints:");
    console.log(p0);
    console.log(p1);
    console.log(p2);
    var p0r = Number(p0.r);
    var p1r = Number(p1.r);
    var p2r = Number(p2.r);
    var clickTime = new Date().getTime();
    // kolla först om två cirklar skär. börja med dom två diagonala.. dom kommer skära sist. 
    
    // när vi väl har så att alla tre skär, kolla avståndet på "skärningarna", är det största avståndet inom toleransen så kan vi vara glada för tillfället..
    
    // förfina senare..
    var result0;
    var result1;
    var result2;
    
    var height = 297;//divTarget.height();
    
    var result;
    var resultx;
    var resulty;
    
    
    var incVal = height / 2;
    
    var pdistMax;
    
    var growing = false;
    
    var loopCount = 0;
    
    
    do {
        loopCount++;
        
        p0r+=incVal;
        p1r+=incVal;
        p2r+=incVal;
        
        result0 = testIntersection(p0.x, p0.y, p0r, p1.x, p1.y, p1r);
        result1 = testIntersection(p1.x, p1.y, p1r, p2.x, p2.y, p2r);
        result2 = testIntersection(p0.x, p0.y, p0r, p2.x, p2.y, p2r);
        
        var p0x = result0.xi > result0.xi_prime ? result0.xi_prime : result0.xi; 
        var p0y = result0.yi > result0.yi_prime ? result0.yi_prime : result0.yi;
        var p1x = result1.xi > result1.xi_prime ? result1.xi_prime : result1.xi;
        var p1y = result1.yi > result1.yi_prime ? result1.yi_prime : result1.yi;
        var p2x = result2.xi > result2.xi_prime ? result2.xi_prime : result2.xi;
        var p2y = result2.yi > result2.yi_prime ? result2.yi_prime : result2.yi;
        var dist0_1 = calculatePointsDistance(p0x, p0y, p1x, p1y);
        var dist1_2 = calculatePointsDistance(p1x, p1y, p2x, p2y);
        var dist0_2 = calculatePointsDistance(p0x, p0y, p2x, p2y);

        // console.log("dist0_1: ", dist0_1);
        // console.log("dist1_2: ", dist1_2);
        // console.log("dist0_2: ", dist0_2);
        
        var distMax = Math.max(dist0_1, dist1_2, dist0_2);
        
        console.log("getIntersectPoints - distMax: ", distMax);

        if(distMax < 0.01)
        {
            result = true;
            resultx = Math.round((p0x + p1x + p2x) / 3);
            resulty = Math.round((p0y + p1y + p2y) / 3);
            console.log("getIntersectPoints - resultx: ", resultx);
            console.log("getIntersectPoints - resulty: ", resulty);
        }
        else {
            if(distMax > pdistMax) {
                // vänd..
                growing = false;
                incVal = -(incVal / 2);
            }
            else if(distMax < pdistMax) {
                // närmare än innan.. fortsätt åt samma håll..
                if(growing) {
                    // vänd..
                    incVal = -(incVal / 2);
                    growing = true;
                }
                else {
                    // kör på!
                    incVal = (incVal);
                    growing = false;
                }
                console.log("getIntersectPoints - närmare än innan.. fortsätt åt samma håll... incVal: " + incVal + " growing: " + growing);
            }
            else {
                // intersektar inte längre.. öka!
                incVal = Math.abs(incVal);
                // console.log("getIntersectPoints - intersektar inte längre.. öka!. incVal: ", incVal);
            }
            
            pdistMax = distMax;
        }
    }while(!result && loopCount < 200)
    console.log("getIntersectPoints - done!");

    var endTime = new Date().getTime();
    var srvTime = endTime - clickTime;
    // var drawTime = endTime - msgRcvTime;
    
    console.log("Antal loopar innan hittat resultat: " + loopCount + " | serverTime: " + srvTime + "ms");

    // Boom.testDrawDot(resultx, resulty, 2, "type2");
    return {'resultx': resultx, 'resulty' : resulty};
};

testIntersection = function(x0, y0, r0, x1, y1, r1) {
    var a, dx, dy, d, h, rx, ry;
    var x2, y2;
    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;
    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));
    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        // console.log('testIntersection - no solution. circles do not intersect.');
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        // console.log('testIntersection - no solution. one circle is contained in the other');
        return false;
    }
    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */
    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;
    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a/d);
    y2 = y0 + (dy * a/d);
    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0*r0) - (a*a));
    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h/d);
    ry = dx * (h/d);
    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    return {'xi' : xi, 'xi_prime' : xi_prime, 'yi' : yi, 'yi_prime': yi_prime};
};

calculatePointsDistance = function(x1, y1, x2, y2) {
    return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
};