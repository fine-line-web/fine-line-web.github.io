/**
 * Fine Line galleri - Product Page JavaScript
 * Handles product detail display, variants selection, and order functionality
 */

class ProductPage {
  constructor() {
    this.product = null;
    this.allItems = [];
    this.selectedVariant = null;
    this.selectedSize = null;
    this.currentImageIndex = 0;
    this.productImages = [];
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  async init() {
    await this.loadData();
    this.loadProduct();
    this.loadSimilarItems();
    this.setupOrderButton();
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

    // Get images array (support both 'images' array and legacy 'image' field)
    this.productImages =
      this.product.images && this.product.images.length > 0
        ? this.product.images
        : this.product.image
          ? [this.product.image]
          : [];

    if (mainImage && this.productImages.length > 0) {
      mainImage.onload = () => {
        if (mainImageSkeleton) mainImageSkeleton.style.display = "none";
        mainImage.style.display = "block";
      };
      mainImage.src = getImageUrl(this.productImages[0]);
      mainImage.alt = this.product.name;
    }

    // Setup carousel
    this.setupCarousel();

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

    // Render variants dropdown
    this.renderVariantsDropdown();

    // Render size dropdown
    this.renderSizeDropdown();
  }

  renderVariantsDropdown() {
    const container = document.getElementById("variantsContainer");
    if (!container) return;

    const variants = this.product.variants || [];

    if (variants.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    container.innerHTML = `
      <label for="variantSelect">Välj variant *</label>
      <select id="variantSelect" class="product-select" required>
        <option value="">-- Välj variant --</option>
        ${variants.map((v) => `<option value="${v}">${v}</option>`).join("")}
      </select>
    `;

    const select = document.getElementById("variantSelect");
    select.addEventListener("change", (e) => {
      this.selectedVariant = e.target.value;
      this.updateOrderButton();
    });
  }

  setupCarousel() {
    const carousel = document.getElementById("productCarousel");
    const dotsContainer = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");
    const mainImage = document.getElementById("mainImage");

    if (!carousel || this.productImages.length <= 1) {
      // Hide arrows and dots if only one image
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (dotsContainer) dotsContainer.style.display = "none";
      return;
    }

    // Create dots
    dotsContainer.innerHTML = this.productImages
      .map(
        (_, index) =>
          `<button class="carousel-dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Visa bild ${index + 1}"></button>`,
      )
      .join("");

    // Dot click handlers
    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        this.goToImage(parseInt(dot.dataset.index));
      });
    });

    // Arrow click handlers
    prevBtn.addEventListener("click", () => this.prevImage());
    nextBtn.addEventListener("click", () => this.nextImage());

    // Touch/swipe support for mobile
    const carouselMain = carousel.querySelector(".carousel-main");
    carouselMain.addEventListener(
      "touchstart",
      (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    carouselMain.addEventListener(
      "touchend",
      (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      },
      { passive: true },
    );

    // Keyboard navigation
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.prevImage();
      } else if (e.key === "ArrowRight") {
        this.nextImage();
      }
    });
  }

  goToImage(index) {
    if (index < 0 || index >= this.productImages.length) return;

    this.currentImageIndex = index;
    const mainImage = document.getElementById("mainImage");
    const dotsContainer = document.getElementById("carouselDots");

    if (mainImage) {
      mainImage.src = getImageUrl(this.productImages[index]);
    }

    // Update active dot
    if (dotsContainer) {
      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }
  }

  prevImage() {
    const newIndex =
      this.currentImageIndex === 0
        ? this.productImages.length - 1
        : this.currentImageIndex - 1;
    this.goToImage(newIndex);
  }

  nextImage() {
    const newIndex =
      this.currentImageIndex === this.productImages.length - 1
        ? 0
        : this.currentImageIndex + 1;
    this.goToImage(newIndex);
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        this.nextImage();
      } else {
        // Swipe right - prev image
        this.prevImage();
      }
    }
  }

  renderSizeDropdown() {
    const container = document.getElementById("sizeSelectContainer");
    if (!container) return;

    container.style.display = "block";
    container.innerHTML = `
      <label for="sizeSelect">Välj storlek *</label>
      <select id="sizeSelect" class="product-select" required>
        <option value="">-- Välj storlek --</option>
        <option value="A4">A4 (21 × 30 cm)</option>
        <option value="A3">A3 (30 × 42 cm)</option>
      </select>
    `;

    const select = document.getElementById("sizeSelect");
    select.addEventListener("change", (e) => {
      this.selectedSize = e.target.value;
      this.updateOrderButton();
    });
  }

  setupOrderButton() {
    const orderBtn = document.getElementById("orderBtn");
    if (!orderBtn) return;

    orderBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const variants = this.product?.variants || [];
      const variantSelect = document.getElementById("variantSelect");
      const sizeSelect = document.getElementById("sizeSelect");

      // Validate variant selection (only if variants exist)
      if (variants.length > 0 && !this.selectedVariant) {
        variantSelect?.classList.add("error");
        variantSelect?.focus();
        alert("Vänligen välj en variant innan du fortsätter.");
        return;
      }

      // Validate size selection
      if (!this.selectedSize) {
        sizeSelect?.classList.add("error");
        sizeSelect?.focus();
        alert("Vänligen välj en storlek innan du fortsätter.");
        return;
      }

      // Navigate to order page with prefilled data
      const params = new URLSearchParams({
        produkt: this.product.name,
        variant: this.selectedVariant || "",
        storlek: this.selectedSize,
        produktId: this.product.id,
      });

      window.location.href = `bestallning.html?${params.toString()}`;
    });
  }

  updateOrderButton() {
    const orderBtn = document.getElementById("orderBtn");
    const variantSelect = document.getElementById("variantSelect");
    const sizeSelect = document.getElementById("sizeSelect");

    // Remove error class when selection is made
    if (this.selectedVariant && variantSelect) {
      variantSelect.classList.remove("error");
    }
    if (this.selectedSize && sizeSelect) {
      sizeSelect.classList.remove("error");
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
