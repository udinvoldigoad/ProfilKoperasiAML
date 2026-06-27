"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { GalleryItem } from "@/types";

export function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, pointerId: 0 });
  const [canScroll, setCanScroll] = useState({ prev: false, next: items.length > 1 });

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScroll({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft < maxScrollLeft - 4
    });
  }

  function scrollGallery(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector("figure");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.getBoundingClientRect().width : el.clientWidth * 0.82;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
    window.setTimeout(updateScrollButtons, 360);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items.length]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: event.pointerId
    };
    el.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    const state = dragState.current;
    if (!el || !state.active) return;
    event.preventDefault();
    el.scrollLeft = state.scrollLeft - (event.clientX - state.startX);
  }

  function endDrag() {
    const el = scrollRef.current;
    const state = dragState.current;
    if (el && state.active && el.hasPointerCapture(state.pointerId)) {
      el.releasePointerCapture(state.pointerId);
    }
    dragState.current.active = false;
  }

  return (
    <Reveal className="relative mt-8">
      {canScroll.prev ? (
        <button
          type="button"
          aria-label="Geser galeri ke kiri"
          onClick={() => scrollGallery(-1)}
          className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white text-primary shadow-soft transition hover:-translate-x-0.5 hover:bg-surface-gray md:flex"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="scrollbar-none -mx-4 cursor-grab overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:-mx-6 sm:px-6 md:mx-0 md:px-12 lg:px-14"
      >
        <div className="flex snap-x snap-mandatory gap-4 sm:gap-5">
          {items.map((item) => (
            <figure
              key={item.id}
              className="group relative min-w-[82vw] snap-start overflow-hidden rounded-2xl border border-border-subtle bg-surface-gray shadow-soft sm:min-w-[22rem] md:min-w-[26rem] lg:min-w-[30rem]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                draggable={false}
                className="aspect-[4/3] w-full select-none object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur sm:text-xs">
                  {item.category}
                </span>
                <h3 className="mt-2 text-base font-bold leading-tight text-white sm:text-lg">{item.title}</h3>
                <p className="mt-1 hidden max-w-md text-sm leading-5 text-white/85 sm:block">{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {canScroll.next ? (
        <button
          type="button"
          aria-label="Geser galeri ke kanan"
          onClick={() => scrollGallery(1)}
          className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white text-primary shadow-soft transition hover:translate-x-0.5 hover:bg-surface-gray md:flex"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      ) : null}
    </Reveal>
  );
}