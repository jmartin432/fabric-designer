class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static randomUnitVector() {
        const theta = Math.random() * 2 * Math.PI;
        return [Math.cos(theta), Math.sin(theta)];
    }
}

export default Vector2;
  