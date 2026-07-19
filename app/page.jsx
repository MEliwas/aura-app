import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Skull,
  Wine,
  Brain,
  Crown,
  Sparkles,
  PawPrint,
  DollarSign,
  Gamepad2,
  Magnet,
  Trophy,
  Gem,
  RotateCcw,
  Send,
  CheckCircle2,
  Radar,
  Satellite,
  Eye,
  Zap,
  ScanLine,
  AlertTriangle,
  Mail,
} from "lucide-react";

/* ---------------------------------- data ---------------------------------- */

const SCAN_MESSAGES = [
  "Анализ энергетических потоков...",
  "Поиск сигма-частиц...",
  "Анализ уровня харизмы...",
  "Проверка взгляда главного героя...",
  "Измерение сигма-поля...",
  "Обнаружение энергетических аномалий...",
  "Подключение к спутнику...",
  "Сканирование вайба...",
];

const SCAN_ICONS = [Radar, Zap, Brain, Eye, Wine, AlertTriangle, Satellite, ScanLine];

const FINAL_PHRASES = [
  "Ваша аура настолько сильна, что сервер начал перегреваться.",
  "Поздравляем. Ваш вайб официально признан опасным.",
  "Даже нейросеть не ожидала такого результата.",
  "Вы слишком сигма для нашего оборудования.",
  "Рекомендуем не смотреть в зеркало резко — возможен резонанс.",
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const bool = (chance = 0.5) => Math.random() < chance;

const STAT_DEFS = [
  { icon: Skull, label: "NPC", gen: () => `${rand(1, 15)}%` },
  { icon: Gem, label: "Количество ауры", gen: () => rand(12000, 87000).toLocaleString("ru-RU") },
  { icon: Brain, label: "IQ по фото", gen: () => rand(120, 180) },
  { icon: Crown, label: "Главный герой", gen: () => (bool(0.85) ? "ДА" : "НЕТ") },
  { icon: Eye, label: "Харизма", gen: () => `${rand(70, 99)}%` },
  { icon: PawPrint, label: "Волчара внутри", gen: () => (bool(0.75) ? "АКТИВЕН" : "СПИТ") },
  { icon: DollarSign, label: "Потенциал стать миллионером", gen: () => `${rand(60, 99)}%` },
  { icon: Gamepad2, label: "Вероятность играть в Rust", gen: () => `${rand(40, 95)}%` },
  { icon: Sparkles, label: "Уровень вайба", gen: () => rand(5000, 9999) },
  { icon: Magnet, label: "Магнит для девушек", gen: () => (bool(0.5) ? "ОБНАРУЖЕН" : "НЕ ОБНАРУЖЕН") },
  { icon: Trophy, label: "Шанс стать легендой", gen: () => `${rand(80, 99)}%` },
];

function generateResult() {
  const rare = Math.random() < 0.001;
  const score = rand(6200, 9987);
  const stats = STAT_DEFS.map((s) => ({ ...s, value: s.gen() }));
  const phrase = FINAL_PHRASES[rand(0, FINAL_PHRASES.length - 1)];
  return { rare, score, stats, phrase };
}

/* -------------------------------- particles -------------------------------- */

function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    }

    function init() {
      resize();
      const count = reduced ? 18 : 55;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vy: (Math.random() * 0.15 + 0.03) * window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.08 * window.devicePixelRatio,
        a: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.5 ? "124, 92, 255" : "56, 189, 248",
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
        ctx.fill();
      });
      if (!reduced) raf = requestAnimationFrame(tick);
    }

    init();
    tick();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ---------------------------------- shell ---------------------------------- */

function Glow({ style }) {
  return (
    <div
      className="glow-orb"
      style={{
        background:
          "radial-gradient(circle, rgba(124,92,255,0.35) 0%, rgba(56,189,248,0.12) 45%, transparent 70%)",
        ...style,
      }}
    />
  );
}

/* --------------------------------- landing --------------------------------- */

