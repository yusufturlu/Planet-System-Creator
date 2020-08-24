self.addEventListener('message', (ev)=>{
    
    var path = [];

    var predictBodies = ev.data;

    var dt = 0.005;
    for(var k = 0; k < 1000; k++){
        var G = 1;

        for(var i = 0 ; i < predictBodies.length; i++)
            for(var j = 0; j < predictBodies.length; j++){
                if(i == j) continue;

                var b1 = predictBodies[i];
                var b2 = predictBodies[j];
                
                var dist = Math.sqrt(
                    (b1.x - b2.x)*(b1.x - b2.x) + 
                    (b1.y - b2.y)*(b1.y - b2.y)
                );

                var nx = (b2.x - b1.x) / dist;
                var ny = (b2.y - b1.y) / dist;

                dist = dist * 2;

                var force = G * (b1.m * b2.m) / (dist * dist);
                
                b1.ax += nx * force / b1.m;
                b1.ay += ny * force / b1.m;
                
                b2.ax -= nx * force / b2.m;
                b2.ay -= ny * force / b2.m;
                
        }
        for(var i = 0; i < predictBodies.length; i++){

            predictBodies[i].vx += predictBodies[i].ax * dt;
            predictBodies[i].vy += predictBodies[i].ay * dt;
        
            predictBodies[i].x += predictBodies[i].vx * dt;
            predictBodies[i].y += predictBodies[i].vy * dt;
        
            predictBodies[i].ax = 0;
            predictBodies[i].ay = 0;        
    }
        var l = predictBodies.length;
        path.push({'x' : predictBodies[l - 1].x, 
                   'y': predictBodies[l - 1].y });
    }

    self.postMessage(path);
});