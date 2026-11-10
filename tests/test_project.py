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
    def test_contacts_above_the_fold(self):
        homepage=(ROOT/'site/index.html').read_text()
        for required in ('contact-ribbon','星觉科技企业官网','https://www.a6no1.cn/','AIPMAndy','data-copy-wechat="AIPMAndy"'):
            self.assertIn(required, homepage)
        app=(ROOT/'site/app.js').read_text()
        for required in ('insertAdjacentHTML("afterend",contactMarkup)','navigator.clipboard.writeText','data-copy-wechat'):
            self.assertIn(required,app)
    def test_contacts_in_all_chapters(self):
        for path in (ROOT/'site/chapters').glob('[0-9][0-9].html'):
            html=path.read_text()
            self.assertIn('https://www.a6no1.cn/',html)
            self.assertIn('AIPMAndy',html)
if __name__=='__main__':unittest.main()
