/**
 * Fine Line galleri - Product Page JavaScript
 * Handles product detail display and related items
 */

class ProductPage {
  constructor() {
    this.product = null;
    this.allItems = [];

    this.init();
  }

  async init() {
    await this.loadData();
    this.loadProduct();
    this.loadSimilarItems();
  }

  async loadData() {
    try {
      const response = await fetch("data/inventory.json");
      const data = await response.json();
      this.allItems = data.items || [];
    } catch (error) {
      console.error("Error loading inventory:", error);
      this.allItems = [];
    }
  }

  loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      this.showError();
      return;
    }

    this.product = this.allItems.find((item) => item.id === productId);

    if (!this.product) {
      this.showError();
      return;
    }

    this.renderProduct();
  }

  showError() {
    const container = document.getElementById("productContainer");
    if (container) {
      container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <h2>Produkten hittades inte</h2>
                    <p>Det verkar som att produkten du letar efter inte finns eller har tagits bort.</p>
                    <a href="galleri.html" class="btn btn-primary" style="margin-top: 1.5rem;">Tillbaka till galleriet</a>
                </div>
            `;
    }
  }

  renderProduct() {
    // Update page title
    document.title = `${this.product.name} | Fine Line galleri`;

    // Update breadcrumb
    const breadcrumb = document.getElementById("breadcrumbCurrent");
    if (breadcrumb) {
      breadcrumb.textContent = this.product.name;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content =
        this.product.description ||
        `${this.product.name} - Unikt konstverk från Fine Line galleri`;
    }

    // Main image with skeleton handling
    const mainImage = document.getElementById("mainImage");
    const mainImageSkeleton = document.getElementById("mainImageSkeleton");
    if (mainImage) {
      mainImage.onload = () => {
        if (mainImageSkeleton) mainImageSkeleton.style.display = "none";
        mainImage.style.display = "block";
      };
      mainImage.src = getImageUrl(this.product.image);
      mainImage.alt = this.product.name;
    }

    // Thumbnails (if multiple images)
    const thumbnails = document.getElementById("thumbnails");
    if (thumbnails && this.product.images?.length > 1) {
      thumbnails.innerHTML = this.product.images
        .map(
          (img, index) => `
                <div class="product-thumbnail ${index === 0 ? "active" : ""}" data-index="${index}">
                    <img src="${getImageUrl(img)}" alt="${this.product.name} - bild ${index + 1}">
                </div>
            `,
        )
        .join("");

      // Add click handlers
      thumbnails.querySelectorAll(".product-thumbnail").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const index = parseInt(thumb.dataset.index);
          mainImage.src = getImageUrl(this.product.images[index]);
          thumbnails
            .querySelectorAll(".product-thumbnail")
            .forEach((t) => t.classList.remove("active"));
          thumb.classList.add("active");
        });
      });
    }

    // Product info - replace skeleton content
    this.setTextContent("productCategory", this.product.category || "");
    this.setTextContent("productTitle", this.product.name);
    this.setTextContent("productPrice", formatPrice(this.product.price));

    const description = document.getElementById("productDescription");
    if (description) {
      description.innerHTML = `<p>${this.product.description || "Ingen beskrivning tillgänglig."}</p>`;
    }

    // Details
    this.setTextContent("productSize", this.product.size || "-");
    this.setTextContent("productType", this.product.type || "Original");
    this.setTextContent(
      "productAvailability",
      this.product.available !== false ? "I lager" : "Såld",
    );

    // Colors
    const colorsContainer = document.getElementById("productColors");
    if (colorsContainer && this.product.colors?.length > 0) {
      const colorTags = document.createElement("div");
      colorTags.className = "color-tags";
      colorTags.innerHTML = this.product.colors
        .map(
          (color) =>
            `<span class="color-tag" style="background-color: ${getColorValue(color)}" title="${color}"></span>`,
        )
        .join("");
      colorsContainer.querySelector(".color-tags")?.replaceWith(colorTags);
    } else if (colorsContainer) {
      colorsContainer.style.display = "none";
    }

    // Update inquiry button
    const inquiryBtn = document.getElementById("inquiryBtn");
    if (inquiryBtn) {
      const subject = encodeURIComponent(`Förfrågan: ${this.product.name}`);
      const body = encodeURIComponent(
        `Hej!\n\nJag är intresserad av verket "${this.product.name}".\n\n`,
      );
      inquiryBtn.href = `mailto:hej@finelinegalleri.se?subject=${subject}&body=${body}`;
    }
  }

  loadSimilarItems() {
    const container = document.getElementById("similarWorks");
    if (!container || !this.product) return;

    const currentColors = this.product.colors || [];
    const currentType = this.product.type;

    // Score items by similarity (shared colors and same type)
    const scoredItems = this.allItems
      .filter((item) => item.id !== this.product.id)
      .map((item) => {
        let score = 0;

        // Score for matching type
        if (item.type && item.type === currentType) {
          score += 3;
        }

        // Score for each shared color
        const itemColors = item.colors || [];
        const sharedColors = currentColors.filter((c) =>
          itemColors.includes(c),
        );
        score += sharedColors.length * 2;

        // Small bonus for same category
        if (item.category === this.product.category) {
          score += 1;
        }

        return { item, score };
      })
      .filter((scored) => scored.score > 0) // Only items with some similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((scored) => scored.item);

    // If not enough similar items, fill with random others
    let similar = scoredItems;
    if (similar.length < 4) {
      const others = this.allItems
        .filter(
          (item) => item.id !== this.product.id && !similar.includes(item),
        )
        .slice(0, 4 - similar.length);
      similar = [...similar, ...others];
    }

    if (similar.length === 0) {
      container.parentElement.style.display = "none";
      return;
    }

    container.innerHTML = similar
      .map((item) => this.createItemCard(item))
      .join("");
  }

  createItemCard(item) {
    const colorTags =
      item.colors
        ?.map(
          (color) =>
            `<span class="color-tag" style="background-color: ${getColorValue(color)}" title="${color}"></span>`,
        )
        .join("") || "";

    return `
            <article class="artwork-card">
                <a href="produkt.html?id=${item.id}">
                    <div class="artwork-image">
                        <img src="${getImageUrl(item.image)}" 
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
                            <span class="artwork-price">${formatPrice(item.price)}</span>
                        </div>
                        ${colorTags ? `<div class="color-tags">${colorTags}</div>` : ""}
                    </div>
                </a>
            </article>
        `;
  }

  setTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }
}

// Initialize product page
document.addEventListener("DOMContentLoaded", () => {
  new ProductPage();
});
