/**
 * VOPA × NAST 互動式網頁簡報
 * 滑動控制、鍵盤導航、動畫效果
 */

(function() {
    'use strict';

    // 狀態管理
    const state = {
        currentSlide: 0,
        totalSlides: 12,
        isAnimating: false,
        touchStartY: 0,
        touchEndY: 0
    };

    // DOM 元素
    const elements = {
        slides: document.querySelectorAll('.slide'),
        slidesContainer: document.getElementById('slidesContainer'),
        progressBar: document.getElementById('progressBar'),
        currentPage: document.getElementById('currentPage'),
        pageIndicators: document.getElementById('pageIndicators'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        swipeHint: document.getElementById('swipeHint')
    };

    /**
     * 初始化
     */
    function init() {
        createPageIndicators();
        updateUI();
        bindEvents();
        animateCurrentSlide();
        
        // 3秒後隱藏滑動提示
        setTimeout(() => {
            if (elements.swipeHint) {
                elements.swipeHint.style.opacity = '0';
                elements.swipeHint.style.transition = 'opacity 0.5s';
            }
        }, 3000);
    }

    /**
     * 建立頁碼指示器
     */
    function createPageIndicators() {
        if (!elements.pageIndicators) return;
        
        elements.pageIndicators.innerHTML = '';
        for (let i = 0; i < state.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'page-indicator' + (i === 0 ? ' active' : '');
            indicator.addEventListener('click', () => goToSlide(i));
            elements.pageIndicators.appendChild(indicator);
        }
    }

    /**
     * 前往指定投影片
     */
    function goToSlide(index) {
        if (state.isAnimating || index === state.currentSlide) return;
        if (index < 0 || index >= state.totalSlides) return;

        state.isAnimating = true;
        
        const direction = index > state.currentSlide ? 'next' : 'prev';
        const currentSlide = elements.slides[state.currentSlide];
        const nextSlide = elements.slides[index];

        // 更新幻燈片狀態
        currentSlide.classList.remove('active');
        currentSlide.classList.add(direction === 'next' ? 'prev' : '');
        
        nextSlide.classList.remove('prev');
        nextSlide.classList.add('active');

        // 更新狀態
        state.currentSlide = index;
        updateUI();
        animateCurrentSlide();

        // 動畫完成後解除鎖定
        setTimeout(() => {
            state.isAnimating = false;
            currentSlide.classList.remove('prev');
        }, 600);
    }

    /**
     * 下一張
     */
    function nextSlide() {
        if (state.currentSlide < state.totalSlides - 1) {
            goToSlide(state.currentSlide + 1);
        }
    }

    /**
     * 上一張
     */
    function prevSlide() {
        if (state.currentSlide > 0) {
            goToSlide(state.currentSlide - 1);
        }
    }

    /**
     * 更新 UI 元素
     */
    function updateUI() {
        // 更新進度條
        if (elements.progressBar) {
            const progress = ((state.currentSlide + 1) / state.totalSlides) * 100;
            elements.progressBar.style.width = progress + '%';
        }

        // 更新頁碼
        if (elements.currentPage) {
            elements.currentPage.textContent = state.currentSlide + 1;
        }

        // 更新指示器
        const indicators = document.querySelectorAll('.page-indicator');
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === state.currentSlide);
        });

        // 更新按鈕狀態
        if (elements.prevBtn) {
            elements.prevBtn.style.opacity = state.currentSlide === 0 ? '0.3' : '1';
            elements.prevBtn.style.pointerEvents = state.currentSlide === 0 ? 'none' : 'auto';
        }
        if (elements.nextBtn) {
            elements.nextBtn.style.opacity = state.currentSlide === state.totalSlides - 1 ? '0.3' : '1';
            elements.nextBtn.style.pointerEvents = state.currentSlide === state.totalSlides - 1 ? 'none' : 'auto';
        }
    }

    /**
     * 數字滾動動畫
     */
    function animateNumber(element, start, end, duration, prefix, suffix) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用 easeOutQuart 緩動函數
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeProgress);
            
            // 格式化數字顯示
            let displayValue;
            if (end >= 1000000) {
                displayValue = (current / 10000).toFixed(0);
            } else if (end >= 1000) {
                displayValue = current.toLocaleString();
            } else {
                displayValue = current.toString();
            }
            
            element.textContent = prefix + displayValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    /**
     * 當前幻燈片動畫
     */
    function animateCurrentSlide() {
        const currentSlide = elements.slides[state.currentSlide];
        if (!currentSlide) return;

        // 卡片依序進入動畫
        const cards = currentSlide.querySelectorAll('.stat-card, .solution-box, .scenario-card, .advantage-card, .revenue-card, .team-member, .cta-card, .market-card, .timeline-phase');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + index * 100);
        });

        // 數字動畫 - 滾動計數效果
        const numbers = currentSlide.querySelectorAll('.stat-number, .market-size');
        numbers.forEach((num, index) => {
            const target = parseInt(num.getAttribute('data-target')) || 0;
            const suffix = num.getAttribute('data-suffix') || '';
            const prefix = num.getAttribute('data-prefix') || '';
            const duration = 2000; // 動畫持續時間 (ms)
            const startDelay = 500 + index * 200; // 開始延遲
            
            if (target > 0) {
                num.style.opacity = '0';
                
                setTimeout(() => {
                    num.style.transition = 'opacity 0.3s';
                    num.style.opacity = '1';
                    animateNumber(num, 0, target, duration, prefix, suffix);
                }, startDelay);
            } else {
                num.style.opacity = '0';
                setTimeout(() => {
                    num.style.transition = 'opacity 0.5s';
                    num.style.opacity = '1';
                }, 300);
            }
        });
    }

    /**
     * 綁定事件
     */
    function bindEvents() {
        // 按鈕點擊
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', prevSlide);
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', nextSlide);
        }

        // 鍵盤導航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSlide(state.totalSlides - 1);
            }
        });

        // 觸控滑動 (手機)
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }

        // 滑鼠滾輪
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            if (wheelTimeout) return;
            
            wheelTimeout = setTimeout(() => {
                wheelTimeout = null;
            }, 500);

            if (e.deltaY > 0) {
                nextSlide();
            } else if (e.deltaY < 0) {
                prevSlide();
            }
        }, { passive: true });
    }

    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
