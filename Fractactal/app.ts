var svgns = "http://www.w3.org/2000/svg";

interface Drawable {
    draw(svg: SVGSVGElement, depth: number);
}

class Triangle implements Drawable {
    constructor(private x: number, private y: number, private side: number, private rot: number) {
    }

    draw(svg: SVGSVGElement, depth: number) {
        if (!depth)
            return;

        var half = this.side / 2;

        new Square(this.x, this.y, half, this.rot).draw(svg, depth - 1);
        new Triangle(this.x - Math.sin(this.rot) * half, this.y + Math.cos(this.rot) * half, half, this.rot).draw(svg, depth - 1);
        new Triangle(this.x + Math.cos(this.rot) * half, this.y + Math.sin(this.rot) * half, half, this.rot).draw(svg, depth - 1);

        var tri: SVGPolygonElement = <SVGPolygonElement>document.createElementNS(svgns, 'polygon');

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
    }
}

class Square implements Drawable {
    constructor(private x: number, private y: number, private side: number, private rot: number) {
    }

    draw(svg: SVGSVGElement, depth: number) {
        if (!depth)
            return;

        new Square(
            this.x + Math.cos(this.rot) * this.side / 2,
            this.y + Math.sin(this.rot) * this.side / 2,
            this.side / Math.SQRT2,
            this.rot + Math.PI / 4).draw(svg, depth - 1);

        new Triangle(
            this.x,
            this.y,
            this.side / 2,
            this.rot).draw(svg, depth - 1);

        new Triangle(
            this.x + Math.cos(this.rot) * this.side,
            this.y + Math.sin(this.rot) * this.side,
            this.side / 2,
            this.rot + Math.PI / 2).draw(svg, depth - 1);

        new Triangle(
            this.x + Math.cos(this.rot) * this.side - Math.sin(this.rot) * this.side,
            this.y + Math.sin(this.rot) * this.side + Math.cos(this.rot) * this.side,
            this.side / 2,
            this.rot + 2 * Math.PI / 2).draw(svg, depth - 1);

        new Triangle(
            this.x - Math.sin(this.rot) * this.side,
            this.y + Math.cos(this.rot) * this.side,
            this.side / 2,
            this.rot + 3 * Math.PI / 2).draw(svg, depth - 1);

        var rect: SVGRectElement = <SVGRectElement>document.createElementNS(svgns, 'rect');

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
    }
}

function clearSvg() {
    var svg = document.getElementById('svg');

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
}

function drawSize(val: string) {
    var inputRange = <HTMLInputElement>document.getElementById("depthRange");
    var inputNumber = <HTMLInputElement>document.getElementById("depthNumber");

    var svg: SVGSVGElement = <SVGSVGElement><any>document.getElementById('svg');

    clearSvg();

    var prefix = window.location.search.split("?")[0];
    window.history.pushState(null, null, `${prefix}?depth=${val}`);
    inputRange.value = val;
    inputNumber.value = val;
    new Square(0, 0, 800, 0).draw(svg, +val);
}

function drawEv(ev: any) {
    drawSize(ev.target.value)
}

function drawMake() {
    clearSvg();

    var svg: SVGSVGElement = <SVGSVGElement><any>document.getElementById('svg');
    
    var line: SVGPolylineElement = <SVGPolylineElement>document.createElementNS(svgns, 'polyline');

    var box = document.getElementById("edges").firstElementChild;

    var p = svg.createSVGPoint();
    p.x = 5;
    p.y = 5;
    line.points.appendItem(p);

    var x = 5 + +(<HTMLInputElement>box).value;
    var y = 5;
    var angle = 0;
    box = box.nextElementSibling;

    var p = svg.createSVGPoint();
    p.x = x;
    p.y = y;
    line.points.appendItem(p);

    for (; (<HTMLInputElement>box).value; box = box.nextElementSibling.nextElementSibling) {
        angle += Math.PI * +(<HTMLInputElement>box).value / 180;
        var length = +(<HTMLInputElement>box.nextElementSibling).value;

        x += length * Math.cos(angle);
        y += length * Math.sin(angle);

        var p = svg.createSVGPoint();
        p.x = x;
        p.y = y;
        line.points.appendItem(p);
    }
    
    line.style.fillOpacity = "0";
    line.style.stroke = Math.abs(x - 5) < 0.001 && Math.abs(y - 5) < 0.001 ? "green" : "red";
    line.style.strokeLinecap = "round";
    line.style.strokeLinejoin = "round";
    line.style.strokeWidth = "0.5";

    var transform = svg.createSVGTransform();
    transform.setScale(10, 10);
    line.transform.baseVal.appendItem(transform);

    svg.appendChild(line);
}

window.onload = () => {
    var inputRange = <HTMLInputElement>document.getElementById("depthRange");
    var inputNumber = <HTMLInputElement>document.getElementById("depthNumber");

    inputRange.onchange = drawEv;
    inputNumber.onchange = drawEv;

    inputRange.oninput = () => {
        inputNumber.value = inputRange.value;
    };

    inputNumber.oninput = () => {
        inputRange.value = inputNumber.value;
    };

    var depth = +window.location.search.split("depth=")[1];
    drawSize("3");

    document.getElementById("DisplayButton").onclick = () => {
        document.getElementById("displayControls").style.display = "";
        document.getElementById("makeControls").style.display = "none";

        drawSize(inputNumber.value);
    };

    var shape = <HTMLInputElement>document.getElementById("Shape0");
    var makeName = <HTMLInputElement>document.getElementById("makeName");
    shape.onclick = () => {<HTMLInputElement>document.getElementById("displayControls")
        document.getElementById("displayControls").style.display = "none";
        document.getElementById("makeControls").style.display = "";

        makeName.value = shape.value;
        
        drawMake();
    };

    makeName.oninput = () => {
        shape.value = makeName.value;
    }

    var edges = document.getElementById("edges");
    var box = edges.firstElementChild;
    for (; (<HTMLInputElement>box).value; box = box.nextElementSibling) {
        (<HTMLElement>box).oninput = () => {
            drawMake();
        };
    }

    var addEdgeLength = () => {
        var input = document.createElement("input");
        input.type = "number";
        input.style.width = "4em";
        input.min = "1";
        input.value = "10";
        input.oninput = drawMake;

        edges.insertBefore(document.createTextNode(" Length: "), edges.lastElementChild);
        edges.insertBefore(input, edges.lastElementChild);
    };

    var addEdgeTurn = () => {
        var input = document.createElement("input");
        input.type = "number";
        input.style.width = "4em";
        input.min = "0";
        input.max = "180";
        input.value = "120";
        input.oninput = drawMake;

        edges.insertBefore(document.createTextNode(" Turn: "), edges.lastElementChild);
        edges.insertBefore(input, edges.lastElementChild);
    };

    document.getElementById("addSegment").onclick = () => {
        addEdgeTurn();
        addEdgeLength();
        
        drawMake();
    };

    document.getElementById("removeSegment").onclick = () => {
        var remove = edges.lastElementChild.previousElementSibling.previousElementSibling.previousSibling;
        edges.removeChild(remove.nextSibling);
        edges.removeChild(remove.nextSibling);
        edges.removeChild(remove.nextSibling);
        edges.removeChild(remove);

        drawMake();
    };

    addEdgeLength();
    addEdgeTurn();
    addEdgeLength();
    addEdgeTurn();
    addEdgeLength();
};
