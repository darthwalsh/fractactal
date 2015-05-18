var svgns = "http://www.w3.org/2000/svg";
var Triangle = (function () {
    function Triangle(x, y, side, rot) {
        this.x = x;
        this.y = y;
        this.side = side;
        this.rot = rot;
    }
    Triangle.prototype.draw = function (svg, depth) {
        if (!depth)
            return;
        var half = this.side / 2;
        new Square(this.x, this.y, half, this.rot).draw(svg, depth - 1);
        new Triangle(this.x - Math.sin(this.rot) * half, this.y + Math.cos(this.rot) * half, half, this.rot).draw(svg, depth - 1);
        new Triangle(this.x + Math.cos(this.rot) * half, this.y + Math.sin(this.rot) * half, half, this.rot).draw(svg, depth - 1);
        var tri = document.createElementNS(svgns, 'polygon');
        var p = svg.createSVGPoint();
        p.x = this.x;
        p.y = this.y;
        tri.points.appendItem(p);
        p = svg.createSVGPoint();
        p.x = this.x + this.side;
        p.y = this.y;
        tri.points.appendItem(p);
        p = svg.createSVGPoint();
        p.x = this.x;
        p.y = this.y + this.side;
        tri.points.appendItem(p);
        var transform = svg.createSVGTransform();
        transform.setRotate(this.rot * 180 / Math.PI, this.x, this.y);
        tri.transform.baseVal.appendItem(transform);
        tri.style.fillOpacity = "0";
        tri.style.stroke = "black";
        svg.appendChild(tri);
    };
    return Triangle;
})();
var Square = (function () {
    function Square(x, y, side, rot) {
        this.x = x;
        this.y = y;
        this.side = side;
        this.rot = rot;
    }
    Square.prototype.draw = function (svg, depth) {
        if (!depth)
            return;
        new Square(this.x + Math.cos(this.rot) * this.side / 2, this.y + Math.sin(this.rot) * this.side / 2, this.side / Math.SQRT2, this.rot + Math.PI / 4).draw(svg, depth - 1);
        new Triangle(this.x, this.y, this.side / 2, this.rot).draw(svg, depth - 1);
        new Triangle(this.x + Math.cos(this.rot) * this.side, this.y + Math.sin(this.rot) * this.side, this.side / 2, this.rot + Math.PI / 2).draw(svg, depth - 1);
        new Triangle(this.x + Math.cos(this.rot) * this.side - Math.sin(this.rot) * this.side, this.y + Math.sin(this.rot) * this.side + Math.cos(this.rot) * this.side, this.side / 2, this.rot + 2 * Math.PI / 2).draw(svg, depth - 1);
        new Triangle(this.x - Math.sin(this.rot) * this.side, this.y + Math.cos(this.rot) * this.side, this.side / 2, this.rot + 3 * Math.PI / 2).draw(svg, depth - 1);
        var rect = document.createElementNS(svgns, 'rect');
        rect.x.baseVal.value = this.x;
        rect.y.baseVal.value = this.y;
        rect.height.baseVal.value = this.side;
        rect.width.baseVal.value = this.side;
        var transform = svg.createSVGTransform();
        transform.setRotate(this.rot * 180 / Math.PI, this.x, this.y);
        rect.transform.baseVal.appendItem(transform);
        rect.style.fillOpacity = "0";
        rect.style.stroke = "black";
        svg.appendChild(rect);
    };
    return Square;
})();
window.onload = function () {
    var svg = document.getElementById('svg');
    var inputRange = document.getElementById("depthRange");
    var inputNumber = document.getElementById("depthNumber");
    var change = function (ev) {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        var val = ev.target.value;
        var prefix = window.location.search.split("?")[0];
        window.history.pushState(null, null, "" + prefix + "?depth=" + val);
        inputRange.value = val;
        inputNumber.value = val;
        new Square(0, 0, 800, 0).draw(svg, +val);
    };
    inputRange.onchange = change;
    inputNumber.onchange = change;
    inputRange.oninput = function () {
        inputNumber.value = inputRange.value;
    };
    inputNumber.oninput = function () {
        inputRange.value = inputNumber.value;
    };
    var depth = +window.location.search.split("depth=")[1];
    change({ target: { value: depth || 3 } });
};
//# sourceMappingURL=app.js.map