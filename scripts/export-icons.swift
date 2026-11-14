// Exports the glyphs the UI kit needs as high-resolution alpha masks.
//   swift ui-kit/scripts/export-icons.swift <muesli_app_icon.png>
// Reads ui-kit/scripts/symbols.json ([{ "name": "cpu", "weight": "medium" }, ...]) and writes
// ui-kit/src/icons/generated/*.png plus manifest.json (glyph size per 1pt of point size).
// SF Symbols come from the system, so they match the app exactly on this macOS version.
import AppKit

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let outDir = root.appendingPathComponent("src/icons/generated")
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let basePoint: CGFloat = 64   // render point size
let scale: CGFloat = 4        // pixels per point → 256px for a 64pt glyph

func weight(_ s: String) -> NSFont.Weight {
    switch s {
    case "ultralight": return .ultraLight
    case "thin": return .thin
    case "light": return .light
    case "regular": return .regular
    case "medium": return .medium
    case "semibold": return .semibold
    case "bold": return .bold
    case "heavy": return .heavy
    case "black": return .black
    default: fatalError("unknown weight \(s)")
    }
}

func writePNG(size: NSSize, to url: URL, draw: (NSRect) -> Void) {
    let w = Int((size.width * scale).rounded(.up)), h = Int((size.height * scale).rounded(.up))
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    rep.size = size
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSGraphicsContext.current?.imageInterpolation = .high
    draw(NSRect(origin: .zero, size: size))
    NSGraphicsContext.restoreGraphicsState()
    try! rep.representation(using: .png, properties: [:])!.write(to: url)
}

struct Entry: Decodable { let name: String; let weight: String }
// symbols.json plus every scripts/symbols.d/*.json (one per screen group), de-duplicated.
var listFiles = [root.appendingPathComponent("scripts/symbols.json")]
let extraDir = root.appendingPathComponent("scripts/symbols.d")
if let extras = try? FileManager.default.contentsOfDirectory(at: extraDir, includingPropertiesForKeys: nil) {
    listFiles += extras.filter { $0.pathExtension == "json" }.sorted { $0.path < $1.path }
}
var seen = Set<String>()
let list = try listFiles.flatMap { try JSONDecoder().decode([Entry].self, from: Data(contentsOf: $0)) }
    .filter { seen.insert("\($0.name)@\($0.weight)").inserted }
var manifest: [String: [String: Double]] = [:]

// 1. SF Symbols
for e in list {
    let config = NSImage.SymbolConfiguration(pointSize: basePoint, weight: weight(e.weight))
    guard let img = NSImage(systemSymbolName: e.name, accessibilityDescription: nil)?.withSymbolConfiguration(config) else {
        FileHandle.standardError.write("missing symbol \(e.name)\n".data(using: .utf8)!)
        exit(1)
    }
    let key = "\(e.name)@\(e.weight)"
    writePNG(size: img.size, to: outDir.appendingPathComponent("\(key).png")) { rect in
        NSColor.black.set()
        img.draw(in: rect)
        rect.fill(using: .sourceIn)
    }
    manifest[key] = ["w": Double(img.size.width / basePoint), "h": Double(img.size.height / basePoint)]
}

