with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

toast_definition = """
    // ================= GLOBAL TOAST NOTIFICATION SYSTEM =================
    window.showToast = function(msg, type) {
      try {
        if (typeof document === 'undefined' || !document.body) {
          console.log('[Toast]', msg);
          return;
        }
        let container = document.getElementById('globalToastContainer');
        if (!container) {
          container = document.createElement('div');
          container.id = 'globalToastContainer';
          container.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:999999; display:flex; flex-direction:column; gap:10px; max-width:420px; pointer-events:none; font-family:inherit;';
          document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = 'pointer-events:auto; background:#1e293b; color:#fff; padding:12px 18px; border-radius:10px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.3); font-size:13.5px; font-weight:600; display:flex; align-items:center; justify-content:space-between; gap:12px; border-left:4px solid #3182ce; transition:all 0.3s ease;';

        const s = String(msg || '');
        if (s.includes('✅') || type === 'success') {
          toast.style.borderLeftColor = '#38a169';
          toast.style.background = '#064e3b';
        } else if (s.includes('⚠️') || type === 'warning') {
          toast.style.borderLeftColor = '#dd6b20';
          toast.style.background = '#78350f';
        } else if (s.includes('❌') || type === 'error') {
          toast.style.borderLeftColor = '#e53e3e';
          toast.style.background = '#7f1d1d';
        }

        toast.innerHTML = `<span style="line-height:1.4;">${s}</span><button type="button" onclick="this.parentElement.remove()" style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:16px; font-weight:700; padding:0 4px; line-height:1;">✕</button>`;

        container.appendChild(toast);

        setTimeout(() => {
          if (toast && toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => { if (toast && toast.parentElement) toast.remove(); }, 350);
          }
        }, 4000);
      } catch (e) {
        console.log('[Toast Error]', e, msg);
      }
    };

    function showToast(msg, type) {
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(msg, type);
      } else {
        console.log('[Toast]', msg);
      }
    }
"""

# 1. Inject at beginning of Script 1
target_script_1 = "  <script>\n    window.google = window.google || {};"
if "GLOBAL TOAST NOTIFICATION SYSTEM" not in text and target_script_1 in text:
    text = text.replace(target_script_1, "  <script>\n" + toast_definition + "\n    window.google = window.google || {};", 1)
    print("Injected showToast into Script 1!")

# 2. Inject right before Dengue lab report logic to be 100% sure in local scope
dengue_target = "    // ================= DENGUE & CHIKUNGUNYA LAB REPORT MODAL LOGIC ================="
if dengue_target in text and "function showToast" not in text[text.find(dengue_target)-200:text.find(dengue_target)+500]:
    local_toast_ref = """    if (typeof showToast === 'undefined') {
      window.showToast = window.showToast || function(msg) { alert(msg); };
      var showToast = function(msg, type) { window.showToast(msg, type); };
    }
"""
    text = text.replace(dengue_target, local_toast_ref + dengue_target, 1)
    print("Injected showToast into Dengue scope!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectGlobalToast.py successfully!")
