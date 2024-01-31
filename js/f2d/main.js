(function() {
    "use strict";

    var windowSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

    var renderer = new THREE.WebGLRenderer();
    renderer.autoClear = false;
    renderer.sortObjects = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.x, windowSize.y);
    renderer.setClearColor(0x00ff00);
    document.body.appendChild(renderer.domElement);

    // var stats = new Stats();
    // stats.setMode(0);
    // stats.domElement.style.position = "absolute";
    // stats.domElement.style.left = "0px";
    // stats.domElement.style.top = "0px";
    // document.body.appendChild(stats.domElement);

    var grid = {
        size: new THREE.Vector2(512, 256),
        scale: 1,
        applyBoundaries: true
    };
    var time = {
        step: 1,
    };
    var displayScalar, displayVector;
    var displaySettings = {
        slab: "density"
    };
    var solver, gui;
    var mouse = new F2D.Mouse(grid);

    function init(shaders) {
        solver = F2D.Solver.make(grid, time, windowSize, shaders);
    
        // Set fixed properties directly
        solver.advect.dissipation = 0.998; // Example of setting a fixed dissipation value
        solver.applyViscosity = true; // Enable viscosity
        solver.viscosity = 0.8; // Set viscosity value
        solver.applyVorticity = true; // Enable vorticity
        solver.vorticityConfinement.curl = 10; // Set vorticity confinement curl
        solver.splat.radius = 0.1; // Set splat radius
        solver.splat.color = new THREE.Vector3(0.447, 0.639, 0.196); // Set splat color
        grid.applyBoundaries = true; // Enable boundary application
        grid.scale = 10; // Set grid scale
    
        displayScalar = new F2D.Display(shaders.basic, shaders.displayscalar);
        displayVector = new F2D.Display(shaders.basic, shaders.displayvector);
    
        // Set the initial slab to be displayed, e.g., "density"
        displaySettings.slab = "divergence";
        mouse.simulateCenterForce();
    
        requestAnimationFrame(update);
    }
    

    function update() {
        // stats.begin();

        solver.step(renderer, mouse);
        render();

        // stats.end();
        requestAnimationFrame(update);
    }

    function render() {
        var display, read;
        switch (displaySettings.slab) {
        case "velocity":
            display = displayVector;
            display.scaleNegative();
            read = solver.velocity.read;
            break;
        case "density":
            display = displayScalar;
            display.scale.copy(solver.ink);
            display.bias.set(0, 0, 0);
            read = solver.density.read;
            break;
        case "divergence":
            display = displayScalar;
            display.scaleNegative();
            read = solver.velocityDivergence.read;
            break;
        case "pressure":
            display = displayScalar;
            display.scaleNegative();
            read = solver.pressure.read;
            break;
        }
        display.render(renderer, read);
    }

    function resize() {
        windowSize.set(window.innerWidth, window.innerHeight);
        renderer.setSize(windowSize.x, windowSize.y);
    }
    window.onresize = resize;

    var loader = new F2D.FileLoader("shaders", [
        "advect.fs",
        "basic.vs",
        "gradient.fs",
        "jacobiscalar.fs",
        "jacobivector.fs",
        "displayscalar.fs",
        "displayvector.fs",
        "divergence.fs",
        "splat.fs",
        "vorticity.fs",
        "vorticityforce.fs",
        "boundary.fs"
    ]);
    loader.run(function(files) {
        // remove file extension before passing shaders to init
        var shaders = {};
        for (var name in files) {
            shaders[name.split(".")[0]] = files[name];
        }
        init(shaders);
    });
}());
