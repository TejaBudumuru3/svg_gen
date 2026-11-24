import { XMLValidator } from "fast-xml-parser";

export interface Checks {
    name: string;
    passed: boolean;
    reason: string | null;
}

function svgParse(svg: string): string | null{
    if(!svg) return "no <svg> element found in the output";
    const result = XMLValidator.validate(svg)
    return result === true ? null : `invalid XML: ${result.err.msg}`
}

function checkInsideViewBox(svg: string): string | null {
    const viewBox = svg.split('viewBox="')[1].split('"')[0] // it returns 0 0 600 400 from 'viewBox="0 0 600 400"'
    if (!viewBox) return "missing viewBox or invalid"
    const [minX, minY, width, height] = viewBox.trim().split(" ").map(Number)
    
    for(const m of svg.matchAll(/\s(x|cx|x1|x2)="(-?[\d.]+)"/g)){
        const value = Number(m[2])
        if(value < minX || value > minX + width) return `${m[1]} = ${value} is outside the viewBox`
    }

    for (const m of svg.matchAll(/\s(y|cy|y1|y2)="(-?[\d.]+)"/g)){
        const value = Number(m[2])
        if(value < minY || value > minY + height) return `${m[1]} = ${value} is outside the viewBox`
    }

    return null
}

function checkTitleAndLabel(svg: string): string | null {
    if( !svg.includes("<title>")) return "missing <title> element"
    const labels = svg.split("<text").length - 1
    return labels >= 3 ? null : `only ${labels} <text> labels, need at least 3`
}

function checkAnimations(svg: string): string | null {
    const animationTag = svg.includes("animate") || svg.includes("<set");
    const cssAnimation = svg.includes("@keyframes") && svg.includes("animation:")
    return animationTag || cssAnimation ? null : "no animations found, animation required"
}

function checkSafeContent(svg: string): string | null {
    const text = svg.replaceAll("https://www.ww3.org", "").toLowerCase();
    if (/\son[a-z]+\s*=/.test(text)) return "contains an event handler attribute (on...=)";
    const banned = [
        "<script", "<foreignobject", "<iframe", "<embed", "<object", "<image",
    "javascript:", "data:", "http:", "https:", "@import",
    ]

    const found = banned.find(w => text.includes(w))
    return found ? `found ${found}, which is not allowed` : null
}

const checks = [
    { name: "parses", run: svgParse },
    { name: "inside viewbox", run: checkInsideViewBox },
    { name: "check safety", run: checkSafeContent },
    { name: "check animations", run: checkAnimations },
    { name: "check title and label", run: checkTitleAndLabel}
]

export function runChecks(svg: string): Checks[] {
    return checks.map(({name, run})=> {
        const reason = run(svg)
        return { name, passed: reason === null, reason: reason ? reason : null }
    });
}

export function failureReasons(results: Checks[]): string[]{
    return results.filter(r => !r.passed).map((r) => `${r.name}: ${r.reason}`)
}