var F2D = F2D === undefined ? {} : F2D;

(function(F2D) {
    "use strict";

    F2D.Jacobi = function(fs, grid, iterations) {
        this.grid = grid;
        this.iterations = iterations === undefined ? 50 : iterations;

        this.uniforms = {
            x: {
                type: "t"
            },
            b: {
                type: "t"
            },
            gridSize: {
                type: "v2"
            },
            alpha: {
                type: "f"
            },
            beta: {
                type: "f"
            },
        };

        F2D.SlabopBase.call(this, fs, this.uniforms);
    };

    F2D.Jacobi.prototype = Object.create(F2D.SlabopBase.prototype);
    F2D.Jacobi.prototype.constructor = F2D.Jacobi;

    F2D.Jacobi.prototype.compute = function(renderer, x, b, output) {
        for (var i = 0; i < this.iterations; i++) {
            this.step(renderer, x, b, output);
        }
    };

    F2D.Jacobi.prototype.step = function(renderer, x, b, output) {
        this.uniforms.x.value = x.read;
        this.uniforms.b.value = b.read;
        this.uniforms.gridSize.value = this.grid.size;
        this.uniforms.alpha.value = -this.grid.scale * this.grid.scale;
        this.uniforms.beta.value = 4;

        renderer.render(this.scene, this.camera, output.write, false);
        output.swap();
    };

}(F2D));