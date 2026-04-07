import json, os, re
BASE='/mnt/data/ltcbuild'
SPECIES_DIR=os.path.join(BASE,'data','species')
repls=[
 (re.compile(r'\bOnly sell to aquarists\b',re.I),'Recommend only to aquarists'),
 (re.compile(r'\bSell to aquarists\b',re.I),'Recommend to aquarists'),
 (re.compile(r'\bSell as\b',re.I),'Treat as'),
 (re.compile(r'\bSell it as\b',re.I),'Treat it as'),
 (re.compile(r'\bSell this as\b',re.I),'Treat this as'),
 (re.compile(r'\bSell with\b',re.I),'Lead with'),
 (re.compile(r'\bsell with\b',re.I),'lead with'),
 (re.compile(r'\bSell alongside\b',re.I),'Pair alongside'),
 (re.compile(r'\bsell alongside\b',re.I),'pair alongside'),
 (re.compile(r'\bSell in groups of\b',re.I),'Keep in groups of'),
 (re.compile(r'\bsell in groups of\b',re.I),'keep in groups of'),
 (re.compile(r'\bSell in harems\b',re.I),'Discuss in harem groups'),
 (re.compile(r'\bsell in harems\b',re.I),'discuss in harem groups'),
 (re.compile(r'\bThe selling point\b',re.I),'The main appeal'),
 (re.compile(r'\bthe selling point\b',re.I),'the main appeal'),
 (re.compile(r'\bsell carefully\b',re.I),'recommend carefully'),
 (re.compile(r'\bSell clearly\b',re.I),'Explain clearly'),
 (re.compile(r'\bSell the\b',re.I),'Lead with the'),
 (re.compile(r'\bsell the\b',re.I),'lead with the'),
 (re.compile(r'\bSell it to aquarists\b',re.I),'Recommend it to aquarists'),
 (re.compile(r'\bshoppers\b',re.I),'reef keepers'),
 (re.compile(r'\bcheap(er)?\b',re.I),lambda m:'more budget-friendly' if m.group(1) else 'budget-friendly'),
 (re.compile(r'\bbuy in bulk\b',re.I),'stock in practical numbers'),
 (re.compile(r'\bbuy 10-20 at a time\b',re.I),'stock practical groups when the tank truly needs them'),
 (re.compile(r'\bbulk\b',re.I),'larger cleanup-crew quantities'),
 (re.compile(r'\.\.',re.I),'.'),
 (re.compile(r'\ba advanced\b',re.I),'an advanced'),
 (re.compile(r'\ba intermediate\b',re.I),'an intermediate'),
 (re.compile(r'\ba easy\b',re.I),'an easy'),
]

def load(path):
    txt=open(path,encoding='utf-8').read()
    cat=json.loads(re.search(r'window\.LTC_SPECIES_CHUNKS\[(.+?)\]\s*=\s*',txt).group(1))
    arr=json.loads(re.search(r'=\s*(\[[\s\S]*\])\s*;\s*$',txt).group(1))
    return cat,arr

def save(cat,arr,path):
    open(path,'w',encoding='utf-8').write('window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};\n'+f'window.LTC_SPECIES_CHUNKS[{json.dumps(cat)}] = '+json.dumps(arr,ensure_ascii=False,indent=2)+';\n')

for fname in os.listdir(SPECIES_DIR):
    if not fname.endswith('.js'): continue
    path=os.path.join(SPECIES_DIR,fname)
    cat,arr=load(path)
    for e in arr:
        for k,v in list(e.items()):
            if isinstance(v,str):
                for rx,repl in repls:
                    v=rx.sub(repl,v)
                e[k]=v.strip()
            elif isinstance(v,list):
                nv=[]
                for item in v:
                    if isinstance(item,str):
                        for rx,repl in repls:
                            item=rx.sub(repl,item)
                    nv.append(item.strip() if isinstance(item,str) else item)
                e[k]=nv
    save(cat,arr,path)
