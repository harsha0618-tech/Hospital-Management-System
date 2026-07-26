function SearchBar({ value, onChange, placeholder = "Search by Patient ID or Name...", colorClass = "brand" }) {
  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full sm:w-80 pl-9 pr-3 py-2.5 border border-gray-200 rounded-full text-sm bg-white shadow-soft focus:outline-none focus:ring-2 focus:ring-${colorClass}-DEFAULT`}
      />
    </div>
  );
}

export default SearchBar;