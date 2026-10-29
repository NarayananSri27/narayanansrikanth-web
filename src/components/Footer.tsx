"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Narayanan Srikanth</p>
        <ul>
          <li>
            <a
              href="https://github.com/NarayananSri27"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </a>
          </li>
          <li>
            <Link href="/contact">contact</Link>
          </li>
          <li>
            <Link href="/links">links</Link>
          </li>
          <li>
            <Link href="/privacy">privacy</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
