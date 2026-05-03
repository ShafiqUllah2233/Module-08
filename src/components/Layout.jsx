import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-full bg-lavender-100">
      <div className="relative">
        <Header />
      </div>
      <main className="max-w-[1180px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