function Landing({ onFile, dragActive, setDragActive }) {
  const inputRef = useRef(null);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
      <div className="aura-appear badge-pill flex items-center gap-2 rounded-full px-4 py-1.5 text-2xs tracking-eyebrow text-violet-300 mb-6">
        <span className="relative flex h-1.5 w-1.5">
          <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
        </span>
        СИСТЕМА АКТИВНА · ВЕРСИЯ 4.2
      </div>

      <h1 className="aura-appear aura-appear-delay-1 title-gradient max-w-3xl text-5xl sm:text-7xl font-semibold tracking-tight">
        <span className="mr-2 inline-block">🗿</span>
        Оценщик Ауры
      </h1>

      <p className="aura-appear aura-appear-delay-2 mt-6 max-w-md text-base sm:text-lg text-white/50">
        Самый точный анализ твоей энергетики при помощи искусственного
        интеллекта.
      </p>

      <div
        className="aura-appear aura-appear-delay-3 mt-12 w-full max-w-sm"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <button
          onClick={() => inputRef.current?.click()}
          className={`upload-btn active:scale-95 relative w-full overflow-hidden rounded-2xl px-8 py-4 text-sm font-medium text-white transition-transform duration-200 ${
            dragActive ? "drag-active" : ""
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Upload className="h-4 w-4 text-violet-300" />
            Загрузить фото
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        />
        <p className="mt-4 text-xs text-white/30">
          ⚠️ Результаты могут вызвать зависть друзей.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- scanning --------------------------------- */

function Scanning({ photoUrl }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(2);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SCAN_MESSAGES.length);
    }, 1100);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const duration = 8600;
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(99, (elapsed / duration) * 100);
      setProgress(pct);
    }, 60);
    return () => clearInterval(progTimer);
  }, []);

  const Icon = SCAN_ICONS[msgIndex % SCAN_ICONS.length];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
      <div className="relative mb-10 h-44 w-44">
        <div className="scan-ring absolute inset-0 rounded-full" />
        <div className="scan-ring scan-ring-2 absolute inset-0 rounded-full" />
        <div className="absolute inset-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="scan-photo h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-500/20 to-sky-500/10" />
          )}
          <div className="scan-sweep absolute inset-0" />
        </div>
      </div>

      <div className="flex min-h-7 items-center gap-2 text-sm text-violet-200/80">
        <Icon className="h-4 w-4 shrink-0 text-violet-400" />
        <span key={msgIndex} className="fade-swap">
          {SCAN_MESSAGES[msgIndex]}
        </span>
      </div>

      <div className="mt-8 h-1 w-64 sm:w-80 overflow-hidden rounded-full bg-white/10">
        <div className="scan-progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 text-xs tabular-nums text-white/30">{Math.floor(progress)}%</div>
    </div>
  );
}

/* ---------------------------------- rare ---------------------------------- */

function RareResult({ onReset }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
      <div className="aura-appear rare-icon-box flex h-16 w-16 items-center justify-center rounded-2xl">
        <AlertTriangle className="h-7 w-7 text-red-300" />
      </div>
      <p className="aura-appear aura-appear-delay-1 mt-8 text-2xs tracking-eyebrow-lg text-red-300/70">
        КОД ОШИБКИ: AURA_OVERFLOW
      </p>
      <h2 className="aura-appear aura-appear-delay-2 mt-4 max-w-md text-2xl sm:text-3xl font-medium text-white">
        Мы впервые видим такой результат.
      </h2>
      <p className="aura-appear aura-appear-delay-3 mt-4 max-w-sm text-sm text-white/50">
        Ваша аура превышает возможности системы. Для продолжения исследования
        свяжитесь с разработчиком.
      </p>

      <div className="aura-appear aura-appear-delay-3 mt-10 flex flex-col sm:flex-row items-center gap-3">
        <button className="btn-ghost active:scale-95 flex items-center gap-2 rounded-xl px-6 py-3 text-sm text-white/80 transition-transform duration-200">
          <Mail className="h-4 w-4 text-red-300" />
          Связаться с разработчиком
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Начать заново
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- result --------------------------------- */

function CountUp({ target, duration = 1400 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    function step(t) {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{val.toLocaleString("ru-RU")}</>;
}

function Result({ photoUrl, data, onReset }) {
  const pct = (data.score / 10000) * 100;
  const [shareState, setShareState] = useState("idle"); // idle | copied

  const shareText = `🗿 Моя аура: ${data.score.toLocaleString("ru-RU")} / 10000\n${data.phrase}\n\nПроверь свою ауру → ${typeof window !== "undefined" ? window.location.href : ""}`;

  const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        /* fall through to legacy method */
      }
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Оценщик Ауры", text: shareText });
        return;
      } catch (e) {
        // user cancelled the native share sheet — do nothing
        if (e?.name === "AbortError") return;
      }
    }
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 sm:px-6 py-16 sm:py-24 relative z-10">
      <div className="aura-appear result-card w-full max-w-xl rounded-3xl p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          {photoUrl && (
            <div
              className="avatar-ring mb-5 shrink-0 overflow-hidden rounded-full"
              style={{ width: 88, height: 88 }}
            >
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ display: "block" }}
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-2xs tracking-eyebrow-lg text-violet-300/60">
            🗿 АУРА
          </div>

          <div className="score-wrap relative mt-3">
            <div className="score-glow absolute inset-0" />
            <div className="score-number text-6xl sm:text-7xl font-semibold tabular-nums">
              <CountUp target={data.score} />
              <span className="text-2xl sm:text-3xl text-white/30"> / 10000</span>
            </div>
          </div>

          <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="progress-fill h-full rounded-full" style={{ "--fill-width": `${pct}%` }} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="stat-appear stat-card rounded-2xl p-4 text-left transition-colors duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className="h-4 w-4 text-violet-300/70" />
                <div className="mt-3 text-lg sm:text-xl font-semibold text-white">{s.value}</div>
                <div className="mt-0.5 text-2xs leading-tight text-white/40">{s.label}</div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-white/50">{data.phrase}</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="btn-ghost active:scale-95 flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm text-white/80 transition-transform duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Проверить ещё раз
          </button>
          <button
            onClick={handleShare}
            className="btn-primary active:scale-95 flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-transform duration-200"
          >
            {shareState === "copied" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Скопировано!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Отправить другу
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */

export default function AuraScanner() {
  const [screen, setScreen] = useState("landing"); // landing | scanning | result | rare
  const [photoUrl, setPhotoUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const timerRef = useRef(null);

  const handleFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result);
      setScreen("scanning");
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (screen === "scanning") {
      timerRef.current = setTimeout(() => {
        const data = generateResult();
        setResult(data);
        setScreen(data.rare ? "rare" : "result");
      }, rand(8200, 9800));
    }
    return () => clearTimeout(timerRef.current);
  }, [screen]);

  const reset = useCallback(() => {
    setScreen("landing");
    setResult(null);
    setPhotoUrl(null);
  }, []);

  return (
    <div className="app-root min-h-dvh w-full relative overflow-hidden font-sans text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .app-root { background-color: #09090B; font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .min-h-dvh { min-height: 100vh; min-height: 100dvh; }
        .text-2xs { font-size: 11px; line-height: 1rem; }
        .tracking-eyebrow { letter-spacing: 0.2em; }
        .tracking-eyebrow-lg { letter-spacing: 0.25em; }

        .particle-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.7;
          pointer-events: none;
        }

        .glow-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(110px);
          pointer-events: none;
        }

        .badge-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
        }

        .title-gradient {
          color: #ffffff;
          text-shadow: 0 0 40px rgba(124,92,255,0.35);
        }

        .upload-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .upload-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(167,139,250,0.4);
          box-shadow: 0 0 40px rgba(124,92,255,0.25);
        }
        .upload-btn.drag-active {
          background: rgba(139,92,246,0.1);
          border-color: rgba(167,139,250,0.6);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(167,139,250,0.3);
        }

        .btn-primary {
          background: linear-gradient(90deg, #7c3aed, #38bdf8);
          box-shadow: 0 0 25px rgba(124,92,255,0.35);
          transition: box-shadow 0.3s;
        }
        .btn-primary:hover {
          box-shadow: 0 0 35px rgba(124,92,255,0.5);
        }

        .rare-icon-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(248,113,113,0.25);
        }

        .avatar-ring {
          border: 2px solid rgba(167,139,250,0.4);
          box-shadow: 0 0 20px rgba(124,92,255,0.35);
          background: rgba(255,255,255,0.05);
        }

        .result-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(30px);
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(167,139,250,0.3);
        }

        .score-wrap { display: inline-block; }
        .score-glow {
          z-index: -1;
          border-radius: 9999px;
          filter: blur(60px);
          background: rgba(124,92,255,0.35);
        }
        .score-number {
          color: #ffffff;
          text-shadow: 0 0 30px rgba(124,92,255,0.4);
        }

        @keyframes auraFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aura-appear { animation: auraFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .aura-appear-delay-1 { animation-delay: 0.08s; }
        .aura-appear-delay-2 { animation-delay: 0.16s; }
        .aura-appear-delay-3 { animation-delay: 0.24s; }

        @keyframes statFadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .stat-appear { animation: statFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes fadeSwap {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-swap { animation: fadeSwap 0.4s ease both; display: inline-block; }

        @keyframes pingDot {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .ping-dot { animation: pingDot 1.5s cubic-bezier(0,0,0.2,1) infinite; }

        @keyframes ringSpin {
          to { transform: rotate(360deg); }
        }
        .scan-ring {
          border: 1.5px solid transparent;
          border-top-color: rgba(124,92,255,0.8);
          border-right-color: rgba(56,189,248,0.5);
          animation: ringSpin 2.4s linear infinite;
          box-shadow: 0 0 30px rgba(124,92,255,0.25);
        }
        .scan-ring-2 {
          inset: -10px;
          border-top-color: transparent;
          border-bottom-color: rgba(124,92,255,0.5);
          border-left-color: rgba(56,189,248,0.35);
          animation: ringSpin 3.6s linear infinite reverse;
        }
        .scan-photo { filter: blur(4px); opacity: 0.7; transform: scale(1.1); }

        @keyframes sweepMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scan-sweep {
          background: linear-gradient(180deg, transparent, rgba(124,92,255,0.35), transparent);
          animation: sweepMove 1.8s ease-in-out infinite;
        }
        .scan-progress-fill {
          background: linear-gradient(90deg, #8b5cf6, #e879f9, #38bdf8);
          box-shadow: 0 0 12px rgba(124,92,255,0.7);
          transition: width 0.15s linear;
        }

        @keyframes fillWidth {
          from { width: 0%; }
        }
        .progress-fill {
          width: var(--fill-width);
          background: linear-gradient(90deg, #8b5cf6, #e879f9, #38bdf8);
          box-shadow: 0 0 12px rgba(124,92,255,0.6);
          animation: fillWidth 1.6s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.3s;
        }

        @media (prefers-reduced-motion: reduce) {
          .aura-appear, .stat-appear, .fade-swap, .ping-dot,
          .scan-ring, .scan-ring-2, .scan-sweep, .progress-fill, .scan-progress-fill {
            animation: none !important;
          }
        }
      `}</style>

      <ParticleField />
      <Glow style={{ left: "50%", top: "-10%", width: 500, height: 500, transform: "translateX(-50%)" }} />
      <Glow style={{ bottom: "-15%", right: "-10%", width: 400, height: 400 }} />

      {screen === "landing" && (
        <Landing onFile={handleFile} dragActive={dragActive} setDragActive={setDragActive} />
      )}
      {screen === "scanning" && <Scanning photoUrl={photoUrl} />}
      {screen === "result" && result && <Result photoUrl={photoUrl} data={result} onReset={reset} />}
      {screen === "rare" && <RareResult onReset={reset} />}
    </div>
  );
}
