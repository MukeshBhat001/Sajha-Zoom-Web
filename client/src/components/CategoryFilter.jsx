import { ChevronDown, Tag } from 'lucide-react';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <label className="relative block h-11 w-full sm:w-40">
      <span className="sr-only">Filter classes</span>
      <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ff7422]" aria-hidden="true" />
      <select
        value={selectedCategory}
        onChange={(event) => onSelect(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-orange-100 bg-white pl-9 pr-9 text-sm font-semibold text-zinc-800 shadow-sm outline-none transition hover:border-[#ff7422]/50 focus:border-[#ff7422] focus:ring-2 focus:ring-[#ff7422]/20"
      >
        <option value="">All classes</option>
        {categories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name} ({category.count})
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
    </label>
  );
}
