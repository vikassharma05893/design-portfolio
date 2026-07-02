/* =====================================================
   PORTFOLIO INTERACTIONS
   - Accordion toggles (top-level + categories)
   - Show All / Show Less for thumbnail grids
   - Auto-detect aspect ratio of each thumbnail image
   - Lightbox for images, carousels, and videos
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Top-level block toggles ----
  document.querySelectorAll('.block-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var block = header.closest('.work-block');
      var body = block.querySelector('.block-body');
      var toggle = header.querySelector('.block-toggle');
      var isOpen = block.dataset.open === 'true';

      block.dataset.open = !isOpen;
      header.setAttribute('aria-expanded', !isOpen);
      toggle.textContent = isOpen ? '+' : '−';
      body.style.display = isOpen ? 'none' : 'block';
    });
  });

  // ---- Category toggles ----
  document.querySelectorAll('.category-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var category = header.closest('.category');
      var body = category.querySelector('.category-body');
      var icon = header.querySelector('.category-icon');
      var isOpen = category.dataset.open === 'true';

      category.dataset.open = !isOpen;
      header.setAttribute('aria-expanded', !isOpen);
      icon.textContent = isOpen ? '+' : '−';

      if (isOpen) {
        body.setAttribute('hidden', '');
      } else {
        body.removeAttribute('hidden');
      }
    });
  });

  // ---- Show All / Show Less ----
  document.querySelectorAll('.btn-show-all').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var grid = btn.closest('.category-body').querySelector('.thumb-grid');
      var isExpanded = grid.classList.toggle('show-all');
      btn.textContent = isExpanded ? 'Show Less' : 'Show All';
      // Re-detect ratios for newly visible thumbs
      setTimeout(detectAspectRatios, 50);
    });
  });

  // =====================================================
  // AUTO-DETECT ASPECT RATIOS
  // Reads the actual image dimensions and sets thumb width
  // based on the fixed row height (defined in CSS).
  // =====================================================
  function detectAspectRatios() {
    var rowHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--thumb-height')) || 280;

    document.querySelectorAll('.thumb').forEach(function (thumb) {
      if (thumb.dataset.ratioSet === 'true') return;

      var imgDiv = thumb.querySelector('.thumb-image');
      var bgImg = imgDiv.style.backgroundImage;
      var match = bgImg.match(/url\(["']?(.+?)["']?\)/);
      if (!match) return;

      var src = match[1];
      var img = new Image();
      img.onload = function () {
        var ratio = img.naturalWidth / img.naturalHeight;
        var calculatedWidth = Math.round(rowHeight * ratio);
        thumb.style.width = calculatedWidth + 'px';
        thumb.style.flexBasis = calculatedWidth + 'px';
        thumb.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
        thumb.dataset.ratioSet = 'true';
      };
      img.onerror = function () {
        // Fallback to square if image fails
        thumb.style.width = rowHeight + 'px';
        thumb.style.flexBasis = rowHeight + 'px';
        thumb.style.aspectRatio = '1 / 1';
        console.warn('Image failed to load:', src);
      };
      img.src = src;
    });
  }

  detectAspectRatios();

  // =====================================================
  // LIGHTBOX
  // =====================================================
  var lightbox = document.getElementById('lightbox');
  var lbContent = document.getElementById('lightboxContent');
  var lbTitle = document.getElementById('lightboxTitle');
  var lbCounter = document.getElementById('lightboxCounter');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  var lbClose = document.getElementById('lightboxClose');

  var currentSlides = [];
  var currentIndex = 0;
  var currentType = 'image';

  document.querySelectorAll('.thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var type = thumb.dataset.type;
      var title = thumb.dataset.title || '';

      if (type === 'pdf') {
        // PDFs open in a new browser tab — better mobile experience than lightbox
        window.open(thumb.dataset.src, '_blank');
        return;
      }

      if (type === 'carousel') {
        var folder = thumb.dataset.folder;
        var count = parseInt(thumb.dataset.slides, 10);
        var bgImg = thumb.querySelector('.thumb-image').style.backgroundImage;
        var match = bgImg.match(/url\(["']?(.+?)\/01\.jpg["']?\)/);
        var basePath = match ? match[1] : folder;

        currentSlides = [];
        for (var i = 1; i <= count; i++) {
          var num = i < 10 ? '0' + i : String(i);
          currentSlides.push(basePath + '/' + num + '.jpg');
        }
        currentIndex = 0;
        currentType = 'carousel';
        openLightbox(title);
      }
      else if (type === 'image') {
        currentSlides = [thumb.dataset.src];
        currentIndex = 0;
        currentType = 'image';
        openLightbox(title);
      }
      else if (type === 'video') {
  currentSlides = [thumb.dataset.youtubeId];
  currentIndex = 0;
  currentType = 'video';
  openLightbox(title);
}
else if (type === 'external') {
  var url = thumb.dataset.link;

  if (url) {
    window.open(url, '_blank');
  } else {
    console.warn('Missing external URL');
  }
}
    });
  });

  function openLightbox(title) {
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    lbTitle.textContent = title;
    if (currentSlides.length <= 1) {
      lightbox.classList.add('single-item');
    } else {
      lightbox.classList.remove('single-item');
    }
    renderSlide();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lbContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  function renderSlide() {
    lbContent.innerHTML = '';
    var src = currentSlides[currentIndex];

    if (currentType === 'video') {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + src + '?autoplay=1&rel=0&modestbranding=1';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      lbContent.appendChild(iframe);
    } else {
      var img = document.createElement('img');
      img.src = src;
      img.alt = lbTitle.textContent;
      lbContent.appendChild(img);
    }

    lbCounter.textContent = (currentIndex + 1) + ' / ' + currentSlides.length;
  }

  function prev() {
    if (currentSlides.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentSlides.length) % currentSlides.length;
    renderSlide();
  }
  function next() {
    if (currentSlides.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentSlides.length;
    renderSlide();
  }

  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lbClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

});