import json
import re
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

class TestQuotePlanner(unittest.TestCase):
    def test_page_has_indexable_schema_and_contact(self):
        html = (ROOT / "site/quote-planner.html").read_text()
        self.assertEqual(html.count("<h1>"), 1)
        self.assertIn('rel="canonical" href="https://aipmandy.github.io/ai-knowledge-paid-acquisition-handbook/quote-planner.html"', html)
        self.assertIn('id="quote-form"', html)
        self.assertIn("AIPMAndy", html)
        self.assertIn("https://www.a6no1.cn/", html)
        self.assertIn("https://metaver.vip/services", html)
        self.assertIn("完全本地计算", html)
        self.assertIn("历史来源登记", html)
        data = re.findall(r'<script type="application/ld\+json">(.+?)</script>', html)
        self.assertEqual(len(data), 1)
        schema = json.loads(data[0])
        self.assertEqual(schema["@type"], "WebApplication")
        self.assertTrue(schema["isAccessibleForFree"])
        self.assertEqual(schema["url"], "https://aipmandy.github.io/ai-knowledge-paid-acquisition-handbook/quote-planner.html")
    def test_sitemap_homepage_and_pdf_link(self):
        home = (ROOT / "site/index.html").read_text()
        self.assertIn('href="quote-planner.html"', home)
        self.assertIn("ai-knowledge-paid-acquisition-handbook-guide.pdf", home)
        self.assertIn("application/ld+json", home)
        self.assertIn("quote-planner.html", (ROOT / "site/sitemap.xml").read_text())
        self.assertTrue((ROOT / "pdf/ai-knowledge-paid-acquisition-handbook-guide.pdf").exists())
    def test_source_links_are_from_register(self):
        register=(ROOT/"audit/sources.csv").read_text()
        html=(ROOT/"site/quote-planner.html").read_text()
        for u in re.findall(r'https://(?:www\.samr\.gov\.cn|www\.cac\.gov\.cn)/[^,<]+',register):
            self.assertIn(u,html)

if __name__ == "__main__": unittest.main()