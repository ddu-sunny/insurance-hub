"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Insurer, InsurerKind } from "../insurers-data";
import { INSURERS } from "../insurers-data";

type TabValue = "all" | InsurerKind;

function kindLabel(kind: InsurerKind) {
  return kind === "life" ? "생보사" : "손보사";
}

function kindBadgeClass(kind: InsurerKind) {
  // 요구사항: 생보사 파란색, 손보사 주황색
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
      ? "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-white dark:text-blue-300 dark:hover:bg-blue-950/30"
      : variant === "terms"
        ? "border-green-200 bg-white text-green-700 hover:bg-green-50 dark:border-green-900 dark:bg-white dark:text-green-300 dark:hover:bg-green-950/30"
        : "border-orange-200 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:bg-white dark:text-orange-300 dark:hover:bg-orange-950/30";

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INSURERS.filter((ins) => {
      if (tab !== "all" && ins.kind !== tab) return false;
      if (!q) return true;
      return ins.name.toLowerCase().includes(q);
    });
  }, [query, tab]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="shrink-0 text-xl font-bold text-zinc-950 dark:text-zinc-50 sm:text-2xl">
              보험사 정보
            </h1>
            <p className="mt-1 w-full whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
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

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["all", "전체"],
              ["life", "생보사"],
              ["nonlife", "손보사"],
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

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filtered.map((ins) => (
            <button
              key={ins.id}
              type="button"
              onClick={() => setSelected(ins)}
              className="group rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <InsurerLogo name={ins.name} homepageUrl={ins.homepageUrl} />
              <div className="mt-2 flex items-start justify-between gap-3">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                    kindBadgeClass(ins.kind),
                  ].join(" ")}
                >
                  {kindLabel(ins.kind)}
                </span>

                <span className="text-xs font-semibold text-zinc-500 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-50">
                  자세히보기
                </span>
              </div>

              <div className="mt-3">
                <div className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {ins.name}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  콜센터 {ins.callCenter}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
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

