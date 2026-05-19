(function () {
  let tocObservers = [];
  let syncFrame;

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

  const getTocs = () =>
    Array.from(document.querySelectorAll(".md-nav--secondary"));

  const lastActiveLink = (root) => {
    const activeLinks = Array.from(
      root.querySelectorAll(".md-nav__link--active")
    );
    return activeLinks[activeLinks.length - 1];
  };

  const linkByHash = (toc, hash) => {
    if (!hash) {
      return undefined;
    }

    return Array.from(toc.querySelectorAll(".md-nav__link")).find(
      (link) => link.hash === hash
    );
  };

  const collapseAllBranches = (toc) => {
    toc
      .querySelectorAll(".md-nav__item--has-children")
      .forEach((item) => setExpanded(item, false));
  };

  const expandCurrentBranch = (toc) => {
    const localActiveLink = lastActiveLink(toc);
    const globalActiveLink = lastActiveLink(document);
    const activeHash =
      (localActiveLink && localActiveLink.hash) ||
      (globalActiveLink && globalActiveLink.hash) ||
      window.location.hash;
    const activeLink = localActiveLink || linkByHash(toc, activeHash);

    collapseAllBranches(toc);

    if (!activeLink) {
      return;
    }

    let item = activeLink.closest(".md-nav__item");
    while (item && toc.contains(item)) {
      if (item.classList.contains("md-nav__item--has-children")) {
        setExpanded(item, true);
      }

      const parentNav = item.parentElement && item.parentElement.closest(".md-nav");
      item = parentNav && parentNav !== toc
        ? parentNav.closest(".md-nav__item")
        : undefined;
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

  const syncAllTocs = () => {
    getTocs().forEach(expandCurrentBranch);
  };

  const scheduleSync = () => {
    if (syncFrame) {
      return;
    }

    syncFrame = requestAnimationFrame(() => {
      syncFrame = undefined;
      syncAllTocs();
    });
  };

  const enhanceToc = () => {
    tocObservers.forEach((observer) => observer.disconnect());
    tocObservers = [];

    getTocs().forEach((toc) => {
      toc
        .querySelectorAll(".md-nav__item")
        .forEach((item) => {
          if (!childNavOf(item)) {
            return;
          }

          item.classList.add("md-nav__item--has-children");
          addToggle(item);
          setExpanded(item, false);
        });

      expandCurrentBranch(toc);

      const tocObserver = new MutationObserver((mutations) => {
        const activeChanged = mutations.some(
          (mutation) =>
            mutation.type === "attributes" &&
            mutation.attributeName === "class" &&
            mutation.target.classList.contains("md-nav__link")
        );

        if (activeChanged) {
          expandCurrentBranch(toc);
        }
      });

      tocObserver.observe(toc, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true
      });

      tocObservers.push(tocObserver);
    });
  };

  if (typeof document$ !== "undefined") {
    document$.subscribe(enhanceToc);
  } else {
    document.addEventListener("DOMContentLoaded", enhanceToc);
  }

  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("hashchange", scheduleSync);
})();
