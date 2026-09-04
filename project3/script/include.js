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
        .then(res => res.text())
        .then(data => {
            document.getElementById(name).innerHTML = data;
        })
    )
).then(() => {

    // 모든 html이 로드된 후 실행
    if (typeof initPage === "function") {
        initPage();
    }

});