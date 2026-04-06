"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Insurer, InsurerKind } from "../insurers-data";
import { INSURERS } from "../insurers-data";

type TabValue = "all" | InsurerKind;

function kindLabel(kind: InsurerKind) {
  return kind === "life" ? "생보" : "손보";
}

function kindBadgeClass(kind: InsurerKind) {
  // 요구사항: 생보 파란색, 손보 주황색
  return kind === "life"
    ? "bg-blue-500 text-white"
    : "bg-orange-500 text-white";
}

function getFaviconDomain(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function InsurerLogo({
  name,
  homepageUrl,
}: {
  name: string;
  homepageUrl: string;
}) {
  const [failed, setFailed] = useState(false);
  const domain = getFaviconDomain(homepageUrl);
  const firstLetter = name.trim().charAt(0) || "?";

  if (failed) {
    return (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-sm font-extrabold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        {firstLetter}
      </div>
    );
  }

  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    domain
  )}&sz=64`;

  return (
    <img
      src={src}
      alt={`${name} 로고`}
      width={48}
      height={48}
      className="mx-auto h-12 w-12"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-black"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {children}
      </div>
    </div>
  );
}

function LinkButton({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: "homepage" | "terms" | "claims";
}) {
  const variantClass =
    variant === "homepage"
      ? "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-white dark:text-blue-800 dark:hover:bg-blue-50"
      : variant === "terms"
        ? "border-green-200 bg-white text-green-700 hover:bg-green-50 dark:border-green-900 dark:bg-white dark:text-green-800 dark:hover:bg-green-50"
        : "border-orange-200 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-200 dark:bg-white dark:text-orange-800 dark:hover:bg-orange-50";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors",
        variantClass,
      ].join(" ")}
    >
      {children}
      <span aria-hidden="true" className="text-base leading-none">
        →
      </span>
    </a>
  );
}

export default function InsurersPageClient() {
  const [tab, setTab] = useState<TabValue>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Insurer | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("favoriteInsurers");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(
          parsed.filter((v) => typeof v === "string") as string[]
        );
      }
    } catch {
      // localStorage 사용 실패/파싱 오류는 조용히 무시
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "favoriteInsurers",
        JSON.stringify(favoriteIds)
      );
    } catch {
      // 무시
    }
  }, [favoriteIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INSURERS.filter((ins) => {
      if (tab !== "all" && ins.kind !== tab) return false;
      if (!q) return true;
      return ins.name.toLowerCase().includes(q);
    });
  }, [query, tab]);

  // 즐겨찾기된 항목을 항상 상단에 노출 (필터 버튼으로 '즐겨찾기만' 보기 가능)
  const visible = useMemo(() => {
    if (favoritesOnly) {
      return filtered.filter((ins) => favoriteIdSet.has(ins.id));
    }

    const favs: Insurer[] = [];
    const rest: Insurer[] = [];
    for (const ins of filtered) {
      if (favoriteIdSet.has(ins.id)) favs.push(ins);
      else rest.push(ins);
    }
    return [...favs, ...rest];
  }, [filtered, favoriteIdSet, favoritesOnly]);

  const toggleFavorite = (insurerId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(insurerId)
        ? prev.filter((id) => id !== insurerId)
        : [...prev, insurerId]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="shrink-0 text-xl font-bold text-zinc-950 dark:text-zinc-50 sm:text-2xl">
              보험사 정보
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              생보사/손보사 정보를 한눈에 확인하세요.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="w-full sm:w-80">
              <label htmlFor="insurerSearch" className="sr-only">
                보험사 이름 검색
              </label>
              <input
                id="insurerSearch"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="보험사 이름 검색"
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "전체"],
                ["life", "생보"],
                ["nonlife", "손보"],
              ] as Array<[TabValue, string]>
            ).map(([value, label]) => {
              const active = tab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-zinc-950 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black"
                      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            data-testid="favorites"
            onClick={() => setFavoritesOnly((v) => !v)}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              favoritesOnly
                ? "border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
            ].join(" ")}
          >
            <span aria-hidden="true" className={favoritesOnly ? "text-amber-500" : "text-zinc-400"}>
              {favoritesOnly ? "★" : "☆"}
            </span>
            즐겨찾기
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visible.map((ins) => (
            <button
              key={ins.id}
              type="button"
              onClick={() => setSelected(ins)}
              className={`group rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-colors transition hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md active:scale-[0.99] active:border-zinc-400 active:bg-zinc-100/60 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:active:border-zinc-600 dark:active:bg-zinc-800 dark:focus-visible:ring-zinc-50/20 ${
                selected?.id === ins.id
                  ? "border-2 border-zinc-950 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/40"
                  : ""
              }`}
            >
              <InsurerLogo name={ins.name} homepageUrl={ins.homepageUrl} />
              <div className="mt-3 grid grid-cols-[1fr_auto] items-start gap-x-3">
                <div className="space-y-1">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                      kindBadgeClass(ins.kind),
                    ].join(" ")}
                  >
                    {kindLabel(ins.kind)}
                  </span>

                  <div className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {ins.name}
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.62 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.18a2 2 0 0 1 2.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{ins.callCenter}</span>
                    </div>
                  </div>
                </div>

                {/* 콜센터(마지막 줄)와 같은 높이의 우측 끝에 배치 */}
                <div className="self-end justify-self-end">
                  <span
                    role="img"
                    aria-label="즐겨찾기 토글"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(ins.id);
                    }}
                    className={`select-none text-lg leading-none transition-colors ${
                      favoriteIdSet.has(ins.id)
                        ? "text-amber-500"
                        : "text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-400 dark:group-hover:text-zinc-200"
                    }`}
                  >
                    {favoriteIdSet.has(ins.id) ? "★" : "☆"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            검색 결과가 없습니다.
          </div>
        )}
      </main>

      <Modal
        open={!!selected}
        title={selected ? `${selected.name} 상세정보` : "보험사 상세정보"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                      kindBadgeClass(selected.kind),
                    ].join(" ")}
                  >
                    {kindLabel(selected.kind)}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {selected.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                닫기
              </button>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                콜센터
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                {selected.callCenter}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                바로가기
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <LinkButton href={selected.homepageUrl} variant="homepage">
                  홈페이지
                </LinkButton>
                <LinkButton href={selected.termsUrl} variant="terms">
                  약관
                </LinkButton>
                <LinkButton href={selected.claimsUrl} variant="claims">
                  보험금청구
                </LinkButton>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

