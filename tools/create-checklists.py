"""Create the three real downloadable checklists using ReportLab (authoring only).
Run with the bundled PDF runtime. The website has no PDF library dependency.
"""
from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader
root=Path(__file__).resolve().parent.parent
data=json.loads((root/'docs/i18n/checklist.json').read_text(encoding='utf-8'))
pdfmetrics.registerFont(TTFont('Body',r'C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('Bold',r'C:/Windows/Fonts/segoeuib.ttf'))
paper=HexColor('#FCFAF6'); ink=HexColor('#16130F'); mango=HexColor('#C4470A'); teal=HexColor('#174F4F')
body=ParagraphStyle('body',fontName='Body',fontSize=11,leading=15,textColor=ink)
small=ParagraphStyle('small',fontName='Body',fontSize=10,leading=14,textColor=ink)
title=ParagraphStyle('title',fontName='Bold',fontSize=25,leading=29,textColor=ink)
names={'en':'adsvio-client-ready-checklist','es':'adsvio-lista-verificacion','fr':'adsvio-liste-verification'}
dest=root/'assets/downloads'; dest.mkdir(parents=True,exist_ok=True)
W,H=A4
def paragraph(c,text,x,y,width,style):
 p=Paragraph(text,style); _,height=p.wrap(width,700); p.drawOn(c,x,y-height); return height
for lang,copy in data.items():
 path=dest/(names[lang]+'.pdf'); c=canvas.Canvas(str(path),pagesize=A4)
 c.setTitle(copy['title']); c.setAuthor('Adsvio Agency'); c.setSubject('27-point business online presence checklist')
 for page,(start,end) in enumerate([(0,14),(14,27)],1):
  c.setFillColor(paper); c.rect(0,0,W,H,fill=1,stroke=0)
  c.drawImage(str(root/'assets/img/logo-adsvio.png'),36,H-54,width=112,height=26,mask='auto')
  c.setFont('Bold',10); c.setFillColor(mango); c.drawRightString(W-36,H-43,lang.upper()+' / 27')
  y=H-84; y-=paragraph(c,copy['title'],36,y,W-72,title)+12
  if page==1:y-=paragraph(c,copy['intro'],36,y,W-72,small)+18
  else:y-=10
  for i in range(start,end):
   if i in (0,6,14,21):
    c.setFillColor(teal);c.setFont('Bold',12); c.drawString(36,y,copy['sections'][(0,6,14,21).index(i)]);y-=25
   c.setStrokeColor(mango);c.setLineWidth(1);c.rect(36,y-11,10,10,fill=0,stroke=1)
   c.setFillColor(ink);c.setFont('Bold',10);c.drawString(55,y-10,f'{i+1:02d}')
   height=paragraph(c,copy['items'][i],78,y,W-114,body);y-=max(height,16)+15
  if page==2:
   y-=10;c.setFillColor(teal);c.setFont('Bold',12);c.drawString(36,y,copy['priority']);y-=18
   for n in range(1,4):
    c.setFont('Body',10);c.drawString(36,y,str(n));c.setStrokeColor(HexColor('#D8D2C8'));c.line(53,y-2,W-36,y-2);y-=23
   y-=8;y-=paragraph(c,copy['cta'],36,y,W-72,small)
   y-=18;c.setFont('Bold',10);c.setFillColor(mango)
   c.drawString(36,y,'adsvioagency.com/'+lang+'/start')
   c.linkURL('https://adsvioagency.com/'+lang+'/start',(36,y-3,300,y+12),relative=0)
  assert y>62,(lang,page,y)
  c.setStrokeColor(HexColor('#D8D2C8'));c.line(36,48,W-36,48)
  c.setFont('Body',9);c.setFillColor(ink);c.drawString(36,32,copy['footer']);c.drawRightString(W-36,32,f'{page} / 2')
  c.showPage()
 c.save()
 reader=PdfReader(path);assert len(reader.pages)==2
 text=' '.join(p.extract_text() for p in reader.pages)
 assert all(f'{i:02d}' in text for i in range(1,28))
 print(path.name, len(reader.pages),'pages; all 27 checks present')
