/**
 * Fine Line galleri - Main JavaScript
 * Core functionality for navigation, testimonials, and common features
 */

// =====================================================
// NAVIGATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  // Scroll handling for navbar
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Check on load

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
      document.body.style.overflow = navMenu.classList.contains("active")
        ? "hidden"
        : "";
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
});

// =====================================================
// TESTIMONIALS SLIDER
// =====================================================

class TestimonialsSlider {
  constructor(sliderId, dotsId) {
    this.slider = document.getElementById(sliderId);
    this.dotsContainer = document.getElementById(dotsId);

    if (!this.slider) return;

    this.testimonials = this.slider.querySelectorAll(".testimonial");
    this.currentIndex = 0;
    this.autoplayInterval = null;

    this.init();
  }

  init() {
    if (this.testimonials.length === 0) return;

    // Show first testimonial
    this.testimonials[0].classList.add("active");

    // Create dots
    this.createDots();

    // Start autoplay
    this.startAutoplay();

    // Pause on hover
    this.slider.addEventListener("mouseenter", () => this.stopAutoplay());
    this.slider.addEventListener("mouseleave", () => this.startAutoplay());
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.testimonials.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("testimonial-dot");
      if (index === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Visa omdöme ${index + 1}`);
      dot.addEventListener("click", () => this.goTo(index));
      this.dotsContainer.appendChild(dot);
    });
  }

  goTo(index) {
    this.testimonials[this.currentIndex].classList.remove("active");
    this.dotsContainer?.children[this.currentIndex]?.classList.remove("active");

    this.currentIndex = index;

    this.testimonials[this.currentIndex].classList.add("active");
    this.dotsContainer?.children[this.currentIndex]?.classList.add("active");
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.goTo(nextIndex);
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.next(), 5000);
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
  }
}

// Initialize testimonials slider
document.addEventListener("DOMContentLoaded", () => {
  new TestimonialsSlider("testimonialsSlider", "testimonialDots");
});

// =====================================================
// FEATURED WORKS (Home Page)
// =====================================================

async function loadFeaturedWorks() {
  const container = document.getElementById("featuredWorks");
  if (!container) return;

  try {
    const response = await fetch("data/inventory.json");
    const data = await response.json();

    // Get first 3 featured items or first 3 items
    const featured = data.items.filter((item) => item.featured).slice(0, 3);

    if (featured.length > 0) {
      container.parentElement.innerHTML = "";
      return;
    }

    container.innerHTML = featured
      .map((item) => createArtworkCard(item))
      .join("");
  } catch (error) {
    console.error("Error loading featured works:", error);
    // Show placeholder cards if data fails to load
    container.innerHTML = createPlaceholderCards(3);
  }
}

function createArtworkCard(item) {
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
                        <span class="artwork-category">${item.category}</span>
                        <span class="artwork-price">${formatPrice(item.price)}</span>
                    </div>
                    ${colorTags ? `<div class="color-tags">${colorTags}</div>` : ""}
                </div>
            </a>
        </article>
    `;
}

function createPlaceholderCards(count) {
  return Array(count)
    .fill(
      `
        <article class="artwork-card">
            <div class="artwork-image skeleton" style="aspect-ratio: 4/5;"></div>
            <div class="artwork-info">
                <div class="skeleton" style="height: 1.5rem; width: 70%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton" style="height: 1rem; width: 40%;"></div>
            </div>
        </article>
    `,
    )
    .join("");
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function formatPrice(price) {
  if (!price) return "Pris på förfrågan";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getImageUrl(image) {
  if (!image) return "";
  // If it's already a full path, return as-is
  if (image.includes("/") || image.includes("\\")) return image;
  // Otherwise, construct the path
  return `images/artworks/${image}.jpg`;
}

function getColorValue(colorName) {
  // If it's already a hex color, return it directly
  if (colorName?.startsWith("#")) {
    return colorName;
  }

  const colors = {
    // Swedish color names
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
    persika: "#ffcba4",
    beige: "#f5f5dc",
    grå: "#888888",
    // English fallbacks
    black: "#1a1a1a",
    white: "#ffffff",
    red: "#e07a5f",
    blue: "#3d5a80",
    green: "#81b29a",
    yellow: "#f4d35e",
    purple: "#8e6c88",
    pink: "#e8b4bc",
    gold: "#d4a574",
  };

  return colors[colorName?.toLowerCase()] || colorName || "#888888";
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// =====================================================
// NEWSLETTER FORM
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const newsletterForm = document.getElementById("newsletterForm");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = newsletterForm.querySelector('input[type="email"]').value;
      const button = newsletterForm.querySelector("button");
      const originalText = button.textContent;

      button.textContent = "Skickar...";
      button.disabled = true;

      // Simulate API call (replace with actual implementation)
      setTimeout(() => {
        button.textContent = "Tack!";
        newsletterForm.querySelector("input").value = "";

        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }, 1000);
    });
  }
});

// =====================================================
// COMMISSION FORM
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const commissionForm = document.getElementById("commissionForm");

  if (commissionForm) {
    commissionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(commissionForm);
      const button = commissionForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;

      button.textContent = "Skickar...";
      button.disabled = true;

      // Build email body
      const subject = encodeURIComponent(
        "Ny beställningsförfrågan - Fine Line galleri",
      );
      const body = encodeURIComponent(`
Ny förfrågan från hemsidan:

Namn: ${formData.get("firstName")} ${formData.get("lastName")}
E-post: ${formData.get("email")}
Telefon: ${formData.get("phone") || "Ej angivet"}

Typ av beställning: ${formData.get("projectType")}
Önskad storlek: ${formData.get("size") || "Ej valt"}

Beskrivning:
${formData.get("message")}
            `);

      // Open email client as fallback
      window.location.href = `mailto:hej@finelinegalleri.se?subject=${subject}&body=${body}`;

      setTimeout(() => {
        button.textContent = "Skickat!";

        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }, 500);
    });
  }
});

// =====================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// =====================================================
// LAZY LOADING IMAGES
// =====================================================

if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  });
}

// =====================================================
// INITIALIZE ON LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedWorks();
});
