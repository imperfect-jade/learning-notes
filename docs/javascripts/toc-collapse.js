(function () {
  let tocObserver;

  const childNavOf = (item) =>
    Array.from(item.children).find((child) =>
      child.classList && child.classList.contains("md-nav")
    );

  const directLinkOf = (item) =>
    Array.from(item.children).find((child) =>
      child.classList && child.classList.contains("md-nav__link")
    );

  const setExpanded = (item, expanded) => {
    item.classList.toggle("md-nav__item--expanded", expanded);
    item.classList.toggle("md-nav__item--collapsed", !expanded);

    const button = item.querySelector(":scope > .toc-collapse-toggle");
    if (button) {
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", expanded ? "折叠目录" : "展开目录");
    }
  };

  const collapseAllBranches = () => {
    document
      .querySelectorAll(".md-nav--secondary .md-nav__item--has-children")
      .forEach((item) => setExpanded(item, false));
  };

  const expandCurrentBranch = () => {
    const activeLink = document.querySelector(
      ".md-nav--secondary .md-nav__link--active"
    );

    collapseAllBranches();

    if (!activeLink) {
      return;
    }

    let item = activeLink.closest(".md-nav__item");
    while (item && item.closest(".md-nav--secondary")) {
      if (item.classList.contains("md-nav__item--has-children")) {
        setExpanded(item, true);
      }

      const parentNav = item.parentElement && item.parentElement.closest(".md-nav");
      item = parentNav && parentNav.closest(".md-nav__item");
    }
  };

  const addToggle = (item) => {
    if (item.querySelector(":scope > .toc-collapse-toggle")) {
      return;
    }

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

    item.insertBefore(button, directLinkOf(item) || childNavOf(item));
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
        if (!childNavOf(item)) {
          return;
        }

        item.classList.add("md-nav__item--has-children");
        addToggle(item);
        setExpanded(item, false);
      });

    expandCurrentBranch();

    if (toc) {
      tocObserver = new MutationObserver((mutations) => {
        const activeChanged = mutations.some(
          (mutation) =>
            mutation.type === "attributes" &&
            mutation.attributeName === "class" &&
            mutation.target.classList.contains("md-nav__link")
        );

        if (activeChanged) {
          expandCurrentBranch();
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
