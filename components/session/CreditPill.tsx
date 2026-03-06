'use client'

interface Props {
  credits: number
  maxCredits?: number
}

export default function CreditPill({ credits, maxCredits = 15 }: Props) {
  const percentage = (credits / maxCredits) * 100
  const color =
    credits <= 0 ? 'text-red-400' :
    percentage <= 20 ? 'text-amber-400' :
    'text-emerald-400'

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full glass text-sm font-mono ${color}`}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.172a7.36 7.36 0 010-1H10a1 1 0 100-2H8.315c.126-.354.275-.672.421-.821z" />
      </svg>
      {credits}
    </div>
  )
}
