translate([10+20,10+60,0])
        for (i = [0 : 10]){
            translate([i,0,0])
                cube(size = [0.8,10,0.1]);
    }