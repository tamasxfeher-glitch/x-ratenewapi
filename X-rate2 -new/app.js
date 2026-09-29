const VS='usd';
// Módosított formázó: csak a számot adja vissza tizedesekkel, dollárjel nélkül
function fmtNum(n){return new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);} 

async function load(){
 const pf = await fetch('portfolio.json',{cache:'no-store'}).then(r=>r.json());
 const ids=[...new Set(Object.values(pf).map(p=>p.id))];
 const priceUrl=`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${VS}`;

const prices=await fetch(
  '/.netlify/functions/prices',
  {cache:'no-store'}
).then(r=>r.json());

 let sumInv=0,sumCur=0;
 
 const items = Object.keys(pf).map(sym => {
  const p = pf[sym];
  const cp = prices[p.id] ? prices[p.id][VS] : 0;
  const inv = p.qty * p.buy_price;
  const cur = p.qty * cp;
  const ratio = cp > 0 ? (cp / p.buy_price) * 100 : 0;
  const plDollar = cur - inv;
  
  if(p.qty > 0) {
      sumInv += inv;
      sumCur += cur;
  }
  
  return { sym, ...p, cp, cur, ratio, plDollar };
 });

 items.sort((a, b) => {
  if (a.sym === 'BTC') return -1;
  if (b.sym === 'BTC') return 1;
  return b.ratio - a.ratio;
 });

 let html=`<table class='w-full'>
    <thead>
        <tr class='bg-gray-100 border-b text-[13px]'>
            <th class='p-3 text-left text-gray-700'>Token ($)</th>
            <th class='p-3 text-right text-gray-700'>Qty / Price</th>
            <th class='p-3 text-right text-gray-700'>Value / P&L</th>
            <th class='p-3 text-right text-gray-700'>%</th>
        </tr>
    </thead>
    <tbody>`;

 items.forEach(item => {
  const isBTC = item.sym === 'BTC';
  const ratioColor = item.ratio >= 100 ? 'text-green-600' : 'text-red-600';
  const displayRatio = isBTC ? '' : item.ratio.toFixed(1) + '%';
  const plSign = item.plDollar >= 0 ? '+' : '';
  
  html+=`<tr class='border-t'>
    <td class='p-3 align-middle'>
        <div class='font-bold text-gray-900 text-[16px]'>${item.sym}</div>
        <div class='text-[11px] text-indigo-700 font-medium'>B: ${item.buy_price}</div>
    </td>
    <td class='p-3 text-right align-middle'>
        <div class='text-gray-900 font-bold text-[15px]'>${item.qty}</div>
        <div class='text-[13px] font-bold text-blue-700'>${item.cp ? fmtNum(item.cp) : 'n/a'}</div>
    </td>
    <td class='p-3 text-right align-middle'>
        <div class='font-bold text-gray-900 text-[15px]'>${item.cp ? fmtNum(item.cur) : 'n/a'}</div>
        <div class='text-[13px] font-black ${ratioColor} mt-0.5'>
            ${item.cp && item.qty > 0 ? plSign + fmtNum(item.plDollar) : ''}
        </div>
    </td>
    <td class='p-3 text-right align-middle font-black ${ratioColor} text-[16px]'>
        ${displayRatio}
    </td>
  </tr>`;
 });
 
 html+='</tbody></table>';
 
 const totalPL = sumCur - sumInv;
 document.getElementById('table-container').innerHTML=html;
 
 const fmtTotal = (n) => '$' + fmtNum(n);
 if(document.getElementById('sum-invested')) document.getElementById('sum-invested').textContent = fmtTotal(sumInv);
 if(document.getElementById('sum-current')) document.getElementById('sum-current').textContent = fmtTotal(sumCur);
 if(document.getElementById('sum-pl')) {
    const sumPLEl = document.getElementById('sum-pl');
    sumPLEl.textContent = (totalPL >= 0 ? '+' : '') + fmtTotal(totalPL);
    sumPLEl.className = `text-lg font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`;
 }
 
 document.getElementById('last-updated').textContent='Last: '+new Date().toLocaleTimeString();
}

document.addEventListener('DOMContentLoaded',()=>{
    load();
    document.getElementById('refresh-btn').onclick=load;
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});