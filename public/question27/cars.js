class cars {
    constructor(x, y, vx, vy, ax, ay, r, l, h, label, color) {

        // parameters in local coordinate...
        this.x = x;
        this.y = y;
        this.x0 = this.x;
        this.y0 = this.y;


        this.vx = vx;
        this.vy = vy;
        this.vx0 = vx;
        this.vy0 = vy;

        this.ax = ax;
        this.ay = ay;


        this.r = r;
        this.label = label;

        this.length = l;
        this.height = h;

        this.color = color
    }
    show() {
        fill(this.color);
        stroke(0);
        strokeWeight(3);

        let xt = this.x - this.length / 3; // roda traseira
        let xd = this.x + this.length / 3; // roda dianteira
        let r = this.r;

        let yt = this.y - r / 2; // roda traseira
        let yd = this.y - r / 2; // roda dianteira

        ellipse(xt, yt, r, r);
        ellipse(xd, yd, r, r);

        let xr = this.x - this.length / 2; // traseira
        let yr = this.y - this.height - r; //  traseira

        rect(xr, yr, this.length, this.height);

        fill(0);
        strokeWeight(0);
        textAlign(CENTER, CENTER);
        textSize(8);
        text(this.label, this.x, this.y - this.height - r / 2);
    }

    showVector(xx, yy) {
        let py = this.y - this.height - this.r / 2;
        let px = this.x;
        strokeWeight(0);
        fill(0);
        ellipse(px, py, 5, 5)

        stroke(255, 0, 0);
        strokeWeight(2);
        // Compute end point
        let ex = px + xx;
        let ey = py + yy;

        // Draw main vector line
        line(px, py, ex, ey);

        // Draw arrowhead
        let angle = atan2(yy, xx); // Angle of the vector
        let arrowSize = 10; // Length of arrowhead

        let ax1 = ex - arrowSize * cos(angle + QUARTER_PI);
        let ay1 = ey - arrowSize * sin(angle + QUARTER_PI);

        let ax2 = ex - arrowSize * cos(angle - QUARTER_PI);
        let ay2 = ey - arrowSize * sin(angle - QUARTER_PI);

        line(ex, ey, ax1, ay1);
        line(ex, ey, ax2, ay2);

        stroke(0);
    }

    update() {
        if (running) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx += this.ax;
            this.vy += this.ay;
        }

    }

}