// 2. Time Turner icon — TimeTurnerIcon.swift @ v0.8.6, drawn at 20×20pt, scaled up.
let ttScale: CGFloat = 16
writePNG(size: NSSize(width: 20 * ttScale, height: 20 * ttScale), to: outDir.appendingPathComponent("time-turner.png")) { _ in
    let t = NSAffineTransform(); t.scale(by: ttScale); t.concat()
    NSColor.black.setStroke()
    let ring = NSBezierPath(ovalIn: NSRect(x: 2, y: 2, width: 16, height: 16))
    ring.lineWidth = 1.15; ring.stroke()
    let orbit = NSBezierPath(ovalIn: NSRect(x: 0.8, y: 6, width: 18.4, height: 8))
    orbit.transform(using: AffineTransform(translationByX: -10, byY: -10))
    var tilt = AffineTransform(); tilt.rotate(byDegrees: 38)
    orbit.transform(using: tilt)
    orbit.transform(using: AffineTransform(translationByX: 10, byY: 10))
    orbit.lineWidth = 0.9; orbit.stroke()
    let glass = NSBezierPath()
    glass.move(to: NSPoint(x: 7, y: 15)); glass.line(to: NSPoint(x: 13, y: 15))
    glass.line(to: NSPoint(x: 13, y: 13)); glass.curve(to: NSPoint(x: 10, y: 10), controlPoint1: NSPoint(x: 13, y: 12), controlPoint2: NSPoint(x: 11, y: 11))
    glass.curve(to: NSPoint(x: 13, y: 7), controlPoint1: NSPoint(x: 11, y: 9), controlPoint2: NSPoint(x: 13, y: 8))
    glass.line(to: NSPoint(x: 13, y: 5)); glass.line(to: NSPoint(x: 7, y: 5)); glass.line(to: NSPoint(x: 7, y: 7))
    glass.curve(to: NSPoint(x: 10, y: 10), controlPoint1: NSPoint(x: 7, y: 8), controlPoint2: NSPoint(x: 9, y: 9))
    glass.curve(to: NSPoint(x: 7, y: 13), controlPoint1: NSPoint(x: 9, y: 11), controlPoint2: NSPoint(x: 7, y: 12))
    glass.close(); glass.lineWidth = 1.25; glass.lineJoinStyle = .round; glass.stroke()
}
manifest["time-turner"] = ["w": 20, "h": 20]

// 3. Muesli waveform mark — MenuBarIconRenderer.loadCanonicalMarkMask @ v0.8.6.
let iconPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""
guard let icon = NSImage(contentsOfFile: iconPath)?.cgImage(forProposedRect: nil, context: nil, hints: nil),
      let crop = icon.cropping(to: CGRect(x: 195, y: 256, width: 635, height: 513)) else {
    FileHandle.standardError.write("pass the canonical assets/muesli_app_icon.png\n".data(using: .utf8)!); exit(1)
}
let w = crop.width, h = crop.height
let info = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue
let inCtx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: info)!
inCtx.interpolationQuality = .none
inCtx.draw(crop, in: CGRect(x: 0, y: 0, width: w, height: h))
let px = inCtx.data!.assumingMemoryBound(to: UInt8.self)
var bg = 255, fg = 0
for i in 0..<(w * h) { let b = Int(px[i * 4 + 2]); bg = min(bg, b); fg = max(fg, b) }
let outCtx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: info)!
let out = outCtx.data!.assumingMemoryBound(to: UInt8.self)
for i in 0..<(w * h) {
    let a = max(0, min(255, (Int(px[i * 4 + 2]) - bg) * 255 / (fg - bg)))
    out[i * 4 + 3] = UInt8(min(255, Int((CGFloat(a) * 1.08).rounded())))
}
let markRep = NSBitmapImageRep(cgImage: outCtx.makeImage()!)
try markRep.representation(using: .png, properties: [:])!.write(to: outDir.appendingPathComponent("muesli-mark.png"))
manifest["muesli-mark"] = ["w": Double(w), "h": Double(h)]

let json = try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
try json.write(to: outDir.appendingPathComponent("manifest.json"))

// Static imports work in every bundler (Remotion/webpack, Vite, esbuild).
let keys = manifest.keys.sorted()
var ts = "// GENERATED by ui-kit/scripts/export-icons.swift. Do not edit.\n"
for (i, k) in keys.enumerated() { ts += "import g\(i) from './\(k).png';\n" }
ts += "\nexport const glyphs = {\n"
for (i, k) in keys.enumerated() {
    let m = manifest[k]!
    ts += "  '\(k)': {src: g\(i) as string, w: \(m["w"]!), h: \(m["h"]!)},\n"
}
ts += "} as const;\n\nexport type GlyphKey = keyof typeof glyphs;\n"
try ts.write(to: outDir.appendingPathComponent("index.ts"), atomically: true, encoding: .utf8)
print("exported \(manifest.count) glyphs → \(outDir.path)")
