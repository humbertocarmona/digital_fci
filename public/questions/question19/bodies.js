class Body {
    constructor(x, y, vx, vy, ax, ay, lx, ly, label, color) {
        // Normalized coordinates (0 to 1) with lower left as (0, 0)
        this.x = x;
        this.y = y;
        this.x0 = x;  // Store initial x
        this.y0 = y;  // Store initial y

        this.vx = vx;
        this.vy = vy;
        this.vx0 = vx;  // Store initial velocity in x
        this.vy0 = vy;  // Store initial velocity in y

        this.ax = ax;
        this.ay = ay;
        this.lx = lx; // width in normalized units
        this.ly = ly; // height in normalized units
        this.label = label;
        this.color = color;
        this.ghost_step = 10;
        this.t = 0;
        this.ghosts = [{ x: this.x0, y: this.y0, t: this.t }];

        // approximately 1/dt frames to 1...
        this.dt = 0.0005;
    }

    // Helper to convert normalized x to pixel x
    toPixelX(nx) {
        return nx * width;
    }

    // Helper to convert normalized y to pixel y (inverting y since p5's origin is at the top left)
    toPixelY(ny) {
        return height - ny * height;
    }

    show(show_label = false) {
        let px = this.toPixelX(this.x);
        let py = this.toPixelY(this.y);
        let lpx = this.lx * width;
        let lpy = this.ly * height;

        // Draw ghost trail

        for (let g of this.ghosts) {
            stroke(0);
            strokeWeight(1);
            fill(2 * this.color);
            let gx = this.toPixelX(g.x);
            let gy = this.toPixelY(g.y);
            rect(gx - lpx / 2, gy - lpy / 2, lpx, lpy);

            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(10);
            text("" + g.t.toFixed(0), gx, gy - lpy - 2);
        }

        fill(this.color);
        stroke(0);
        strokeWeight(2);
        // Center the rectangle at the pixel position
        rect(px - lpx / 2, py - lpy / 2, lpx, lpy);

        if (show_label) {
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(10);
            text(this.label, px, py);
        }
    }

    showVector(xx, yy, c = color(255, 0, 0)) {
        let px = this.toPixelX(this.x);
        let py = this.toPixelY(this.y);

        noStroke();
        fill(0);
        ellipse(px, py, 5, 5);

        stroke(c);
        strokeWeight(2);
        // Convert vector endpoint to pixel coordinates
        let ex = this.toPixelX(this.x + xx);
        let ey = this.toPixelY(this.y + yy);
        line(px, py, ex, ey);

        // Draw arrowhead
        let angle = atan2(yy * height, xx * width);
        let arrowSize = 10;
        let ax1 = ex - arrowSize * cos(angle + QUARTER_PI);
        let ay1 = ey - arrowSize * sin(angle + QUARTER_PI);
        let ax2 = ex - arrowSize * cos(angle - QUARTER_PI);
        let ay2 = ey - arrowSize * sin(angle - QUARTER_PI);
        line(ex, ey, ax1, ay1);
        line(ex, ey, ax2, ay2);

        stroke(0);
    }

    update(isRunning) {
        if (isRunning) {
            this.t += 1;

            this.x += this.vx * this.dt;
            this.y += this.vy * this.dt;
            this.vx += this.ax * this.dt;
            this.vy += this.ay * this.dt;

            if (this.t % this.ghost_step === 0) {
                this.ghosts.push({ x: this.x, y: this.y, t: this.t / 10 });
            }

        }

    }
    // Returns false if the body is outside the normalized area (0 to 1)
    checkBorders() {
        // If the body goes out of bounds in x or y, consider it has reached a border.
        if (this.x < -0.1 || this.x > 1.1 || this.y < -0.1 || this.y > 1.1) {
            return false;
        }
        return true;
    }

    reset() {
        this.x = this.x0;
        this.y = this.y0;
        this.vx = this.vx0;
        this.vy = this.vy0;
        this.t = 0;
        this.ghosts = [{ x: this.x0, y: this.y0, t: this.t }];
    }
}
