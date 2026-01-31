/**
 * Fine Line galleri - Gallery Page JavaScript
 * Handles filtering, sorting, and display of artwork items
 */

class GalleryManager {
  constructor() {
    this.items = [];
    this.filteredItems = [];
    this.currentCategory = "alla";
    this.currentSort = "newest";
    this.itemsPerPage = 12;
    this.currentPage = 1;

    this.grid = document.getElementById("galleryGrid");
    this.emptyState = document.getElementById("galleryEmpty");
    this.pagination = document.getElementById("pagination");
    this.categoryFilters = document.getElementById("categoryFilters");
    this.sortSelect = document.getElementById("sortSelect");

    this.init();
  }

  async init() {
    await this.loadItems();
    this.setupEventListeners();
    this.checkUrlParams();
    this.render();
  }

  async loadItems() {
    try {
      const response = await fetch("data/inventory.json");
      const data = await response.json();
      this.items = data.items || [];
      this.filteredItems = [...this.items];
    } catch (error) {
      console.error("Error loading inventory:", error);
      this.items = [];
      this.filteredItems = [];
    }
  }

  setupEventListeners() {
    // Category filter buttons
    if (this.categoryFilters) {
      this.categoryFilters.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
          this.setCategory(e.target.dataset.category);
        }
      });
    }

    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
      });
    }

    // Reset filters button
    const resetBtn = document.getElementById("resetFilters");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.setCategory("alla");
      });
    }
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("kategori");
    if (category) {
      this.setCategory(category, false);
    }
  }

  setCategory(category, updateUrl = true) {
    this.currentCategory = category;
    this.currentPage = 1;

    // Update active button
    if (this.categoryFilters) {
      this.categoryFilters.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.category === category);
      });
    }

    // Update URL
    if (updateUrl) {
      const url = new URL(window.location);
      if (category === "alla") {
        url.searchParams.delete("kategori");
      } else {
        url.searchParams.set("kategori", category);
      }
      window.history.pushState({}, "", url);
    }

    this.applyFilters();
    this.render();
  }

  applyFilters() {
    // Filter by category
    if (this.currentCategory === "alla") {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(
        (item) =>
          item.category?.toLowerCase() === this.currentCategory.toLowerCase() ||
          item.category
            ?.toLowerCase()
            .includes(this.currentCategory.toLowerCase()),
      );
    }

    // Sort items
    this.sortItems();
  }

  sortItems() {
    switch (this.currentSort) {
      case "newest":
        this.filteredItems.sort(
          (a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0),
        );
        break;
      case "oldest":
        this.filteredItems.sort(
          (a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0),
        );
        break;
      case "price-low":
        this.filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        this.filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-az":
        this.filteredItems.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "sv"),
        );
        break;
    }
  }

  render() {
    if (!this.grid) return;

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = this.filteredItems.slice(startIndex, endIndex);

    // Show/hide empty state
    if (this.filteredItems.length === 0) {
      this.grid.style.display = "none";
      if (this.emptyState) this.emptyState.style.display = "block";
      if (this.pagination) this.pagination.style.display = "none";
      return;
    }

    this.grid.style.display = "";
    if (this.emptyState) this.emptyState.style.display = "none";

    // Render items
    this.grid.innerHTML = pageItems
      .map((item) => this.createItemCard(item))
      .join("");

    // Render pagination
    this.renderPagination();
  }

  createItemCard(item) {
    const colorTags =
      item.colors
        ?.map(
          (color) =>
            `<span class="color-tag" style="background-color: ${this.getColorValue(color)}" title="${color}"></span>`,
        )
        .join("") || "";

    const availabilityClass = item.available === false ? "sold" : "";

    return `
            <article class="artwork-card ${availabilityClass}">
                <a href="produkt.html?id=${item.id}">
                    <div class="artwork-image">
                        <img src="${item.image || "images/placeholder-artwork.jpg"}" 
                             alt="${item.name}" 
                             loading="lazy">
                        <div class="artwork-overlay">
                            <span class="btn btn-primary">Visa verk</span>
                        </div>
                    </div>
                    <div class="artwork-info">
                        <h3 class="artwork-title">${item.name}</h3>
                        <div class="artwork-meta">
                            <span class="artwork-category">${item.category || ""}</span>
                            <span class="artwork-price">${this.formatPrice(item.price)}</span>
                        </div>
                        ${colorTags ? `<div class="color-tags">${colorTags}</div>` : ""}
                    </div>
                </a>
            </article>
        `;
  }

  renderPagination() {
    if (!this.pagination) return;

    const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);

    if (totalPages <= 1) {
      this.pagination.style.display = "none";
      return;
    }

    this.pagination.style.display = "flex";

    let html = "";

    // Previous button
    if (this.currentPage > 1) {
      html += `<button class="pagination-btn" data-page="${this.currentPage - 1}">←</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        html += `<button class="pagination-btn ${i === this.currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    // Next button
    if (this.currentPage < totalPages) {
      html += `<button class="pagination-btn" data-page="${this.currentPage + 1}">→</button>`;
    }

    this.pagination.innerHTML = html;

    // Add click listeners
    this.pagination.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentPage = parseInt(btn.dataset.page);
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  formatPrice(price) {
    if (!price) return "Pris på förfrågan";
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getColorValue(colorName) {
    const colors = {
      svart: "#1a1a1a",
      vit: "#ffffff",
      röd: "#e07a5f",
      blå: "#3d5a80",
      grön: "#81b29a",
      gul: "#f4d35e",
      orange: "#f4a261",
      lila: "#8e6c88",
      rosa: "#e8b4bc",
      brun: "#8b4513",
      guld: "#d4a574",
      silver: "#c0c0c0",
      turkos: "#40e0d0",
      korall: "#e07a5f",
      mint: "#98ff98",
      lavendel: "#e6e6fa",
      beige: "#f5f5dc",
      grå: "#888888",
    };

    return colors[colorName?.toLowerCase()] || "#888888";
  }
}

// Initialize gallery on page load
document.addEventListener("DOMContentLoaded", () => {
  new GalleryManager();
});
