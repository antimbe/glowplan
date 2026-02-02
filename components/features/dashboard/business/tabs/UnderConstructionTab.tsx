"use client";

export default function UnderConstructionTab() {
  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-[#2a3626]/10 flex items-center justify-center">
          <span className="text-3xl">🚧</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[#2a3626] text-xl font-bold">Section en construction</h2>
          <p className="text-gray-500 text-sm text-center max-w-md">
            Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
