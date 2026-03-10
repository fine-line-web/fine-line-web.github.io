/**
 * Fine Line galleri - Google Analytics 4 Event Tracking
 *
 *
 * Events sent to GA4:
 *  - page_view          (automatic via gtag 'config' — no code needed)
 *  - view_item          (user lands on a product detail page)
 *  - select_item        (user clicks an artwork card in the gallery)
 *  - initiate_order     (user clicks the "Beställ" button on a product page)
 *  - generate_lead      (contact form submitted successfully)
 *  - purchase           (order form submitted successfully / tack.html loads)
 *  - gallery_filter     (user uses a category filter in the gallery)
 *  - newsletter_signup  (newsletter form submitted)
 */

// ---------------------------------------------------------------------------
// Safe gtag wrapper — silently does nothing if GA has not loaded yet or is
// blocked by an ad-blocker. All tracking calls go through this to ensure
// no errors bleed into the rest of the application.
// ---------------------------------------------------------------------------
function gaEvent(eventName, params) {
  try {
    if (typeof gtag !== "function") return;
    gtag("event", eventName, params);
  } catch (_) {
    // Never allow analytics errors to surface to the user
  }
}

// ---------------------------------------------------------------------------
// view_item
// Called from product.js after a product has finished rendering.
// ---------------------------------------------------------------------------
function gaViewItem(product) {
  if (!product) return;
  const price = Array.isArray(product.price) ? product.price[0] : product.price;
  gaEvent("view_item", {
    currency: "SEK",
    value: price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        price: price || 0,
        quantity: 1,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// select_item
// Called from gallery.js when the user clicks on an artwork card.
// ---------------------------------------------------------------------------
function gaSelectItem(item) {
  if (!item) return;
  const price = Array.isArray(item.price) ? item.price[0] : item.price;
  gaEvent("select_item", {
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || "",
        price: price || 0,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// initiate_order
// Called from product.js when the order button is clicked and validation passes.
// ---------------------------------------------------------------------------
function gaInitiateOrder(product, variant, size) {
  if (!product) return;
  const price = Array.isArray(product.price) ? product.price[0] : product.price;
  gaEvent("initiate_order", {
    currency: "SEK",
    value: price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        item_variant: variant || "",
        item_size: size || "",
        price: price || 0,
        quantity: 1,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// generate_lead
// Called when a contact form is submitted successfully.
// ---------------------------------------------------------------------------
function gaGenerateLead(formType) {
  gaEvent("generate_lead", {
    form_type: formType || "contact",
  });
}

// ---------------------------------------------------------------------------
// purchase (order completed)
// Called when the order form on bestallning.html is submitted, or when
// tack.html loads (depending on your submission flow).
// ---------------------------------------------------------------------------
function gaPurchase(params) {
  gaEvent("purchase", {
    transaction_id: params.transaction_id || `order_${Date.now()}`,
    currency: "SEK",
    value: params.value || 0,
    items: params.items || [],
  });
}

// ---------------------------------------------------------------------------
// gallery_filter
// Called from gallery.js when the user selects a category filter.
// ---------------------------------------------------------------------------
function gaGalleryFilter(category) {
  gaEvent("gallery_filter", {
    filter_category: category || "alla",
  });
}

// ---------------------------------------------------------------------------
// newsletter_signup
// Called from main.js when the newsletter form is submitted.
// ---------------------------------------------------------------------------
function gaNewsletterSignup() {
  gaEvent("newsletter_signup", {});
}
