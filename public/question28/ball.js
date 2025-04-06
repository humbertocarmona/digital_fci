class ball {
    constructor(x, y, vx, vy, ax, ay, r, label) {
        let ground = 0.98 * height;
        let ceiling = 0.05 * height;

        // parameters in local coordinate...
        this.x = map(x, 0, 1, 0, width);
        this.y = map(y, 0, 1, ground, ceiling);
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


    }
    show() {
        fill(255);
        stroke(0);
        strokeWeight(1);
        ellipse(this.x, this.y, this.r, this.r);

        fill(0);
        strokeWeight(0);
        textAlign(CENTER, CENTER);
        textSize(8);
        text(this.label, this.x, this.y);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.ax;
        this.vy += this.ay;

        if (!this.checkCollision()) {
            this.vx = 0;
            this.vy = 0;
            running = false;
        }
    }

    checkCollision() {
        let ground = 0.98 * height;
        let ceiling = 0.05 * height;
        let flag = true

        if (this.y + this.r / 2 > ground) {
            this.y = ground - this.r / 2;
            flag = false;
        }
        else if (this.x + this.r / 2 > width) {
            this.x = width - this.r / 2;
            flag = false;
        } else if (this.x - this.r / 2 < 0) {
            this.x = this.r / 2;
            flag = false;
        }

        return flag;
    }
}