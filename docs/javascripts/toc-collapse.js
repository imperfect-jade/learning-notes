(function () {
  let tocObserver;

  const setExpanded = (item, expanded) => {
    item.classList.toggle("md-nav__item--expanded", expanded);
    item.classList.toggle("md-nav__item--collapsed", !expanded);

    const button = item.querySelector(":scope > .toc-collapse-toggle");
    if (button) {
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", expanded ? "折叠目录" : "展开目录");
    }
  };

  const expandActiveBranch = () => {
    document
      .querySelectorAll(".md-nav--secondary .md-nav__item--has-children")
      .forEach((item) => {
        if (item.querySelector(".md-nav__link--active")) {
          setExpanded(item, true);
        }
      });
  };

  const enhanceToc = () => {
    const toc = document.querySelector(".md-nav--secondary");

    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = undefined;
    }

    document
      .querySelectorAll(".md-nav--secondary .md-nav__item")
      .forEach((item) => {
        const childNav = Array.from(item.children).find((child) =>
          child.classList && child.classList.contains("md-nav")
        );

        if (!childNav) {
          return;
        }

        item.classList.add("md-nav__item--has-children");

        const link = Array.from(item.children).find((child) =>
          child.classList && child.classList.contains("md-nav__link")
        );

        if (!item.querySelector(":scope > .toc-collapse-toggle")) {
          const button = document.createElement("button");
          button.className = "toc-collapse-toggle";
          button.type = "button";
          button.setAttribute("aria-label", "展开目录");
          button.setAttribute("aria-expanded", "false");

          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded(item, !item.classList.contains("md-nav__item--expanded"));
          });

          item.insertBefore(button, link || childNav);
        }

        setExpanded(item, Boolean(item.querySelector(".md-nav__link--active")));
      });

    expandActiveBranch();

    if (toc) {
      tocObserver = new MutationObserver((mutations) => {
        if (
          mutations.some(
            (mutation) =>
              mutation.type === "attributes" &&
              mutation.attributeName === "class" &&
              mutation.target.classList.contains("md-nav__link")
          )
        ) {
          expandActiveBranch();
        }
      });

      tocObserver.observe(toc, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true
      });
    }
  };

  if (typeof document$ !== "undefined") {
    document$.subscribe(enhanceToc);
  } else {
    document.addEventListener("DOMContentLoaded", enhanceToc);
  }
})();
