// --- Site Loader Logic ---
window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');
    const loaderBar = document.querySelector('.loader-bar');
    const body = document.body;

    // Minimum display time for brand awareness (1.2s)
    setTimeout(() => {
        if (loaderBar) loaderBar.style.width = '100%';
        
        setTimeout(() => {
            if (loader) loader.classList.add('loader-hidden');
            body.classList.remove('loading');
            
            // Re-trigger scroll animations for visible items
            window.dispatchEvent(new Event('scroll'));
        }, 600);
    }, 1200);
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loading');

    // 1. Scroll Effects
    const navbar = document.querySelector('.navbar');
    const animatedElements = document.querySelectorAll('.hidden-animate');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
    });

    animatedElements.forEach((el) => observer.observe(el));

    // 2. Dynamic Cursor Glow
    const bgGlow = document.createElement('div');
    bgGlow.style.position = 'fixed';
    bgGlow.style.top = '0';
    bgGlow.style.left = '0';
    bgGlow.style.width = '400px';
    bgGlow.style.height = '400px';
    bgGlow.style.background = 'radial-gradient(circle, rgba(124, 58, 237, 0.03) 0%, transparent 60%)';
    bgGlow.style.pointerEvents = 'none';
    bgGlow.style.transform = 'translate(-50%, -50%)';
    bgGlow.style.transition = 'transform 0.1s ease-out';
    bgGlow.style.zIndex = '9999';
    document.body.appendChild(bgGlow);

    window.addEventListener('mousemove', (e) => {
        bgGlow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    });

    // 3. Central Gallery Logic (Tabs, Sorting, Mobile Show More)
    const workTabBtns = document.querySelectorAll('.work-tabs .tab-btn');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const sortingFilter = document.getElementById('gallery-sorting-filter');
    const showMoreContainer = document.getElementById('show-more-container');
    const showMoreBtn = document.getElementById('show-more-btn');
    
    let limitMobileItems = true;
    const mql = window.matchMedia('(max-width: 600px)');

    function renderGallery() {
        const activeTab = document.querySelector('.work-tabs .tab-btn.active') || workTabBtns[0];
        const currentMode = activeTab ? activeTab.getAttribute('data-filter') : 'design';
        const activeSort = document.querySelector('.sort-btn.active');
        const sortValue = activeSort ? activeSort.getAttribute('data-sort') : 'all';
        const isMobile = window.innerWidth <= 600;

        let visibleCount = 0;
        
        projectCards.forEach(item => {
            let matchesCategory = false;
            
            if (item.getAttribute('data-category') === currentMode) {
                if (currentMode === 'design') {
                    matchesCategory = (sortValue === 'all' || item.getAttribute('data-category-sort') === sortValue);
                } else {
                    matchesCategory = true;
                }
            }
            
            if (matchesCategory) {
                if (isMobile && limitMobileItems && visibleCount >= 4) {
                    item.classList.add('hidden-grid-item');
                } else {
                    item.classList.remove('hidden-grid-item');
                    item.style.animation = 'none';
                    item.offsetHeight; 
                    item.style.animation = 'fadeInUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards';
                }
                visibleCount++;
            } else {
                item.classList.add('hidden-grid-item');
            }
        });

        if (isMobile && limitMobileItems && visibleCount > 4) {
            if (showMoreContainer) {
                 showMoreContainer.style.display = 'block';
                 showMoreContainer.style.breakBefore = 'column'; 
            }
        } else {
            if (showMoreContainer) showMoreContainer.style.display = 'none';
        }
    }

    workTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            workTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            if (filter !== 'design') {
                sortingFilter.style.display = 'none';
            } else {
                sortingFilter.style.display = 'flex';
                const allSortBtn = document.querySelector('[data-sort="all"]');
                if (allSortBtn) {
                    sortBtns.forEach(b => b.classList.remove('active'));
                    allSortBtn.classList.add('active');
                }
            }

            // Lazy-load videos/iframes: inject src from data-src only when the tab is first activated
            if (filter === 'video' || filter === 'ai') {
                document.querySelectorAll(`.project-card[data-category="${filter}"] iframe[data-src], .project-card[data-category="${filter}"] video[data-src]`).forEach(media => {
                    if (!media.src || media.src === window.location.href) {
                        media.src = media.getAttribute('data-src');
                        media.removeAttribute('data-src');
                    }
                });
            }
            
            limitMobileItems = true;
            renderGallery();
        });
    });


    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            limitMobileItems = true;
            renderGallery();
        });
    });

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            limitMobileItems = false;
            renderGallery();
        });
    }

    mql.addEventListener('change', () => {
        renderGallery();
    });

    // 4. Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const triggers = document.querySelectorAll('.lightbox-trigger');

    if (lightbox) {
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const imgSrc = trigger.getAttribute('data-img');
                if (imgSrc) {
                    lightboxImg.src = imgSrc;
                    lightbox.classList.add('active');
                }
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('active');
            }
        });
    }

    // 5. Contact Modal Logic
    const contactModal = document.getElementById('contact-modal');
    const modalClose = document.querySelector('.modal-close');
    const quoteForm = document.getElementById('quote-form');

    if (contactModal) {
        modalClose.addEventListener('click', () => {
            contactModal.classList.remove('active');
        });

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });

    }

    // 6. Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbarElement = document.querySelector('.navbar');

    if (mobileMenuBtn && navbarElement) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navbarElement.classList.toggle('mobile-active');
            if (navbarElement.classList.contains('mobile-active')) {
                mobileMenuBtn.innerHTML = '✕';
            } else {
                mobileMenuBtn.innerHTML = '☰';
            }
        });

        // Close menu when clicking a link
        navbarElement.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                navbarElement.classList.remove('mobile-active');
                mobileMenuBtn.innerHTML = '☰';
            });
        });

        // Close menu when clicking outside navbar
        document.addEventListener('click', (e) => {
            if (!navbarElement.contains(e.target) && navbarElement.classList.contains('mobile-active')) {
                navbarElement.classList.remove('mobile-active');
                mobileMenuBtn.innerHTML = '☰';
            }
        });
    }

    // Initial Gallery Render
    renderGallery();
});
