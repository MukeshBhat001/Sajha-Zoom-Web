import { Tag } from 'lucide-react';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
  const hasCategories = categories.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
          selectedCategory === ''
            ? 'border-[#ff7422] bg-[#ff7422] text-white shadow-sm'
            : 'border-orange-100 bg-white text-zinc-700 hover:border-[#ff7422]/40 hover:text-[#ff7422]'
        }`}
      >
        <Tag className="h-4 w-4" aria-hidden="true" />
        All classes
      </button>

      {hasCategories
        ? categories.map((category) => (
            <button
              type="button"
              key={category.name}
              onClick={() => onSelect(category.name)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                selectedCategory === category.name
                  ? 'border-[#ff7422] bg-[#ff7422] text-white shadow-sm'
                  : 'border-orange-100 bg-white text-zinc-700 hover:border-[#ff7422]/40 hover:text-[#ff7422]'
              }`}
            >
              {category.name}
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  selectedCategory === category.name ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {category.count}
              </span>
            </button>
          ))
        : null}
    </div>
  );
}
