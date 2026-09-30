// Focus shell area (BONES-shell Focus variant): Bake Mode draws its own header, with
// no navigation and no footer. Access is enforced in proxy.ts like the App area.
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
