export function Button({
  children,
  className = "",
  ...props
}: any) {
  return (
    <button
      {...props}
      className={
        "bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl transition " +
        className
      }
    >
      {children}
    </button>
  );
}