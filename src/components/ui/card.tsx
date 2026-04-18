export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-[#111] rounded-2xl p-6 shadow-lg">
      {children}
    </div>
  );
}