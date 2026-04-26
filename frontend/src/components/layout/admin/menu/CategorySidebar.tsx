type Category = {
  id: number
  name: string
}

type CategorySidebarProps = {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
}

function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="border border-white p-4">
      <h3 className="mb-4 text-lg font-medium">Categories</h3>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="border border-white p-4 text-sm">
            No categories loaded yet.
          </div>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full border px-4 py-3 text-left transition ${
                selectedCategoryId === category.id
                  ? 'border-white bg-white text-black'
                  : 'border-white text-white hover:bg-white hover:text-black'
              }`}
            >
              {category.name}
            </button>
          ))
        )}
      </div>
    </aside>
  )
}

export default CategorySidebar