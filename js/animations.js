/**
 * Animations Module
 * Handles scroll animations, navbar effects, and other UI animations
 */

const Animations = (function() {
    'use strict';

    // DOM Elements
    let $navbar;
    let $animatedElements;

    /**
     * Initialize DOM element references
     */
    function cacheElements() {
        $navbar = $('#mainNavbar');
        $animatedElements = $('.animate-on-scroll');
    }

    /**
     * Handle navbar scroll effect
     * Changes navbar style when user scrolls down
     */
    function handleNavbarScroll() {
        $(window).on('scroll', function() {
            const scrollTop = $(this).scrollTop();
            
            if (scrollTop > CONFIG.ANIMATION.NAVBAR_SCROLL_THRESHOLD) {
                $navbar.addClass('scrolled');
            } else {
                $navbar.removeClass('scrolled');
            }
        });
    }

    /**
     * Handle scroll-triggered animations
     * Adds 'animated' class when elements come into view
     */
    function handleScrollAnimations() {
        function checkVisibility() {
            const windowHeight = $(window).height();
            const scrollTop = $(window).scrollTop();

            $animatedElements.each(function() {
                const $element = $(this);
                const elementTop = $element.offset().top;
                const elementVisible = CONFIG.ANIMATION.SCROLL_OFFSET;

                if (scrollTop + windowHeight - elementVisible > elementTop) {
                    $element.addClass('animated');
                }
            });
        }

        // Check on scroll
        $(window).on('scroll', checkVisibility);
        
        // Initial check
        checkVisibility();
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScroll() {
        $('a[href^="#"]').on('click', function(e) {
            const target = $(this.getAttribute('href'));
            
            if (target.length) {
                e.preventDefault();
                
                const navbarHeight = $navbar.outerHeight();
                const targetOffset = target.offset().top - navbarHeight;

                $('html, body').animate({
                    scrollTop: targetOffset
                }, 800, 'swing');

                // Close mobile menu if open
                const $navbarCollapse = $('.navbar-collapse');
                if ($navbarCollapse.hasClass('show')) {
                    $navbarCollapse.collapse('hide');
                }
            }
        });
    }

    /**
     * Initialize Owl Carousel for testimonials
     */
    function initTestimonialCarousel() {
        const $carousel = $('.testimonial-carousel');
        
        if ($carousel.length && typeof $.fn.owlCarousel !== 'undefined') {
            $carousel.owlCarousel(CONFIG.CAROUSEL.TESTIMONIALS);
        }
    }

    /**
     * Add active class to nav links based on scroll position
     */
    function handleActiveNavLink() {
        $(window).on('scroll', function() {
            const scrollPos = $(document).scrollTop() + $navbar.outerHeight() + 10;
            
            $('section[id]').each(function() {
                const $section = $(this);
                const sectionTop = $section.offset().top;
                const sectionBottom = sectionTop + $section.outerHeight();
                const sectionId = $section.attr('id');

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    $('.nav-link').removeClass('active');
                    $(`.nav-link[href="#${sectionId}"]`).addClass('active');
                }
            });
        });
    }

    /**
     * Initialize parallax-like effect on hero section
     */
    function initHeroParallax() {
        $(window).on('scroll', function() {
            const scrolled = $(this).scrollTop();
            const $heroImage = $('.hero-image');
            
            if (scrolled < 600) {
                $heroImage.css('transform', `translateY(${scrolled * 0.15}px)`);
            }
        });
    }

    /**
     * Initialize all animations
     */
    function init() {
        cacheElements();
        handleNavbarScroll();
        handleScrollAnimations();
        initSmoothScroll();
        initTestimonialCarousel();
        handleActiveNavLink();
        initHeroParallax();
    }

    // Public API
    return {
        init: init
    };
})();
