"""Verify served GitHub Pages files and existing published PDF against this commit.
This script runs only AFTER deploy-pages has succeeded. It is deliberately not a
replacement for real mobile, screen-reader, or human 200% PDF visual inspection.
"""
import hashlib
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/ai-knowledge-paid-acquisition-handbook/"
FILES = ["index.html", "quote-planner.html", "quote-planner.js",
         "planner.css", "robots.txt", "sitemap.xml"]
PDF = "pdf/ai-knowledge-paid-acquisition-handbook-guide.pdf"
PDF_URL = "https://raw.githubusercontent.com/AIPMAndy/ai-knowledge-paid-acquisition-handbook/main/" + PDF

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "AIPMAndy-site-live-qa/1.0", "Cache-Control":"no-cache"})
    with urllib.request.urlopen(request, timeout=25) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status}: {url}")
        return r.read()

def main():
    expected={p:digest((ROOT/"site"/p).read_bytes()) for p in FILES}
    expected[PDF]=digest((ROOT/PDF).read_bytes())
    errors=[]
    for attempt in range(1, 13):
        errors=[]
        for name, sha in expected.items():
            url = PDF_URL if name == PDF else BASE + name + "?live_verify=" + sha[:12]
            try:
                actual = digest(fetch(url))
                if actual != sha: errors.append(f"{name}: expected {sha}, got {actual}")
            except Exception as exc:
                errors.append(f"{name}: {type(exc).__name__}: {exc}")
        if not errors:
            for name, sha in expected.items():
                label = "GitHub raw PDF" if name == PDF else "GitHub Pages"
                print(f"PASS {label}: {name} HTTP 200 SHA-256 {sha}")
            print(f"PASS {len(expected)} public files byte-for-byte matched deployed source")
            return 0
        print(f"Attempt {attempt}/12: {len(errors)} mismatch(es): " + "; ".join(errors),flush=True)
        if attempt < 12: time.sleep(15)
    print("FAIL live acceptance; deploy does not count as success.",file=sys.stderr)
    return 1

if __name__ == "__main__":
    sys.exit(main())