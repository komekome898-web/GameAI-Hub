/** The shared analytics observer records play links without enlarging the deck chunk. */
export function GamePlayLink({ href, slug, placement }: { href: string; slug: string; placement: "card" | "top" | "bottom" }) {
  return <a className="button" href={href} target="_blank" rel="noopener noreferrer" data-game-play={slug} data-game-placement={placement}>遊ぶ<span className="sr-only">（外部サイト・新しいタブ）</span><span aria-hidden="true"> ↗</span></a>;
}
