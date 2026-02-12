let currentInput = "";
let currentMode = 'calc';
const expressionDiv = document.getElementById('expression');
const resultDiv = document.getElementById('result');
const keypad = document.getElementById('keypad');

// --- TEMA VE MOD FONKSİYONLARI ---
function setTheme(theme) {
    document.body.className = 'theme-' + theme;
    localStorage.setItem('userTheme', theme);
}

function setMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderKeypad();
    clearDisplay();
}

// --- DİNAMİK TUŞ ÜRETİCİ ---
function renderKeypad() {
    keypad.innerHTML = "";
    if (currentMode === 'calc') {
        const keys = ['AC','DEL','(',')','7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
        keys.forEach(k => createBtn(k, handleCalc));
    } else if (currentMode === 'currency') {
        // BTC UÇTU, TRY GELDİ KANZI!
        const curs = ['USD','EUR','GBP','TRY'];
        curs.forEach(c => createBtn(c, fetchCurrency));
    } else if (currentMode === 'formula') {
        const forms = [{n:'Hipo', v:'sqrt(a^2+b^2)'}, {n:'Alan', v:'pi*r^2'}, {n:'E=mc2', v:'m*c^2'}];
        forms.forEach(f => createBtn(f.n, () => { currentInput = f.v; updateDisplay(); }));
    }
}

function createBtn(txt, fn) {
    const b = document.createElement('button');
    b.innerText = txt === '*' ? '×' : (txt === '/' ? '÷' : txt);
    b.className = `btn ${isNaN(txt) && txt !== '.' ? 'btn-op' : ''} ${txt === '=' ? 'btn-eq' : ''}`;
    if (txt === 'AC' || txt === 'DEL') b.style.color = 'var(--error)';
    b.onclick = () => fn(txt);
    keypad.appendChild(b);
}

// --- HESAPLAMA MANTIĞI ---
function handleCalc(k) {
    if (k === 'AC') clearDisplay();
    else if (k === 'DEL') { currentInput = currentInput.slice(0,-1); updateDisplay(); }
    else if (k === '=') calculate();
    else {
        const last = currentInput.slice(-1);
        const ops = ['+','*','/','.','^'];
        if (ops.includes(k) && (currentInput === "" || ops.includes(last))) return;
        currentInput += k; updateDisplay();
    }
}

function calculate() {
    try {
        if (!currentInput) return;
        const res = math.evaluate(currentInput);
        resultDiv.innerText = Number.isInteger(res) ? res : res.toFixed(4);
        resultDiv.style.color = "var(--accent)";
    } catch (e) {
        resultDiv.innerText = "Hata!";
        resultDiv.style.color = "var(--error)";
        document.querySelector('.container').classList.add('shake');
        setTimeout(() => document.querySelector('.container').classList.remove('shake'), 400);
    }
}

// --- TRY DESTEKLİ DÖVİZ MOTORU ---
async function fetchCurrency(base) {
    resultDiv.innerText = "...";
    try {
        const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
        const d = await r.json();
        if(base === 'TRY') {
            resultDiv.innerText = (1 / d.rates.USD).toFixed(4) + " $";
            expressionDiv.innerText = "1 TL kaç Dolar?";
        } else {
            resultDiv.innerText = d.rates.TRY.toFixed(2) + " ₺";
            expressionDiv.innerText = `1 ${base} kaç TL?`;
        }
    } catch (e) { resultDiv.innerText = "Net Yok!"; }
}

function clearDisplay() { currentInput = ""; updateDisplay(); resultDiv.innerText = "0"; }
function updateDisplay() { expressionDiv.innerText = currentInput || "0"; }

// BAŞLATMA KOMUTLARI
renderKeypad();
setTheme(localStorage.getItem('userTheme') || 'blue');

// KLAVYE DESTEĞİ
document.addEventListener('keydown', (e) => {
    if (currentMode !== 'calc') return;
    if (/[0-9]/.test(e.key) || ['+','-','*','/','.','(',')','^'].includes(e.key)) handleCalc(e.key);
    if (e.key === 'Enter') calculate();
    if (e.key === 'Backspace') handleCalc('DEL');
    if (e.key === 'Escape') clearDisplay();
});