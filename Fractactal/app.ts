var svgns = "http://www.w3.org/2000/svg";

interface Drawable {
    draw(svg: SVGSVGElement, depth: number);
}

function point(x: number, y: number, svg: SVGSVGElement): SVGPoint {
    var p = svg.createSVGPoint();
    p.x = x;
    p.y = y;
    return p;
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

        tri.points.appendItem(point(this.x,             this.y,             svg));
        tri.points.appendItem(point(this.x + this.side, this.y,             svg));
        tri.points.appendItem(point(this.x,             this.y + this.side, svg));

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

function drawTurns(tx: number, ty: number, ps: { length: number; turn: number; label?: string }[]) {
    var svg: SVGSVGElement = <SVGSVGElement><any>document.getElementById('svg');
    var line: SVGPolylineElement = <SVGPolylineElement>document.createElementNS(svgns, 'polyline');

    var scaleT = svg.createSVGTransform();
    scaleT.setScale(10, 10);

    var translateT = svg.createSVGTransform();
    translateT.setTranslate(tx, ty);

    var x = 0;
    var y = 0;

    line.points.appendItem(point(x, y, svg));

    var angle = 0;
    
    for (var i = 0; i < ps.length; ++i) {
        var oldAngle = angle;

        angle += Math.PI * ps[i].turn / 180;

        if (ps[i].label) {
            var text: SVGTextElement = <SVGTextElement>document.createElementNS(svgns, 'text');
            text.setAttribute('x', "" + x);
            text.setAttribute('y', "" + y);
            text.textContent = ps[i].label;
            text.style.fill = "black";
            text.style.fontSize = "12";
            text.transform.baseVal.appendItem(scaleT);
            text.transform.baseVal.appendItem(translateT);
            svg.appendChild(text);
        }


        x += ps[i].length * Math.cos(angle);
        y += ps[i].length * Math.sin(angle);

        line.points.appendItem(point(x, y, svg));
    }

    line.style.fillOpacity = "0";
    line.style.stroke = Math.abs(x) < 0.001 && Math.abs(y) < 0.001 ? "green" : "red";
    line.style.strokeLinecap = "round";
    line.style.strokeLinejoin = "round";
    line.style.strokeWidth = "0.5";

    line.transform.baseVal.appendItem(scaleT);
    line.transform.baseVal.appendItem(translateT);

    svg.appendChild(line);
}

function drawMake() {
    clearSvg();

    var box = document.getElementById("edges").firstElementChild;

    var ps = [{ length: +(<HTMLInputElement>box).value, turn: 0 }];

    box = box.nextElementSibling;
    for (; (<HTMLInputElement>box).value; box = box.nextElementSibling.nextElementSibling) {
        ps.push({ length: +(<HTMLInputElement>box.nextElementSibling).value, turn: +(<HTMLInputElement>box).value, label: "A" });
    }
    
    drawTurns(5, 5, ps);
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

    var subShapes = document.getElementById("subShapes");

    var addSubShapes = () => {
        var input = document.createElement("input");
        input.type = "text";
        input.oninput = drawMake;

        subShapes.appendChild(document.createTextNode("Sub Shape: "));
        subShapes.appendChild(input);
        subShapes.appendChild(document.createElement("br"));
    };

    var removeSubShapes = () => {
        if (!subShapes.lastChild) {
            return;
        }

        subShapes.removeChild(subShapes.lastChild);
        subShapes.removeChild(subShapes.lastChild);
        subShapes.removeChild(subShapes.lastChild);
        
        drawMake();
    };

    document.getElementById("addSubShape").onclick = addSubShapes;
    document.getElementById("removeSubShape").onclick = removeSubShapes;

    addEdgeLength();
    addEdgeTurn();
    addEdgeLength();
    addEdgeTurn();
    addEdgeLength();

    if (window.location.host.indexOf("localhost") != -1) {
        shape.onclick(null);
    }
};
