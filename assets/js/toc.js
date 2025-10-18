(() => {
  const article = document.querySelector(".content");
  const tocList = document.querySelector("[data-toc-list]");
  if (!article || !tocList) return;

  const headings = article.querySelectorAll("h2, h3");
  if (!headings.length) {
    const empty = document.createElement("li");
    empty.textContent = "No sections";
    tocList.appendChild(empty);
    return;
  }

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `section-${index + 1}`;
    }
    const li = document.createElement("li");
    li.className = heading.tagName === "H3" ? "toc-sub" : "toc-top";
    const anchor = document.createElement("a");
    anchor.href = `#${heading.id}`;
    anchor.textContent = heading.textContent.trim();
    li.appendChild(anchor);
    tocList.appendChild(li);
  });
})();
