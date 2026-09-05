const components = [
    "header",
    "popup",
    "hero",
    "brand",
    "program",
    "event1",
    "qna",
    "footer",
    "applyModal",
    "float"
];

Promise.all(
    components.map(name =>
        fetch(`html/${name}.html`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to load html/${name}.html (${res.status})`);
            }
            return res.text();
        })
        .then(data => {
            const target = document.getElementById(name);
            if (target) target.innerHTML = data;
        })
    )
).then(() => {
    // Components must be fully loaded before qna.js starts rendering Q&A/reviews.
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
}).catch(error => {
    console.error('Component loading failed:', error);
});
