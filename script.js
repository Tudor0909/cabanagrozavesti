/**
 * Pensiunea La Constanța - Core JavaScript
 * Senior Dev Refactored: Modular Architecture, rAF for Scroll, Config Constants
 */

const CONFIG = {
    PARALLAX_SPEED: 0.4,
    NAVBAR_SCROLL_THRESHOLD: 50,
    LOADER_DELAY: 500,
    LOADER_FADE_DUR: 800,
    LIGHTBOX_FADE_DUR: 300,
    STATUS_MSG_DURATION: 8000,
    REVEAL_THRESHOLD: 0.15,
    REVEAL_MARGIN: "0px 0px -50px 0px"
};

class LaConstantaApp {
    constructor() {
        this.initTouchDetection();
        this.initLoader();
        this.initMobileMenu();
        this.initScrollEffects();
        this.initLightbox();
        this.initFormValidation();
    }

    // 0. Disable Hover on Touch Devices (Fixes iOS/Android sticky buttons)
    initTouchDetection() {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.documentElement.classList.add('is-touch-device');
        }
    }

    // 1. Loader Removal
    initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, CONFIG.LOADER_FADE_DUR);
        }, CONFIG.LOADER_DELAY);
    }

    // 2. Mobile Menu Toggle
    initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navRight = document.querySelector('.nav-right');
        const navLinks = document.querySelectorAll('.nav-links a, .nav-social a');

        if (!hamburger || !navRight) return;

        const toggleMenu = (forceClose = false) => {
            const isActive = forceClose ? false : !navRight.classList.contains('active');
            navRight.classList.toggle('active', isActive);

            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isActive);
                icon.classList.toggle('fa-times', isActive);
            }
        };

        hamburger.addEventListener('click', () => toggleMenu());

        navLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        document.addEventListener('click', (e) => {
            if (navRight.classList.contains('active') &&
                !navRight.contains(e.target) &&
                !hamburger.contains(e.target)) {
                toggleMenu(true);
            }
        });
    }

    // 3. Scroll Effects (Navbar & Parallax via requestAnimationFrame)
    initScrollEffects() {
        const navbar = document.getElementById('navbar');
        const heroBg = document.querySelector('.hero-bg');
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');

        // Scroll Reveal Array
        const revealOptions = {
            threshold: CONFIG.REVEAL_THRESHOLD,
            rootMargin: CONFIG.REVEAL_MARGIN
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        revealElements.forEach(el => revealObserver.observe(el));

        // High-performance scroll loop
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll(navbar, heroBg);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    handleScroll(navbar, heroBg) {
        const scrollY = window.scrollY;

        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > CONFIG.NAVBAR_SCROLL_THRESHOLD);
        }

        if (heroBg && scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollY * CONFIG.PARALLAX_SPEED}px)`;
        }
    }

    // 4. Lightbox Functionality
    initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.close-lightbox');

        if (!lightbox || !lightboxImg || !closeBtn) return;

        window.openLightbox = (el) => {
            lightbox.style.display = 'flex';
            setTimeout(() => {
                lightboxImg.src = el.src;
                lightbox.style.opacity = '1';
            }, 10);
            document.body.style.overflow = 'hidden';
        };

        const closeBox = () => {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                lightbox.style.display = 'none';
                document.body.style.overflow = '';
            }, CONFIG.LIGHTBOX_FADE_DUR);
        };

        closeBtn.addEventListener('click', closeBox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeBox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && lightbox.style.display === 'flex') {
                closeBox();
            }
        });
    }

    // 5. Booking Form Logic (Dates, Async Submit)
    initFormValidation() {
        const checkinInput = document.querySelector('input[name="checkin"]');
        const checkoutInput = document.querySelector('input[name="checkout"]');
        const bookingForm = document.getElementById('booking-form');

        // Date Constraints
        if (checkinInput && checkoutInput) {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            const maxDate = new Date(today.setFullYear(today.getFullYear() + 1));
            const maxStr = maxDate.toISOString().split('T')[0];

            checkinInput.min = todayStr;
            checkinInput.max = maxStr;
            checkoutInput.max = maxStr;

            checkinInput.addEventListener('change', (e) => {
                if (!e.target.value) return;

                const checkinDate = new Date(e.target.value);
                const nextDay = new Date(checkinDate);
                nextDay.setDate(checkinDate.getDate() + 1);

                const nextDayStr = nextDay.toISOString().split('T')[0];
                checkoutInput.min = nextDayStr;

                if (checkoutInput.value && checkoutInput.value < nextDayStr) {
                    checkoutInput.blur();
                    checkoutInput.value = '';
                }
            });
        }

        // Phone Validation Helper
        const validatePhone = (phone) => {
            // Evaluates strictly to Romanian landline/mobile formats starting with +40 or 0
            const phoneRegex = /^(?:\+40|0)[0-9\s\-]{8,12}$/;
            return phoneRegex.test(phone.trim());
        };

        // Form Submit
        if (bookingForm) {
            const formStatus = document.getElementById('form-status');

            const showStatus = (msg, isError = false) => {
                if (!formStatus) return;
                formStatus.innerHTML = msg;
                formStatus.style.display = "block";

                if (isError) {
                    formStatus.style.backgroundColor = "#fff3cd";
                    formStatus.style.color = "#856404";
                    formStatus.style.border = "1px solid #ffeeba";
                } else {
                    formStatus.style.backgroundColor = "#d4edda";
                    formStatus.style.color = "#155724";
                    formStatus.style.border = "1px solid #c3e6cb";
                }

                setTimeout(() => { formStatus.style.display = 'none'; }, CONFIG.STATUS_MSG_DURATION);
            };

            bookingForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const phoneVal = document.getElementById('telefon').value;
                const ciVal = document.getElementById('checkin').value;
                const coVal = document.getElementById('checkout').value;

                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const guestsVal = document.getElementById('oaspeti') ? parseInt(document.getElementById('oaspeti').value) : 0;

                if (!validatePhone(phoneVal)) {
                    showStatus("Vă rugăm să introduceți un număr de telefon valid.", true);
                    return;
                }

                if (ciVal >= coVal) {
                    showStatus("Data plecării trebuie să fie după data sosirii.", true);
                    return;
                }

                if (guestsVal > 14) {
                    showStatus("Ne pare rău, capacitatea maximă admisă este de 14 persoane.", true);
                    return;
                }

                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Trimitere...';
                submitBtn.disabled = true;

                try {
                    const data = new FormData(event.target);
                    const response = await fetch(event.target.action, {
                        method: bookingForm.method,
                        body: data,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        showStatus("Solicitarea a fost trimisă cu succes. Vă vom contacta curând!", false);
                        bookingForm.reset();
                    } else {
                        showStatus("A apărut o problemă. Vă rugăm să încercați din nou.", true);
                    }
                } catch (error) {
                    showStatus("A apărut o eroare de rețea. Vă rugăm să ne contactați telefonic.", true);
                } finally {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
    new LaConstantaApp();
});