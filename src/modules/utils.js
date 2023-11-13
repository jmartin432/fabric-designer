const clamp = (n, min, max) => {
    return Math.max( min, Math.min(n, max) )
}

const mapNumberRange = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

const hslToRgb = (hue, sat, light) => {
    hue = hue % 360;

    if (hue < 0) {
        hue += 360;
    }

    sat /= 100;
    light /= 100;

    function f(n) {
        let k = (n + hue / 30) % 12;
        let a = sat * Math.min(light, 1 - light);
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }

    return [f(0) * 255, f(8) * 255, f(4) * 255];
}

const linearInterpolate = (a, b, v) => {
    return (b - a) * v + a;
}

const hexToRgb = (value) => {
    let r, g, b = 0;
    if (value.length === 4) {
        r = parseInt(value[1] + value[1], 16);
        g = parseInt(value[2] + value[2], 16);
        b = parseInt(value[3] + value[3], 16);
    } else if (value.length === 7) {
        r = parseInt(value[1] + value[2], 16);
        g = parseInt(value[3] + value[4], 16);
        b = parseInt(value[5] + value[6], 16);
    }
    return [r, g, b]
}

export { clamp, mapNumberRange, hslToRgb, linearInterpolate, hexToRgb }