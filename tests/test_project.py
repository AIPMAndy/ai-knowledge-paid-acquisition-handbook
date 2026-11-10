import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class TestHandbook(unittest.TestCase):
    def test_chapters(self): self.assertEqual(len(list((ROOT/'content').glob('[0-9][0-9].md'))),24)
    def test_site_chapters(self): self.assertEqual(len(list((ROOT/'site/chapters').glob('[0-9][0-9].html'))),24)
    def test_prompts(self): self.assertEqual(len(list((ROOT/'prompts').glob('[0-9][0-9]-*.md'))),18)
    def test_templates(self): self.assertGreaterEqual(len(list((ROOT/'templates').glob('*'))),22)
    def test_ads(self):
        for path in [ROOT/'site/index.html',*(ROOT/'site/chapters').glob('*.html')]:
            s=path.read_text(); self.assertIn('https://metaver.vip/services',s); self.assertIn('商业服务',s)
    def test_privacy(self):
        s=(ROOT/'examples/05-family-privacy-observation.md').read_text();self.assertIn('不包括行业细分',s)
    def test_no_fake_results(self): self.assertIn('不保证收益',(ROOT/'site/index.html').read_text())
    def test_sitemap(self): self.assertEqual((ROOT/'site/sitemap.xml').read_text().count('<url>'),25)
if __name__=='__main__':unittest.main()
