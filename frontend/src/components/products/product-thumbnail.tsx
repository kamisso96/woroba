import { getImageUrl } from '@/lib/api';

export function ProductThumbnail({
  name,
  imageUrl,
  size = 'md',
}: {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8 text-[10px]'
      : size === 'lg'
      ? 'h-14 w-14 text-sm'
      : 'h-10 w-10 text-xs';

  const fullUrl = getImageUrl(imageUrl);

  if (fullUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fullUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-lg object-cover`}
      />
    );
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hues = [155, 200, 250, 300, 30, 60];
  const hue = hues[name.charCodeAt(0) % hues.length];

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-lg font-semibold`}
      style={{
        backgroundColor: `oklch(0.72 0.15 ${hue} / 0.15)`,
        color: `oklch(0.55 0.18 ${hue})`,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
