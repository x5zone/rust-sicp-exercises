(function() {
    'use strict';

    var giscusConfig = {
        'src': 'https://giscus.app/client.js',
        'data-repo': 'x5zone/rust-sicp-exercises',
        'data-repo-id': 'R_kgDOOHOoPQ',
        'data-category': 'General',
        'data-category-id': 'DIC_kwDOOHOoPc4C2_FC',
        'data-mapping': 'pathname',
        'data-strict': '0',
        'data-reactions-enabled': '1',
        'data-emit-metadata': '0',
        'data-input-position': 'bottom',
        'data-theme': 'preferred_color_scheme',
        'data-lang': 'zh-CN',
        'data-loading': 'lazy',
        'crossorigin': 'anonymous'
    };

    function initGiscus() {
        var mainElement = document.querySelector('main') || document.querySelector('.content');
        if (!mainElement) {
            return;
        }

        var existingGiscus = document.getElementById('giscus-container');
        if (existingGiscus) {
            return;
        }

        var container = document.createElement('div');
        container.id = 'giscus-container';
        container.style.marginTop = '2rem';
        container.style.paddingTop = '1rem';
        container.style.borderTop = '1px solid var(--sidebar-bg)';

        var script = document.createElement('script');
        Object.keys(giscusConfig).forEach(function(key) {
            if (key === 'src') {
                script.src = giscusConfig[key];
            } else {
                script.setAttribute(key, giscusConfig[key]);
            }
        });

        container.appendChild(script);
        mainElement.appendChild(container);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGiscus);
    } else {
        initGiscus();
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                initGiscus();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
