const navItems = [
  { href: "/", label: "Home" },
  { href: "/learning-log.html", label: "Learning Log" },
  { href: "/contact.html", label: "Contact" }
];

window.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");

  if (!nav) {
    return;
  }

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  const links = navItems
    .map(item => {
      const itemPath = item.href.replace(/\/index\.html$/, "/");
      const activeClass = currentPath === itemPath ? "is-active" : "";
      return `<a class="${activeClass}" href="${item.href}">${item.label}</a>`;
    })
    .join("");

  nav.innerHTML = `
    <a class="brand" href="/" aria-label="Jared home">
      <img src="/Images/Logo.png" alt="">
      <span>Jared Peterson</span>
    </a>
    <nav class="nav-links" aria-label="Primary navigation">
      ${links}
    </nav>
  `;
});
