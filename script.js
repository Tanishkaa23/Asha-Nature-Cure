document.addEventListener('DOMContentLoaded', () => {
    
    let lenisInstance = null;

    if (!window.location.pathname.includes('blog.html') && !window.location.pathname.includes('products.html')) {
        try {
            lenisInstance = new Lenis({
                duration: 1.3,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothTouch: true,
            });
            function raf(time) {
                if (lenisInstance) lenisInstance.raf(time); // Check if instance exists
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            // console.log("Lenis initialized for index.html.");
        } catch (e) {
            // console.error("Lenis initialization failed:", e);
        }
    }


    // --- GSAP Plugin Registration ---
    try {
        gsap.registerPlugin(ScrollTrigger);
        // console.log("GSAP ScrollTrigger registered.");
    } catch (e) {
        // console.error("GSAP ScrollTrigger registration failed:", e);
    }

    // --- Theme Toggle ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    function applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        // console.log("Initial theme applied:", savedTheme);
    }
    applyInitialTheme();

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
            console.log("Theme toggled to:", body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
        console.log("Theme toggle event listener attached.");
    }

    // --- Navbar Functionality ---
    const siteHeader = document.querySelector('.site-header');
    const navbarToggler = document.querySelector('.navbar__toggler');
    const navLinksContainer = document.querySelector('.navbar__links');
    const allNavLinksAndDropdownItems = navLinksContainer ? navLinksContainer.querySelectorAll('a.nav-link') : [];

    if (siteHeader) {
        window.addEventListener('scroll', () => {
            siteHeader.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    if (navbarToggler && navLinksContainer) {
        navbarToggler.addEventListener('click', () => {
            navbarToggler.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            if (!navLinksContainer.classList.contains('active')) {
                navLinksContainer.querySelectorAll('.dropdown.open').forEach(od => od.classList.remove('open'));
            }
        });

        const dropdownToggles = navLinksContainer.querySelectorAll('.dropdown > a.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault(); 
                    this.parentElement.classList.toggle('open');
                }
            });
        });
        
        allNavLinksAndDropdownItems.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const isDropdownToggle = this.classList.contains('dropdown-toggle');
                const isExternalPageLink = href && (href.endsWith('.html')); // Check if it's a link to another HTML page

                if (navLinksContainer.classList.contains('active')) { // If mobile menu is open
                    if (window.innerWidth <= 992 && isDropdownToggle) {
                        // Allow mobile dropdown toggle to function (handled by its own listener)
                    } else { // For any other link or if not a mobile dropdown toggle
                        navbarToggler.classList.remove('active');
                        navLinksContainer.classList.remove('active');
                        navLinksContainer.querySelectorAll('.dropdown.open').forEach(od => od.classList.remove('open'));
                    }
                }

                // Handle scrolling for on-page anchors
                if (href && href.startsWith('#') && href.length > 1) {
                    // Check if the target element exists on the current page
                    const targetElement = document.getElementById(href.substring(1));
                    if (targetElement) {
                        e.preventDefault(); 
                        const headerOffset = siteHeader ? siteHeader.offsetHeight + 20 : 100;
                        if (lenisInstance) { // Use Lenis if available (likely on index.html)
                            lenisInstance.scrollTo(href, { offset: -headerOffset }); 
                        } else { // Fallback smooth scroll for other pages or if Lenis fails
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                        }
                    } else if (!isExternalPageLink) {
                        // If anchor target not found on current page, and it's not a .html link,
                        // assume it's for index.html and navigate there with the hash.
                        window.location.href = 'index.html' + href;
                    }
                }
                // If it's an external page link (like blog.html, products.html), the default <a> behavior will navigate.
            });
        });
    }
    
    function updateActiveNavLinkOnScroll() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentHash = window.location.hash;

        allNavLinksAndDropdownItems.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            let linkTargetPage = linkHref.split('#')[0] || 'index.html';
            let linkTargetHash = linkHref.includes('#') ? '#' + linkHref.split('#')[1] : '';

            if (linkTargetPage === currentPage) {
                if (currentPage === 'index.html') { // On index.html, match hash
                    if (linkTargetHash === currentHash || (currentHash === '' && linkTargetHash === '#hero')) {
                        link.classList.add('active');
                    }
                } else { // On other pages, just match the page link itself
                    link.classList.add('active');
                }
            }
            // Activate parent dropdown toggle if a child is active
            if (link.classList.contains('active')) {
                 const parentDropdown = link.closest('.dropdown');
                 if (parentDropdown) {
                     const parentToggle = parentDropdown.querySelector('a.dropdown-toggle');
                     if (parentToggle) parentToggle.classList.add('active');
                 }
            }
        });
         // Default to Home active on index.html if no hash or specific section matches
        if (currentPage === 'index.html' && (currentHash === '' || currentHash === '#')) {
            const homeLink = navLinksContainer.querySelector('a.nav-link[href="#hero"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveNavLinkOnScroll);
    window.addEventListener('hashchange', updateActiveNavLinkOnScroll); // Update on hash change too
    updateActiveNavLinkOnScroll(); // Call once on load


    // --- Footer Year ---
    const currentYearSpan = document.getElementById('currentYear') || 
                            document.getElementById('currentYearBlog') || 
                            document.getElementById('currentYearProducts');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Product Enquiry Modal ---
    const modal = document.getElementById("productEnquiryModal");
    // Query for buttons on current page only
    const enquireBtns = document.querySelectorAll(".product-enquire-btn, .product-enquire-btn-page"); 
    const modalCloseBtn = modal ? modal.querySelector(".modal-close-btn") : null;

    enquireBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if(modal) modal.classList.add("show");
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            if(modal) modal.classList.remove("show");
        });
    }

    if (modal) {
        modal.addEventListener("click", (event) => { 
            if (event.target === modal) {
                modal.classList.remove("show");
            }
        });
    }


    // --- GSAP Animations ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const heroTitleSpans = heroTitle.querySelectorAll('span');
        heroTitleSpans.forEach((span, i) => {
            if (span.children.length === 0 && span.textContent.trim() !== '') {
                const innerSpan = document.createElement('span');
                innerSpan.textContent = span.textContent;
                span.textContent = '';
                span.appendChild(innerSpan);
                gsap.from(innerSpan, { yPercent: 100, autoAlpha: 0, duration: 0.9, delay: 0.4 + i * 0.15, ease: "expo.out" });
            } else if (span.children.length === 1 && span.children[0].tagName === 'SPAN') {
                gsap.from(span.children[0], { yPercent: 100, autoAlpha: 0, duration: 0.9, delay: 0.4 + i * 0.15, ease: "expo.out" });
            }
        });
    }
    gsap.from(".hero-subtitle.animate-p", { y: 20, autoAlpha: 0, duration: 1, delay: 1.0, ease: "expo.out" });
    gsap.from(".hero-section .btn.animate-btn", { y: 20, autoAlpha: 0, duration: 1, delay: 1.2, ease: "expo.out" });

    const shapes = gsap.utils.toArray(".hero-background-shapes .shape");
    shapes.forEach(shape => {
        gsap.to(shape, {
            x: () => gsap.utils.random(-100, 100, 1) + "px", y: () => gsap.utils.random(-150, 150, 1) + "px",
            scale: () => gsap.utils.random(0.8, 1.5, 0.1), rotation: () => gsap.utils.random(-45, 45, 1),
            duration: gsap.utils.random(15, 25, 1), repeat: -1, yoyo: true, ease: "sine.inOut",
            delay: () => gsap.utils.random(0, 2, 0.1)
        });
    });

    // GSAP animations should be applied based on elements present on the current page.
    // Use specific selectors if animations are page-specific.
    const animatedElements = gsap.utils.toArray('.animate-title, .card-animated, .animate-service-item, p.animate-p:not(.hero-subtitle), a.animate-btn:not(.hero-section .btn)');
    animatedElements.forEach(el => {
        gsap.from(el, {
            y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
            delay: parseFloat(el.dataset.delay) || 0
        });
    });

    // console.log("All scripts initialized for V7.");
});