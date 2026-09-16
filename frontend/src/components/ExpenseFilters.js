const CATEGORIES = [
  "All Categories",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Other",
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Amount: High to Low" },
  { value: "amount-asc", label: "Amount: Low to High" },
];

const ExpenseFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  month,
  onMonthChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="filters-container">
      {/* Top Search bar */}
      <div className="search-bar-wrapper">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="search-input"
          placeholder="Search expenses by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search expenses"
        />

        {search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            title="Clear search text"
            aria-label="Clear search text"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter and Sort Controls Grid */}
      <div className="filters-row">
        <div className="filter-item">
          <label htmlFor="filter-category" className="filter-label">
            Category
          </label>
          <div className="select-wrapper">
            <select
              id="filter-category"
              className="filter-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "All Categories" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-month" className="filter-label">
            Month
          </label>
          <input
            id="filter-month"
            type="month"
            className="filter-month-input"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="filter-sort" className="filter-label">
            Sort by
          </label>
          <div className="select-wrapper">
            <select
              id="filter-sort"
              className="filter-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-item filter-actions">
          <label className="filter-label filter-label-spacer" aria-hidden="true">
            Reset
          </label>
          <button
            type="button"
            className={`btn-clear-filters ${
              hasActiveFilters ? "btn-clear-active" : ""
            }`}
            onClick={onClearFilters}
            title="Reset all filters to default"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
