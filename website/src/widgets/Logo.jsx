// The gradient "AI" square used across the mobile app
export default function Logo({ size = 64, radius = 20, fontSize = 24 }) {
  return (
    <div
      className="logo"
      style={{ width: size, height: size, borderRadius: radius, fontSize }}
      aria-hidden="true"
    >
      AI
    </div>
  )
}
