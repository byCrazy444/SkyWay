/* ============================================================
   script.js — SkyWay Travel
   Содержит: мобильное меню, счётчик анимации, валидация формы,
   EmailJS отправка, динамическое содержимое, анимации при прокрутке
   ============================================================ */

/* ======= 1. МОБИЛЬНОЕ МЕНЮ ======= */
function mobileMenu() {
    /* Переключает класс «open» у навигации для показа/скрытия меню */
    var nav = document.querySelector("nav");
    var hamburger = document.getElementById("hamburger");
    if (!nav) return;
    nav.classList.toggle("open");
    if (hamburger) {
        hamburger.classList.toggle("fa-bars");
        hamburger.classList.toggle("fa-xmark");
    }
}

/* ======= 2. ЗАКРЫТИЕ МОБИЛЬНОГО МЕНЮ ПРИ КЛИКЕ НА ССЫЛКУ ======= */
document.addEventListener("DOMContentLoaded", function () {

    /* Закрываем меню при клике на ссылку навигации */
    var navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            var nav = document.querySelector("nav");
            var hamburger = document.getElementById("hamburger");
            if (nav && window.innerWidth <= 800) {
                nav.classList.remove("open");
                if (hamburger) {
                    hamburger.classList.add("fa-bars");
                    hamburger.classList.remove("fa-xmark");
                }
            }
        });
    });

    /* При изменении размера окна убираем мобильное меню */
    window.addEventListener("resize", function () {
        if (window.innerWidth > 800) {
            var nav = document.querySelector("nav");
            var hamburger = document.getElementById("hamburger");
            if (nav) nav.classList.remove("open");
            if (hamburger) {
                hamburger.classList.add("fa-bars");
                hamburger.classList.remove("fa-xmark");
            }
        }
    });

    /* ======= 3. АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ ======= */
    /* Используем IntersectionObserver для отслеживания видимых элементов */
    var animTargets = document.querySelectorAll(
        ".dest-card, .tour-item, .info-block, .stat-item, .feature-item"
    );

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        /* Добавляем класс visible — CSS запускает анимацию fadeInUp */
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        animTargets.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        /* Запасной вариант: просто показываем все элементы */
        animTargets.forEach(function (el) {
            el.classList.add("visible");
        });
    }

    /* ======= 4. АНИМИРОВАННЫЕ СЧЁТЧИКИ (JS-генерация динамического контента) ======= */
    /* Находим все элементы с атрибутом data-count и запускаем анимацию подсчёта */
    var counters = document.querySelectorAll("[data-count]");

    function animateCounter(el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var duration = 1800; /* миллисекунды */
        var step = Math.ceil(duration / target);
        var current = 0;

        var timer = setInterval(function () {
            current += Math.ceil(target / 60);
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            /* Динамически обновляем текстовый контент */
            el.textContent = current.toLocaleString("ru-RU") + "+";
        }, step);
    }

    if ("IntersectionObserver" in window) {
        var counterObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        counters.forEach(function (el) {
            counterObserver.observe(el);
        });
    }

    /* ======= 5. ВАЛИДАЦИЯ ФОРМЫ — ОТПРАВКА ЧЕРЕЗ FORMSUBMIT.CO =======
       FormSubmit получает данные и пересылает письмо на dimamelnic99@gmail.com.
       JS только проверяет поля перед отправкой; если всё ок — форма сабмитится нативно.
    */
    var contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {

            /* Получаем значения полей */
            var name  = document.getElementById("f-name").value.trim();
            var email = document.getElementById("f-email").value.trim();
            var phone = document.getElementById("f-phone").value.trim();
            var msg   = document.getElementById("f-msg").value.trim();
            var msgBox = document.getElementById("form-message");

            /* Проверка обязательных полей */
            var errors = [];
            if (!name)  errors.push("Введите ваше имя");
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                errors.push("Введите корректный email");
            if (!phone) errors.push("Введите телефон");
            if (!msg)   errors.push("Напишите ваш вопрос");

            if (errors.length > 0) {
                /* Есть ошибки — останавливаем отправку */
                e.preventDefault();
                msgBox.innerHTML =
                    "<b>Пожалуйста, исправьте ошибки:</b><ul><li>" +
                    errors.join("</li><li>") +
                    "</li></ul>";
                msgBox.className = "form-msg error";
                msgBox.style.display = "block";
                msgBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
                return;
            }

            /* Валидация прошла — показываем индикатор и даём форме отправиться */
            var submitBtn = document.getElementById("submit-btn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Отправка...';
            }
            /* Форма уходит на formsubmit.co → письмо на dimamelnic99@gmail.com */
        });
    }

    /* ======= 6. ИНТЕРАКТИВНЫЙ ФИЛЬТР КАРТОЧЕК НАПРАВЛЕНИЙ ======= */
    var filterBtns = document.querySelectorAll(".filter-btn");
    var destCards  = document.querySelectorAll(".dest-card");

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            /* Убираем активный класс у всех кнопок */
            filterBtns.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");

            var filter = btn.getAttribute("data-filter");

            destCards.forEach(function (card) {
                var tag = card.getAttribute("data-tag") || "";
                if (filter === "all" || tag === filter) {
                    /* Показываем карточку с анимацией */
                    card.style.display = "";
                    setTimeout(function () { card.classList.add("visible"); }, 50);
                } else {
                    /* Скрываем карточку */
                    card.classList.remove("visible");
                    setTimeout(function () { card.style.display = "none"; }, 300);
                }
            });
        });
    });

    /* ======= 7. ПЛАВНЫЙ SCROLLBACK НАВЕРХ ======= */
    var backTop = document.getElementById("back-top");
    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.style.opacity = window.scrollY > 400 ? "1" : "0";
            backTop.style.pointerEvents = window.scrollY > 400 ? "auto" : "none";
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ======= 8. ДИНАМИЧЕСКОЕ ОТОБРАЖЕНИЕ ТЕКУЩЕГО ГОДА В FOOTER ======= */
    var yearEl = document.getElementById("footer-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

}); /* конец DOMContentLoaded */
